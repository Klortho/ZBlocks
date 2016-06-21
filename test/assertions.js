// Adds some custom assertions, including `close-enough`, to chai library. 
// This re-exports the enhanced "assert", so you can use it like this:
//   const assert = require('./assertions.js');

'use strict';

const assert = require('chai').assert;
const Matrix = require("transformation-matrix-js").Matrix;
const utils = require('../src/utils.js');

const almostEqual = utils.almostEqual;
const nearlyEqual = utils.nearlyEqual;


assert.almostEqual = function(actual, expected, message) {
  assert.ok(almostEqual(actual, expected), 'almostEqual failed; actual: ' +
    actual + ', expected: ' + expected + '; ' + message);
}

assert.nearlyEqual = function(actual, expected, message) {
  assert.ok(nearlyEqual(actual, expected), message);
}

// Two points are "close enough". This tests (a bit redundantly) that both
// cartesian and polar coordinates match; and also tests the p.equals method
assert.pointsEqual = function(actual, expected, message) {
  ['x', 'y', 'r', 'a'].forEach(key => {
    assert.nearlyEqual(actual[key], expected[key], 'point ' +
      key + ' not equal: ' + message);
  });
  assert.ok(actual.equals(expected), 'Assertion failed: actual.equals, ' +
    'not so much. actual: ', actual + ', expected: ', expected);
};

assert.pointsNotEqual = function(actual, expected, message) {
  assert.notOk(actual.equals(expected));
};


// Two Matrices are "close-enough"
assert.matricesEqual = function(actual, expected, message) {
  assert.instanceOf(actual, Matrix, 'actual should be an instance of Matrix');
  assert.instanceOf(expected, Matrix, 'expected should be an instance of Matrix');
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(key => {
    assert.nearlyEqual(actual[key], expected[key], 'Matrix component ' +
      key + ': actual: ' + actual[key] + ' doesn\'t equal expected: ' + 
      expected[key] + '; ' + message);
  });
};

//-----------------------------------------------------------------------
module.exports = assert;
