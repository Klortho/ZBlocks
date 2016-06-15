// A Point is just a Vector that's been resolved from some other point. I
// don't think it will be necessary to store the original base point and 
// vector.
'use strict';

const Vector = require('./vector.js');

class Point extends Vector {

  // To construct an Point:
  // - () - ORIGIN
  // - (x, y)
  // - ({x: 3, y: 2})  (cartesian)
  // - ({r: 6, a: 1})  (polar)
  // - (aVector)
  constructor(...args) {
    const superArgs = 
        args.length == 0 ? [0, 0]
      : args[0] instanceof Vector ? [args[0].x, args[0].y] 
      : args;
    super(...superArgs);
  }

  // returns a new point at the given offset from the base point
  add(aVector) {
    return new Point(this.x + aVector.x, this.y + aVector.y);
  }

  toString() {
    return `Point(${this.x}, ${this.y})`;
  }
}

Point.ORIGIN = new Point(0, 0);

module.exports = Point;
