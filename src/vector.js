// Vector class - This is an unresolved relative vector (distance and 
// direction). When resolved against the origin, it becomes a Point.
'use strict';

const utils = require('./utils.js');
const R = require('ramda');

class Vector {

  // Ways to construct an Vector:
  // - `x, y`
  // - `{x: 3, y: 2}`  (cartesian)
  // - `{r: 6, a: 1}`  (polar)

  constructor(...args) {
    // Either (x, y) or (r, a) must be defined. The other set is evaluated
    // late, if needed
    var x = null,
        y = null,
        r = null,
        a = null;

    if (args.length === 1) {
      const arg = args[0];
      if (utils.isObject(arg)) {
        if ('x' in arg && 'y' in arg) {
          ({x, y} = arg);
        }
        else if ('r' in arg && 'a' in arg) {
          ({r, a} = arg);
        }
      }
    }
    else if (args.length === 2) {
      x = args[0];
      y = args[1];
      //([x, y] = args);
    }

    // Validate

    // Either (x, y) or (r, a) must be (both) notNull
    const notNull = utils.notNull;
    const gotCartesian = notNull(x) && notNull(y);
    const gotPolar = notNull(r) && notNull(a);
    const noCoord = !gotCartesian && !gotPolar;
    if (noCoord) throw RangeError('Invalid arguments to Vector constructor: ' +
      'either {x, y} or {r, a} must be specfied');

    // Every one of them must be either null or a number
    const hasNonNumber = !R.all(utils.isNullOrNumber, [x, y, r, a]);
    if (hasNonNumber)
      throw RangeError('Invalid arguments to Vector constructor: all supplied ' +
        'arguments must be numbers');

    this._x = x;
    this._y = y;
    this._r = r;
    this._a = a;
  }

  get x() {
    if (this._x == null) this._x = this._r * Math.cos(this._a);
    return this._x;
  }
  get y() {
    if (this._y == null) this._y = this._r * Math.sin(this._a);
    return this._y;
  }

  get r() {
    if (this._r == null) this._r = Math.sqrt( utils.sq(this._x) + 
      utils.sq(this._y) );
    return this._r;
  }

  // angle (direction), in radians.
  get a() {
    if (this._a == null) this._a = (() => {
      const PI = Math.PI;
      const x = this._x;
      const y = this._y;
      if (y === 0) return x >= 0 ? 0 : PI/2;
      const theta = Math.atan(x/y);
      // adjust for sign
      const adj = (x >= 0 && y >= 0) ? 0 :
          (x >= 0 && y < 0) ? 2 : 1;
      return theta + adj * PI;
    })();
    return this._a;
  }

  // Neither of these should be necessary, but why not have them anyway?
  get polar() {
    return {r: this.r, a: this.a};
  }
  get cartesian() {
    return {x: this.x, y: this.y};
  }
}

module.exports = Vector;

