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
  assert.closeEnough(p0.x, p1.x);
  assert.closeEnough(p0.y, p1.y);
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
});
