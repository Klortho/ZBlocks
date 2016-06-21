// Point class - This is used to represent drawing coordinates, both absolute
// and relative.
// This follows the Snap! coordinate system:
// - x increases to the right, y increases going up.
// - angles are in degrees
// - up is 0 deg; right is 90 deg, etc.

'use strict';

const utils = require('./utils.js');
const isObject = utils.isObject;
const R = require('ramda');

const π = Math.PI;
const has = R.has;
const degToRad = utils.degToRad;
const radToDeg = utils.radToDeg;
const normAngle = utils.mod(360);
const normAngleRad = utils.mod(2 * Math.PI);

const nearlyEqual = utils.nearlyEqual;

// Points are stored internally as either cartesian or polar (with angles in
// radians, and lazily converted as needed. 

class Point {

  // Constructor args can be any of:
  // - `()` - the origin
  // - `(x[, y])`
  // - `({x: 3, y: 2})` - cartesian. Leave out either `x` or `y` (or both)
  // - `({r: 6, a: 1})` - polar. Leave out either `r` or `a` (but not both)
  // The arguments specify either x,y or r,a coordinates, never a mix.

  constructor(...args) {
    // If we were passed a single object, assign it
    const argObj = 
        args.length === 1 && R.is(Object, args[0]) ? args[0] 
      : { x: args[0], y: args[1] };

    // True if we were passed cartesian coords
    const cartesian = has('x', argObj) || has('y', argObj);

    if (cartesian) {
      this._x = R.defaultTo(0, argObj.x); 
      this._y = R.defaultTo(0, argObj.y); 
    }
    else {  // polar
      this._r = R.defaultTo(0, argObj.r);
      if (this._r < 0) throw RangeError('Radius can\'t be negative');

      this._aRadians = this._r === 0 ? 0 
        : R.compose(degToRad, R.defaultTo(0))(argObj.a);
    }
  }

  get x() {
    if (R.isNil(this._x)) this._x = this._r * Math.sin(this.aRadians);
    return this._x;
  }
  get y() {
    if (R.isNil(this._y)) this._y = this._r * Math.cos(this.aRadians);
    return this._y;
  }

  get r() {
    if (R.isNil(this._r))
      this._r = Math.sqrt( utils.sq(this._x) + utils.sq(this._y) );
    return this._r;
  }

  get a() { return radToDeg(this.aRadians); }

  // angle (direction), in radians.
  get aRadians() {
    if (R.isNil(this._aRadians)) 
      this._aRadians = Point.angleRad(this._x, this._y);
    return this._aRadians;
  }

  // Convenience methods to get just the two coordinates (either
  // cartesian or polar) with very easy customization. These return
  // plain JS objects, not Point instances.
  get polar() {
    return {r: this.r, a: this.a};
  }
  get cartesian() {
    return {x: this.x, y: this.y};
  }

  clone() {
    return Point.from(this);
  }

  // This uses a fuzzy equals, suitable for comparing floats.
  equals(p) {
    return nearlyEqual(this.x, p.x) && nearlyEqual(this.y, p.y);
  }
}

// Factory function (clone a point)
Point.from = function(p0) {
  return new Point(p0.x, p0.y);
}

// Some helper class methods
Point.degToRad = utils.degToRad;
Point.radToDeg = utils.radToDeg;

// The angle in radians from the origin to the point x, y
Point.angleRad = (x, y) =>
  // Avoid division by zero; three possibilities for x
    y === 0 ? x < 0 ? 3 * π / 2 : x === 0 ? 0 : π / 2
  // When y is not zero, compute arctan, then adjust for sign
  : Math.atan(x/y) + π * (y < 0 ? 1 : x < 0 ? 2 : 0);

// Angle in degrees from origin to the point x, y
Point.angle = R.compose(Point.radToDeg, Point.angleRad);

// Normalize an angle in degrees, such that it's always 0 <= angle < 360
Point.normAngle = normAngle;

// Normalize an angle in radians, so that it's 0 <= rads < 2 * PI
Point.normAngleRad = normAngleRad;

module.exports = Point;
