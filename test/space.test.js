'use strict';

// This is chai with a custom assertion
const assert = require('./assertions.js');
const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('../src/point.js');
const Space = require('../src/space.js');

const IDENTITY = new Matrix();
const scale2 = (new Matrix()).scaleU(2);



// This returns a helper function that verifies the value of a matrix at a 
// particular time
const matrixChecker = function(space) {
  return function(t, ...margs) {
    const actual = space.matrix(t);
    //console.log(`After ${t} seconds: `, actual);
    assert.matricesEqual(actual, Matrix.from(...margs));
  };
};


describe('Space class', function() {
  it('has some working constructors', function() {
    const sp0 = new Space();
    assert.matricesEqual(new Matrix(), IDENTITY);

    const sp1 = new Space(scale2);
    assert.matricesEqual(sp1.matrix(5), Matrix.from(2, 0, 0, 2, 0, 0));

    const sp2 = new Space(t => (new Matrix()).scaleU(t));
    assert.matricesEqual(sp2.matrix(8.8), Matrix.from(8.8, 0, 0, 8.8, 0, 0));

    // FIXME: Test that I can set props with the Space constructor
  });


  it('allows for an ad-hoc piecewise matrix function', function() {

    // Here's a function that returns a matrix:
    // - when t <= 0, identity
    // - when t is between 0 - 2, a matrix scaled by a factor linear with t
    // - when t > 2, a matrix that's scaled by a constant amount, and rotated
    //   by an amount linear in t.
    const mfunc3 = t => {
      const m = new Matrix();
      if (t <= 0) return m;
      if (t <= 2) return m.scaleU(4 * t);
      return m.scaleU(4 * 2).rotateDeg(90 * (t - 2)); 
    };
    const space = new Space(mfunc3);

    const checkMatrix = matrixChecker(space);
    checkMatrix(0,   1, 0,  0,  1, 0, 0);
    checkMatrix(1,   4, 0,  0,  4, 0, 0);
    checkMatrix(1.5, 6, 0,  0,  6, 0, 0);
    checkMatrix(2,   8, 0,  0,  8, 0, 0);
    checkMatrix(3,   0, 8, -8,  0, 0, 0);
    checkMatrix(4,  -8, 0,  0, -8, 0, 0);
  });


  it('provides access to the Matrix class', function() {
    assert.strictEqual(Space.Matrix, Matrix);
  });


  it('enables creating a space from stops', function() {
    const stops = [
      { dt: 1,
        m: IDENTITY,
      },
      { dt: 2,
        m: Space.scaleU(2),
      },
      { dt: 2,
        m: Space.rotateDeg(180),

      },
      { dt: 1,
        m: Space.scaleY(2),
        absolute: true,
      },
    ];
    const space = Space.fromStops(stops);

    assert.equal(space.duration, 6, 'duration should be correct');

    const intervals = space.intervals;
    assert.equal(intervals.length, stops.length, 'should have intervals');

    // Check the intervals
    const check = function(i, expDt, expStart, expEnd) {
      const interval = intervals[i];
      assert.nearlyEqual(interval.dt, expDt);
      assert.nearlyEqual(interval.start, expStart);
      assert.nearlyEqual(interval.end, expEnd);
    }
    //    i  dt start end
    check(0,  1,  0,   1);
    check(1,  2,  1,   3);
    check(2,  2,  3,   5);
    check(3,  1,  5,   6);

    const checkMatrix = matrixChecker(space);
    checkMatrix(0,   1,   0,  0,  1,   0, 0);
    checkMatrix(0.1, 1.1, 0,  0,  1.1, 0, 0);
    checkMatrix(0.9, 1.9, 0,  0,  1.9, 0, 0);
    checkMatrix(1,   2,   0,  0,  2,   0, 0);
    checkMatrix(3,  -2,   0,  0, -2,   0, 0);
    checkMatrix(4,  -0.5, 0,  0,  0,   0, 0);
    checkMatrix(5,   1,   0,  0,  2,   0, 0);
  });
});
