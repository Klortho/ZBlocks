// Adds `close-enough` to chai assertion library. This re-exports "assert", so
// you can use it like this:
//   const assert = require('./assert-close-enough.js');
'use strict';

const assert = require('chai').assert;

assert.closeEnough = function(actual, expected, message) {
  const scale = Math.abs(actual)/2 + Math.abs(expected)/2;
  if (scale === 0) return true;  // guard against dividing by zero
  const epsilon =  Math.abs(actual - expected) / scale;
  if (epsilon < 1E-13) return true;
  assert.fail(actual, expected, message, 'closeEnough');
};

// Export in node.js environments
if (typeof module === 'object') {
  module.exports = assert;

// To test: `node assert-close-enough.js --test`
  if (typeof process === 'object' && process && 'argv' in process) {
    const argv = process.argv;
    if (argv.pop() === '--test') {
      console.log('Testing ...');
      const cases = [2.3453434E23, 2.3453434E-23, 0.5];
      cases.forEach(function (expected) {
        actual = Math.exp(Math.log(expected));
        assert.closeEnough(expected, actual,
          'not closeEnough; expected: ' + expected + ', actual: ' + actual);
      });
      console.log('all good');
    }
  }
}
