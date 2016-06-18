// animation-context.js
// Objects of AnimationContext are chains of transformation matrices,
// each of which has an associated time, and
// where each matrix specifies a affine coordinate transformation. 
// Any given AnimationContext has a single matrix describing what it brings
// to the party, a reference to its predecessor, and a product matrix, that
// gives the product of all of the transformations so far.
'use strict';

const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('./point.js');
const utils = require('./utils.js');


// FIXME: temporary
const assert = pred => {
  if (!pred) throw Error('assertion failed');
};

class AnimationContext {

  // Constructor. If _previous is null or absent, then this is the root, and 
  // none of the following arguments will be used.
  // If _relativeTime is null, then this is a "stop".
  constructor(_opts, _prev, _relTimeArg, _matrix) {
    this.opts = utils.extend(AnimationContext.defaults, _opts);

    const prev = this.prev = _prev || null;
    const isRoot = this.isRoot = (_prev == null);

    // For diagnostics, give each one an the index number of where it appears
    // in the chain
    this.i = isRoot ? 0 : this.prev.i + 1;
    
    // relTime, the member, is always a number
    const relTime = this.relTime = 
        isRoot ? 0 
      : (_relTimeArg || 0);
    if ((typeof relTime !== 'number') || relTime < 0) 
      throw RangeError('Bad argument for relative time');

    this.time = 
        isRoot ? 0 
      : prev.time + this.relTime;

    //const isStop = this.isStop = 
    //    isRoot ? true 
    //  : (_relTimeArg != null);

    //this.prevStop = 
    //    isRoot ? null 
    //  : prev.isStop ? prev 
    //  : prev.prevStop;

    const matrix = this.matrix = 
        isRoot ? new Matrix() 
      : _matrix;

    //// The transformation matrix since (but not including) the last stop
    //this.stopProduct = 
    //    (isRoot || prev.isStop) ? matrix 
    //  : prev.stopProduct.clone().multiply(matrix);

    // The cumulative transform
    this.product = 
        isRoot ? matrix 
      //: this.prevStop.product.clone().multiply(this.stopProduct);
      : this.prev.product.clone().multiply(matrix);
  }


  // The following factory methods return a new AnimationContext object that 
  // describes a new transformation derived from this one. 
  // Almost all of these methods delegate to methods defined in 
  // the Matrix object. See 
  // https://github.com/epistemex/transformation-matrix-js

  // Some of these delegate to Matrix class methods, that create new Matrix 
  // objects, while others to methods that mutate the Matrix objects. In the 
  // latter case, we call clone() first.

  // The `t` parameter is either null or a relative time in seconds. When 
  // non-null, it sets a "stop", such that the effective transform at any time
  // before t is the iterpolation of all of the transforms since the last stop.
  // For example:
  //     *root*  <-  scale(null, 2)  <-  translate(2, 3, 0)
  // sets one new stop at 2 seconds. The transform at any time between 0-2 is
  // the interpolation of the combined scale and translate transforms.

  // The most general transform:
  fromParams(t, scaleX, scaleY, translateX, translateY, shearX, shearY) {
    const m = Matrix.from(scaleX, shearY, shearX, scaleY, translateX, translateY);
    return new AnimationContext(null, this, t, m);
  }

  // From a Matrix object
  fromMatrix(t, m) {
    return new AnimationContext(null, this, t, m);
  }

  // Matrix needed to produce triangle2 from triangle1
  fromTriangles(t, triangle1, triangle2) {
    const m = Matrix.fromTriangles(triangle1, triangle1);
    return new AnimationContext(null, this, t, m);
  }

  // Matrix from a SVG transform list
  fromSVGTransformList(t, tList) {
    const m = Matrix.fromSVGTransformList(tList);
    return new AnimationContext(null, this, t, m);
  }


  // This takes a point in the local coordinates, and returns the corresponding
  // point in absolute, using the final product matrix. This doesn't do anything
  // with time.
  applyToPoint(p0) {
    const m = this.product;
    var result = m.applyToPoint(p0.x, p0.y);
    const p1 = new Point(result);
    return p1;
  }


  // This interpolates the transformation according to the time.
  applyToEvent(p0, t) {
    if (t < 0) throw RangeError('Invalid time');
    const ac = this;

    const pair = matchingPair(ac._lastPair(), t);
    const gc0 = pair[0];
    const gc1 = pair[1];

    var m;
    if (gc0.i === gc1.i) 
      m = gc0.matrix;
    else {
      const t0 = gc0.time;
      const t1 = gc1.time;
      const rt = (t - t0) / (t1 - t0);
      m = gc0.matrix.interpolate(gc1.matrix, rt);
    }
    const result = m.applyToPoint(p0.x, p0.y);
    const p1 = new Point(result);
    return p1;
  }

  // Private helper function, used with matchingPair (below).
  // The first "pair" to examine is the last pair in the chain. It has `this` 
  // (the latest gc) in the "next" slot, and this.prev in the prev slot, if 
  // possible. If `this` is root, then it's not possible, so we'd return 
  // [this, this].
  _lastPair() {
    const ret = [ (this.isRoot ? this: this.prev), this ];
    //console.log('_lastPair: returning ', ret);
    return ret;
  }

  // Returns the chain of graphical contexts as an array
  graphicalContexts() {
    const ret = [];
    for (var gc = this; gc != null; gc = gc.prev) {
      ret.unshift(gc);
    }
    return ret;
  }

  toString() {
    return 'AnimationContext #' + this.i;
  }
}

// Object methods that delegate to a Matrix method, to create a new 
// AnimationContext:

const transformMethods = [
  'flipX',
  'flipY',
  'reflectVector',
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
  'skew',
  'skewDeg',
  'skewX',
  'skewY',
  'translate',
  'translateX',
  'translateY',
];

transformMethods.forEach(methodName => {
  AnimationContext.prototype[methodName] = function(...args) {
    const t = args.shift();
    const m = (new Matrix())[methodName](...args);
    return new AnimationContext(null, this, t, m);
  };
});

AnimationContext.defaults = {};



// Function to return the matching prev/next pair of graphical contexts to use
// for an interpolation, by stepping backwards through the linked list. There 
// are these cases:
// 1. t matches a stop's time: no interpolation, just use the stop
// 2. t is after the last entry:
//     a. there is one and only one entry, root: no interpolation, use root
//     b. interpolate using last.prev and last
// 3. t is between two entries: interpolate

// We recurse through all possible "pairs" of prev/next stops. The scare 
// quotes are because some "pairs" have the same stop in both slots.
// We are guaranteed that prev.time <= next.time.

// Given a pair of stops, this function returns the previous pair, or null
const prevPair = pair => {
  const gc0 = pair[0];
  const gc1 = pair[1];
  const ret =
      gc0.isRoot && gc1.isRoot ? null   // nowhere to go
    : gc0.isRoot ? [gc0, gc0]
    : [gc0.prev, gc0];
  return ret;
};


// This recurses, to return the matching [prev, next] pair, given a 
// starting pair and the time. It will always return a valid pair of gcs, if
// t > 0.
const matchingPair = AnimationContext.matchingPair = function(pair, t) {
  const gc0 = pair[0];
  const gc1 = pair[1];
  const ret =  
      gc1.time < t ? pair
    : gc1.time == t ? [gc1, gc1]
    : gc0.time < t ? pair
    : gc0.time == t ? [gc0, gc0]
    : matchingPair(prevPair(pair), t);
  return ret;
};


module.exports = AnimationContext;
