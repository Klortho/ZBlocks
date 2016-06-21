'use strict';
// This is chai with a custom assertion
const assert = require('./assertions.js');
const utils = require('../src/utils.js');


describe('almostEqual and friends', function() {
  const almostEqual = utils.almostEqual;
  const DBL_EPSILON = utils.DBL_EPSILON;
  const nearlyEqual = utils.nearlyEqual;
  const FLT_EPSILON = utils.FLT_EPSILON;

  it('should recognize when two numbers are exactly the same', function() {
    assert.equal(almostEqual(5, 5), true);
    assert.equal(nearlyEqual(5, 5), true);
  });

  it('should report correctly', function() {
    assert.equal(almostEqual(5+DBL_EPSILON, 5), true);
    assert.equal(almostEqual(5+FLT_EPSILON, 5), false,
      'FLT_EPSILON is not close enough');

    assert.equal(nearlyEqual(5+DBL_EPSILON, 5), true);
    assert.equal(nearlyEqual(5+FLT_EPSILON, 5), true,
      'FLT_EPSILON should be okay');
    assert.equal(nearlyEqual(5+FLT_EPSILON*10, 5), false,
      'FLT_EPSILON is too far');
    assert.equal(nearlyEqual(500+FLT_EPSILON*10, 500), true,
      'FLT_EPSILON is not so far now');
  });

  it('almostEqual works with small and negative numbers, too', function() {
    const SMALLER = 0.9 * DBL_EPSILON;
    const BIGGER = 1.1 * DBL_EPSILON;

    assert.equal(almostEqual(0, SMALLER), true, 'close to zero');
    assert.equal(almostEqual(0, BIGGER), false, 'less close to zero');
    assert.equal(almostEqual(SMALLER, -SMALLER), false, 'mind the gap');

    assert.equal(almostEqual(100 + 100 * SMALLER, 100), true);
    assert.equal(almostEqual(100 + 100 * BIGGER, 100), false);
  });

  it('nearlyEqual works with small and negative numbers, too', function() {
    const SMALLER = 0.9 * FLT_EPSILON;
    const BIGGER = 1.1 * FLT_EPSILON;

    assert.equal(nearlyEqual(0, SMALLER), true, 'close to zero');
    assert.equal(nearlyEqual(0, BIGGER), false, 'less close to zero');
    assert.equal(nearlyEqual(SMALLER, -SMALLER), false, 'mind the gap');

    assert.equal(nearlyEqual(100 + 100 * SMALLER, 100), true);
    assert.equal(nearlyEqual(100 + 100 * BIGGER, 100), false);
  });

});


describe('Number.mod', function() {
  const mod = utils.mod;
  
  it('should work as before for positive numbers', function() {
    assert.equal(mod(3, 10), 10 % 3);
    assert.equal(mod(5, 21.5), 21.5 % 5);
    assert.equal(mod(3.1, 100), 100 % 3.1);
    assert.equal(mod(5.8889, 77.9847), 77.9847 % 5.8889);
  });

  it('should work correctly for negative numbers', function() {
    assert.equal(mod(3, -10), 2);
    assert.equal(mod(5, -21.5), 3.5);
    assert.equal(mod(589, -2.9847), 586.0153);
  });
});

describe('coordinate conversions', function() {

  it('degToRad should work consistently', function() {
    const degToRad = utils.degToRad;
    assert.nearlyEqual(degToRad(0), 0);
//    assert.nearlyEqual(degToRad(45), 0.78539816339745);
//    assert.nearlyEqual(degToRad(180), 3.141592653589793);
//    assert.nearlyEqual(degToRad(187), 3.26376570122878);
//
//    // always return a value between 0 <= rad < 2pi
//    assert.nearlyEqual(degToRad(-173), 3.26376570122878);
//    assert.nearlyEqual(degToRad(547), 3.26376570122878);
  });
/*
  it('radToDeg should work consistently', function() {
    const radToDeg = utils.radToDeg;
    assert.nearlyEqual(radToDeg(3.26376570122878), 187);
    assert.nearlyEqual(radToDeg(-3.01941960595081), 187);
    assert.nearlyEqual(radToDeg(2.35619449019235), 135);
    assert.nearlyEqual(radToDeg(5.49778714378214), 315);
  });
*/
});

/* FIXME: need a test here
describe('time / now', function() {
});
*/
