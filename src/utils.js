// Some utilities
'use strict';

const R = require('ramda');
const abs = Math.abs;
const min = Math.min;


/*
  Here are some utilities that are *not* here, and what to use instead

  To extend a list of objects, use R.mergeAll()

  For type-checking, use
    - R.is(<constructor>)
    - R.isEmpty
    - R.isNill - true if null or undefined
    - R.isArrayLike
*/

//----------------------------------------------------------------------
// Math

// A better modulo operator (see
// http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving).
// This adds a method to the Number built-in.
const mod = R.curry(function(n, m) {
  return ((m % n) + n) % n;
});

// square of a number
const sq = x => Math.pow(x, 2);

// Degrees to radians
const degToRad = deg => mod(2 * Math.PI)(deg * Math.PI / 180);

// Radians to degrees
const radToDeg = rad => mod(360)(rad * 180 / Math.PI);


//----------------------------------------------------------------------
// almostEqual and friends - adapted from
// https://github.com/scijs/almost-equal/blob/master/almost_equal.js

// Function that take an absolute and relative error margin, and returns a
// comparator
const epsilonComparator = function(absErr, relErr) {
  return R.curry(function(a, b) {
    if (a == b) return true;    
    const diff = abs(a - b);
    return (diff <= absErr) || (diff <= relErr * min(abs(a), abs(b)));
  });
};

// almostEqual has the absolute and relative error at DBL_EPSILON -- 
// a very strict constraint. 
const DBL_EPSILON = 2.2204460492503131e-16;
const almostEqual = epsilonComparator(DBL_EPSILON, DBL_EPSILON);

// nearlyEqual is a bit looser
const FLT_EPSILON = 1.19209290e-7;
const nearlyEqual = epsilonComparator(FLT_EPSILON, FLT_EPSILON);


//----------------------------------------------------------------------
// Time

// Get the current time, in seconds
const now = function() {
  return Date.now() / 1000;
};


//----------------------------------------------------------------------
module.exports = {
  almostEqual,
  DBL_EPSILON,
  degToRad,
  epsilonComparator,
  FLT_EPSILON,
  mod,
  nearlyEqual,
  now,
  radToDeg,
  sq,
};
