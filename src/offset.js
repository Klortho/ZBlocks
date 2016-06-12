// NOT USED.
// Maybe I don't need this class.

// Offset class - A Vector, but with time.
'use strict';

const utils = require('./utils.js');
const R = require('ramda');

class Offset {

  // Ways to construct an Offset:
  // - `x, y, t`
  // - `{x: 3, y: 2, t: 10}`  (cartesian)
  // - `{r: 6, a: 1, t: 10}`  (polar)

  constructor(...args) {
    // Either (x, y, t) or (r, a, t) must be defined. The other set is evaluated
    // late, if needed
    var x = null,
        y = null,
        r = null,
        a = null,
        t = null;

    if (args.length === 1) {
      const arg = args[0];
      if (isObject(arg)) {
        if ('x' in arg && 'y' in arg && 't' in arg) {
          ({x, y, t} = arg);
        }
        else if ('r' in arg && 'a' in arg && 't' in arg) {
          ({r, a, t} = arg);
        }
      }
    }
    else if (args.length === 3) {
      ([x, y, t] = args);
    }

    // Validate

    // Either (x, y, t) or (r, a, t) must be (all three) notNull
    const notNull = utils.notNull;
    const gotCartesian = notNull(x) && notNull(y);
    const gotPolar = notNull(r) && notNull(a);
    const noCoord = !gotCartesian && !gotPolar;
    const noTime = utils.isNull(t);

    // Every one of them must be either null or a number
    const hasNonNumber = !R.all(utils.isNullOrNumber, [x, y, r, a, t]);

    if (noCoord || hasNonNumber || noTime)
      throw RangeError('Invalid arguments to Offset constructor');

    this._x = x;
    this._y = y;
    this._r = r;
    this._a = a;
    this._t = t;
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
    if (this._r == null) this._r = Math.sqrt( utils.sq(this._x) + utils.sq(this._y) );
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

  get t() {
    return this._t;
  }

  // Neither of these should be necessary, but why not have them anyway?
  get polar() {
    return {r: this.r, a: this.a, t: this.t};
  }
  get cartesian() {
    return {x: this.x, y: this.y, t: this.t};
  }
}

module.exports = Offset;

