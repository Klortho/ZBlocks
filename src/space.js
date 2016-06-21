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
  // - props is any object. The properties will be copied to the instance.
  constructor(_matrix, props) {
    const matrix = R.isNil(_matrix) ? new Matrix() : _matrix;
    this.mfunc = R.is(Function, matrix) ? matrix : t => matrix;
    if (R.is(Object, props)) {
      Object.keys(props).forEach(key => {
        //console.log('Space copying properties. key: ' + key + 
        //   ', props: ', props);
        return this[key] = props[key];
      });
    }
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
// cycle 5.1 seconds long. By default it loops.
// FIXME: implement non-looping.
//
//   const space = Znap.Space.fromStops([
//     { dt: 1,
//       m: identity,
//     },
//     { dt: 2,
//       m: scaleU(2),
//     },
//     { dt: 2.1,
//       m: rotateDeg(135),
//     },
//   ]);

Space.fromStops = function(stops) {

  // Convert the array of "stops" into an array of intervals. An interval
  // includes a matrix function. 

  const lastI = stops.length - 1;  // last index number
  const last = stops[lastI];       // last stop object

  var startTime = 0;
  const intervals = stops.map((thisStop, i) => {
    const start = startTime;
    const end = startTime = start + thisStop.dt;

    // The matrix function - takes `t`, returns interpolated matrix (if `t`
    // is in range) or null (if not)
    const inInterval = t => (start <= t && t < end);
    const thisMatrixFn = t => {
      if (!inInterval(t)) return null;
      if (t === start) return thisStop.m;
      const tfrac = (t - start) / (end - start);

      const nextI = i < lastI ? i + 1 : 0;
      const nextM = stops[nextI].m;
      return thisStop.m.interpolate(nextM, tfrac); 
    };

    // This chained matrix function either returns the matrix, or dispatches
    // to the next interval
    const matrixFn = t => inInterval(t) ? thisMatrixFn(t) : 
      intervals[i + 1].matrixFn(t);

    var thisInterval = {
      dt: thisStop.dt,
      start,
      end,
      m: thisStop.m,
      thisMatrixFn,
      matrixFn,
    };

    return thisInterval;
  });

  // master matrix function
  const matrixFn = intervals[0].matrixFn;

  return new Space(matrixFn, {
    intervals,
    duration: intervals[lastI].end,
  });
};

module.exports = Space;
