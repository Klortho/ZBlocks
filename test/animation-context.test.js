'use strict';

// This is chai with a custom assertion
const assert = require('./assert-close-enough.js');
const AC = require('../src/animation-context.js');
const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('../src/point.js');
const R = require('ramda');


const IDENTITY = new Matrix();

// This assertion checks any subset of properties of an object. Whatever
// properties are defined on `expected` are checked, others are not.
assert.propsMatch = function(actual, expected, message) {
  const msg = function(_msg) {
    return _msg + (typeof message === 'undefined' ? '' : ': ' + message);
  }

  Object.keys(expected).forEach(k => {
    assert.equal(typeof actual[k], typeof expected[k], 
      msg('Value types don\'t match for key ' + k));
    if (typeof expected[k] === 'object' && expected[k] != null) {
      assert.propsMatch(actual[k], expected[k], msg('For key ' + k));
    } 
    else {
      assert.equal(actual[k], expected[k], msg('For key ' + k));
    }
  })
}

// This is specifically for asserting things about AnimationContexts
assert.ACMatch = function(actual, expected) {
  Object.keys(expected).forEach(function(k) {
    const matches = (...list) => list.indexOf(k) != -1;

    if (matches('prev')) {
      assert.strictEqual(actual[k], expected[k], 
        `${k} is not strictly equal to the expected value ${expected[k]}`);
    }
    else if (matches('i', 'isRoot', 't', 'time', 'isLoop')) {
      assert.equal(actual[k], expected[k], 
        `${k} is not equal to the expected value ${expected[k]}`);
    }
    else if (matches('matrix')) {
      assert.isOk(actual[k].isEqual(expected[k]), 
        `${k} assertion failed. Actual: ${actual[k]}; expected ${expected[k]}`);
    }
  });
}




// FIXME: these tests aren't working yet:
/*

function pointsEqual(p0, p1) {
  const msg = `point received ${p0} does not equal expected ${p1}`;
  assert.closeEnough(p0.x, p1.x, msg);
  assert.closeEnough(p0.y, p1.y, msg);
}

// Return a sample animation context for testing.
function sampleAC() {
  return new AnimationContext()
    .scale({t: 1}, 2, 2)
    .rotateDeg({t: 7}, 135)
    .rotateDeg({t: 1}, 45)
    .rotateDeg({t: 1}, 45)
    .shearX({t: 3}, 2);
}
*/



describe('AnimationContext class', function() {

  it('has expected constructors', function () {
    var ac;

    ac = new AC();
    assert.propsMatch(ac, {
      i: 0,
      isLoop: false,
      isRoot: true,
      prev: null,
      time: 0,
      matrix: {
        a: 1,
        b: 0, 
        c: 0,
        d: 1, 
        e: 0,
        f: 0,
      }
    });

    ac = new AC({from: [1, 0, 0, 2, 0, 0]});
    assert.propsMatch(ac, {
      i: 0,
      isLoop: false,
      isRoot: true,
      prev: null,
      time: 0,
      matrix: {
        a: 1,
        b: 0, 
        c: 0,
        d: 2, 
        e: 0,
        f: 0,
      }
    });

    ac = new AC({scaleU: [2]});
    assert.propsMatch(ac, {
      i: 0,
      isLoop: false,
      isRoot: true,
      prev: null,
      time: 0,
      matrix: {
        a: 2,
        b: 0, 
        c: 0,
        d: 2, 
        e: 0,
        f: 0,
      }
    });

    ac = new AC();
    assert.ACMatch(ac, {
      i: 0,
      prev: null,
      isLoop: false, 
      isRoot: true,
      t: 0,
      time: 0,
      matrix: IDENTITY,
    });

    // Test the shortcut for creating a two-chain AC (this is the zoomer):
    ac = new AC({t: 1, scaleU: [1.1]})
    assert.ACMatch(ac, {
      i: 1,
      isLoop: false, 
      isRoot: false,
      t: 1,
      time: 1,
      matrix: (new Matrix()).scaleU(1.1),
    });
  })


  it('can chain', function () {
    var ac0 = new AC();
    var ac1 = ac0.scaleU({t:1}, 2);
    var ac2 = ac1.scaleU({t:2}, 3);

    assert.ACMatch(ac0, {
      i: 0,
      prev: null,
      isLoop: false, 
      isRoot: true,
      t: 0,
      time: 0,
      matrix: IDENTITY,
    });
    assert.ACMatch(ac1, {
      i: 1,
      prev: ac0,
      isLoop: false, 
      isRoot: false,
      t: 1,
      time: 1,
      matrix: (new Matrix()).scaleU(2),
    });
    assert.ACMatch(ac2, {
      i: 2,
      prev: ac1,
      isLoop: false, 
      isRoot: false,
      t: 2,
      time: 3,
      matrix: (new Matrix()).scaleU(6),
    });



  });

// FIXME: these tests aren't working yet:
/*

  it('can scale', function() {
    const ac = new AnimationContext();
    const double = ac.scaleU(1, 2);
    const expDouble = Matrix.from(2, 0, 0, 2, 0, 0);
    checkAnimationContext(double, {
      prev: ac,
      isRoot: false,
      t: 1,
      time: 1,
      matrix: expDouble,
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
      t: 1,
      time: 1,
      matrix: embiggen,
    });


    const rotate_135 = (new Matrix()).rotateDeg(135);
    checkAnimationContext(ac2, {
      prev: ac1,
      isRoot: false,
      t: 7,
      time: 8,
      matrix: rotate_135,
    });

    const rotate_45 = (new Matrix()).rotateDeg(45);
    checkAnimationContext(ac3, {
      prev: ac2,
      isRoot: false,
      t: 1,
      time: 9,
      prevStop: ac2,
      matrix: rotate_45,
    });

    const rotate_90 = rotate_45.clone().rotateDeg(45);
    checkAnimationContext(ac4, {
      prev: ac3,
      isRoot: false,
      t: 1,
      time: 10,
      matrix: rotate_45,
    });

    const shear = (new Matrix()).shearX(2);
    const stopProd5 = rotate_90.clone().multiply(shear); 
    checkAnimationContext(ac5, {
      prev: ac4,
      isRoot: false,
      t: 3,
      time: 13,
      matrix: shear,
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
        expect: [4, 4] },
      { time: 11,
        expect: [4, 5] },
      { time: 12,
        expect: [4, 5] },
    ];

    const ac = sampleAC();
    const gcs = ac.graphicalContexts();
    const matchingPair = AnimationContext.matchingPair;

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
        expected: new Point(193.1022469646483, 589.4082663394669), },
      { time: 8,
        expected: new Point(-282.842712474619, -141.42135623730948), },
      { time: 10,
        expected: new Point(-141.42135623730948, 282.842712474619), },
    ];

    const ac = sampleAC();
    const gcs = ac.graphicalContexts();
    const matchingPair = AnimationContext.matchingPair;

    tests.forEach((test, i) => {
      const p1 = ac.applyToEvent(p0, test.time);
      pointsEqual(p1, test.expected);
    });

  });
*/
});

