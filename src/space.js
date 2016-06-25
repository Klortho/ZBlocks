// space.js
// An Znap space is defined by a function that, given a time,  
// returns a transformation matrix.
// It has methods for converting points between coordinate systems, etc.

'use strict';

const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('./point.js');
const R = require('ramda');
const utils = require('./utils.js');

//--------------------------------------------------------------------------

class Space {
  // Construct out of one of:
  // - undefined or null - constant identity transform
  // - <Matrix> - constant transformation, doesn't vary with time
  // - (t => <Matrix>) - construct it with a function
  constructor(_matrix) {
    const matrix = R.isNil(_matrix) ? new Matrix() : _matrix;
    this.mfunc = R.is(Function, matrix) ? matrix : t => matrix;
  }

  // Returns the matrix in effect at a specific time
  matrix(t) {
    return this.mfunc(t);
  }

  // This takes a time value, and a point, and returns the new coordinates 
  apply(t, p0) {
    const m = this.mfunc(t);
    const coords = m.applyToPoint(p0.x, p0.y);
    const p1 = new Point(coords);
    return p1;
  }
}

// Provide access to the Matrix class. 
Space.Matrix = Matrix;

// A handy constant - the identity Matrix
Space.IDENTITY = new Matrix();

// Define a bunch of class functions that each return a new Matrix object.
// These are from https://github.com/epistemex/transformation-matrix-js, and
// we're attaching them to the Space class definition.
const matrixMethods = [
  'flipX',              // ()
  'flipY',              // ()
  'reflectVector',      // (x, y)
  'rotate',             // (angle)
  'rotateDeg',          // (angle)
  'rotateFromVector',   // (x, y)
  'scale',              // (sx, sy)
  'scaleU',             // (f)   - uniform scale
  'scaleX',             // (sx)
  'scaleY',             // (sy)
  'shear',              // (sx, sy)
  'shearX',             // (sx)
  'shearY',             // (sy)
  'skew',               // (ax, ay)
  'skewDeg',            // (ax, ay)
  'skewX',              // (ax)
  'skewY',              // (ay)
  'translate',          // (tx, ty)
  'translateX',         // (tx)
  'translateY',         // (ty)
];

matrixMethods.forEach(method => {
  Space[method] = (...args) => (new Matrix())[method](...args);
});

// Creates a space from a set of stops, defined like this, for example. Each
// `dt` specifies the duration of that interval, so the following defines a
// cycle 5.1 seconds long. By default:
//   - each new matrix is multiplied by the previous (override by setting
//     `absolute: true`)
//   - it loops.
// FIXME: implement non-looping.
//
//   const space = Znap.Space.fromStops([
//     { dt: 1, m: identity },
//     { dt: 2, m: scaleU(2) },
//     { dt: 2, m: rotateDeg(135) },
//     { dt: 2, m: rotateDeg(90), absolute: true },
//   ]);

Space.fromStops = function(stops) {

  // We'll run stops through reduce, with this accumulator function.
  // `acc` is an object with:
  //   - duration - time accumulated so far
  //   - intervals - array of all the intervals so far

  const accumulate = function(acc, thisStop) {
    const i = acc.intervals.length;

    const {m, dt, absolute} = thisStop;
    const start = acc.duration;
    const end = start + dt;

    // This interval's effective matrix: if this is the first interval, or
    // absolute is true, then fm <= m. Otherwise, multiply by previous fm
    const fm = acc.intervals.length === 0 || absolute ? m 
      : R.last(acc.intervals).fm.clone().multiply(m);

    const matrixFn = t => {
      // Get the next interval. It will have been instantiated by
      // the time this executes.   
      // FIXME: implement non-looping here.
      const next = intervals[i === intervals.length - 1 ? 0: i + 1];

      const ret =
          (t < start) ? null             // t is too low, abort
        : (t >= end) ? next.matrixFn(t)  // t is too high, dispatch to next
        : (t === start) ? fm             // at start boundary
        : (() => {                       // interpolate between this and next
            const tfrac = (t - start) / (end - start);
            const interp = fm.interpolate(next.fm, tfrac);
            return interp;
          })();
      return ret;
    };

    return {
      duration: end,
      intervals: R.append({i, start, end, dt, m, fm, matrixFn}, acc.intervals),
    };
  };

  const { duration, intervals } = 
    R.reduce(accumulate, { duration: 0, intervals: [] }, stops);

  // Create the new space and graft on some properties
  const space = new Space(intervals[0].matrixFn);
  space.duration = duration;
  space.intervals = intervals;
  return space;
};

module.exports = Space;
