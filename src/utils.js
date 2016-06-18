// Some utilities
'use strict';

// Lightweight (shallow) extend for options, for now. Returns a copy - mutates
// nothing
const assign = function(acc, cur) {
  return (typeof cur !== 'object' || cur == null) ? acc :
    Object.assign(acc, cur);
};

const extend = (...args) => args.reduce(assign, {});

// Some type-checking / validation
const isNull = v => v == null;
const notNull = v => !isNull(v);
const isNumber = n => typeof n === 'number';
const isObject = obj => (notNull(obj) && typeof obj === 'object');
const isNullOrNumber = v => isNull(v) || isNumber(v);

// Math

// square of a number
const sq = x => Math.pow(x, 2);

// Degrees to radians
const degToRad = deg => deg * Math.PI / 180;

// Radians to degrees
const radToDeg = rad => rad * 180 / Math.PI;


// Time

// Get the current time, in seconds, with a fractional part that includes
// millis
const now = function() {
  var d = new Date();
  return d.getTime() / 1000;
};



module.exports = {
  assign,
  degToRad,
  extend,
  isNull,
  notNull,
  isNumber,
  isObject,
  isNullOrNumber,
  now,
  radToDeg,
  sq,
};
