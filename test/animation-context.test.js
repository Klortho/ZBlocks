'use strict';

// This is chai with a custom assertion
const assert = require('./assert-close-enough.js');
const AnimationContext = require('../src/animation-context.js');
const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('../src/point.js');
const R = require('ramda');


function checkAnimationContext(actual, criteria) {
  Object.keys(criteria).forEach(function(k) {
    const matches = (...list) => list.indexOf(k) != -1;

    if (matches('prev', 'prevStop')) {
      assert.strictEqual(actual[k], criteria[k], 
        `${k} is not strictly equal to the expected value ${criteria[k]}`);
    }
    else if (matches('isRoot', 'isStop', 'relTime', 'time')) {
      assert.equal(actual[k], criteria[k], 
        `${k} is not equal to the expected value ${criteria[k]}`);
    }
    else if (matches('matrix', 'stopProduct', 'product')) {
      assert.isOk(actual[k].isEqual(criteria[k]), 
        `${k} assertion failed. Actual: ${actual[k]}; expected ${criteria[k]}`);
    }
  });
}

function pointsEqual(p0, p1) {
  const msg = `point received ${p0} does not equal expected ${p1}`;
  assert.closeEnough(p0.x, p1.x, msg);
  assert.closeEnough(p0.y, p1.y, msg);
}

// Return a sample animation context for testing.
function sampleAC() {
  return new AnimationContext()
    .scale(1, 2, 2)
    .rotateDeg(7, 135)
    .rotateDeg(1, 45)
    .rotateDeg(1, 45)
    .shearX(3, 2);
}


describe('AnimationContext class', function() {
  it('can be constructed as the root of the chain', function () {
    const ac = new AnimationContext();
    const identity = new Matrix();

    checkAnimationContext(ac, {
      prev: null,
      isRoot: true,
      relTime: 0,
      time: 0,
      isStop: true,
      prevStop: null,
      matrix: identity,
      stopProduct: identity,
      product: identity,
    });
  })

  it('can scale', function() {
    const ac = new AnimationContext();
    const double = ac.scaleU(1, 2);
    const expDouble = Matrix.from(2, 0, 0, 2, 0, 0);
    checkAnimationContext(double, {
      prev: ac,
      isRoot: false,
      relTime: 1,
      time: 1,
      isStop: true,
      prevStop: ac,
      matrix: expDouble,
      stopProduct: expDouble,
      product: expDouble,
    });
  });


  it ('can transform a point\'s coordinates', function() {
    const ac = new AnimationContext();
    const tp0 = new Point(0, 100);
    const p1 = ac.applyToPoint(tp0);
    pointsEqual(p1, tp0);
  })

  it ('can scale by a factor of two', function() {
    const ac0 = new AnimationContext();
    const ac1 = ac0.scale(1, 2, 2);
    const p1 = ac1.applyToPoint(new Point(10, 100));
    pointsEqual(p1, new Point(20, 200));
  });

  it ('can store a chain of transformations', function() {
    const ac = sampleAC();
    assert.instanceOf(ac, AnimationContext);
    const chain = ac.graphicalContexts();
    assert.isArray(chain);
    assert.equal(chain.length, 6);

    const [ac0, ac1, ac2, ac3, ac4, ac5] = chain;

    const embiggen = (new Matrix()).scale(2, 2);
    checkAnimationContext(ac1, {
      prev: ac0,
      isRoot: false,
      relTime: 1,
      time: 1,
      isStop: true,
      prevStop: ac0,
      matrix: embiggen,
      stopProduct: embiggen,
      product: embiggen,
    });

    const rotate_45 = (new Matrix()).rotateDeg(45);
    const product2 = embiggen.clone();
    product2.multiply(rotate_45);
    checkAnimationContext(ac2, {
      prev: ac1,
      isRoot: false,
      relTime: 7,
      time: 8,
      isStop: true,
      prevStop: ac1,
      matrix: rotate_45,
      stopProduct: rotate_45,
      product: product2,
    });

    const product3 = product2.clone().multiply(rotate_45);
    checkAnimationContext(ac3, {
      prev: ac2,
      isRoot: false,
      relTime: 0,
      time: 8,
      isStop: false,
      prevStop: ac2,
      matrix: rotate_45,
      stopProduct: rotate_45,
      product: product3,
    });

    const rotate_90 = rotate_45.clone().rotateDeg(45);
    const product4 = product3.clone().multiply(rotate_45);
    checkAnimationContext(ac4, {
      prev: ac3,
      isRoot: false,
      relTime: 0,
      time: 8,
      isStop: false,
      prevStop: ac2,
      matrix: rotate_45,
      stopProduct: rotate_90,
      product: product4,
    });

    const shear = (new Matrix()).shearX(2);
    const stopProd5 = rotate_90.clone().multiply(shear); 
    const product5 = product4.clone().multiply(shear);
    checkAnimationContext(ac5, {
      prev: ac4,
      isRoot: false,
      relTime: 3,
      time: 11,
      isStop: true,
      prevStop: ac2,
      matrix: shear,
      stopProduct: stopProd5,
      product: product5,
    });
  })

  it ('can get the right pair of graphical contexts', function() {
    // Test cases. Given the value for time, we'll check that the matchingPair
    // routine finds the expected pair of gc's to use for interpolation.
    const tests = [
      { time: 0,
        expect: [0, 0] },
      { time: 0.8,
        expect: [0, 1] },
      { time: 1,
        expect: [1, 1] },
      { time: 1.1,
        expect: [1, 2] },
      { time: 7.9,
        expect: [1, 2] },
      { time: 8,
        expect: [2, 2] },
      { time: 10,
        expect: [2, 5] },
      { time: 11,
        expect: [5, 5] },
      { time: 12,
        expect: [2, 5] },
    ];

    const ac = sampleAC();
    const gcs = ac.graphicalContexts();
    const matchingPair = AnimationContext.matchingPair;

    const printGC = gc => console.log('gc #' + gc.i);

    tests.forEach((test, i) => {
      const pair = matchingPair(ac._lastPair(), test.time);
      assert.strictEqual(pair[0], gcs[test.expect[0]]);
      assert.strictEqual(pair[1], gcs[test.expect[1]]);
    })
  });

  it ('can interpolate a transformation over time', function() {
    const p0 = new Point(100, 300);
    const tests = [
      { time: 0, 
        expected: new Point(100, 300), },
      { time: 0.8,
        expected: new Point(180, 540), },
      { time: 1,
        expected: new Point(200, 600), },
      { time: 1.1,
        expected: new Point(191.8751714214514, 597.90470899715), },
      // FIXME: these are wrong:
      { time: 7.9,
        expected: new Point(-140.21387682426268, 288.4746431947159), },
      { time: 8,
        expected: new Point(-141.42135623730948, 282.842712474619), },
      { time: 10,
        expected: new Point(18.946869098150586, 315.65965239697255), },
      { time: 11,
        expected: new Point(700, 300), },
      { time: 12,
        expected: new Point(174.23829615966304, 263.8958433764684), },
    ];

    const ac = sampleAC();
    const gcs = ac.graphicalContexts();
    const matchingPair = AnimationContext.matchingPair;

    tests.forEach((test, i) => {
      const p1 = ac.applyToEvent(p0, test.time);
      console.log('result of interpolated xform: ', p1);
      pointsEqual(p1, test.expected);
    });

  });
});
