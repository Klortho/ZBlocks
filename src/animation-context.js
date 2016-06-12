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


class AnimationContext {

  // Constructor. If _previous is null or absent, then this is the root, and 
  // none of the following arguments will be used.
  // If _relativeTime is null, then this is a "stop".
  constructor(_opts, _prev, _relTimeArg, _matrix) {
    this.opts = utils.extend(AnimationContext.defaults, _opts);

    const prev = this.prev = _prev || null;
    const isRoot = this.isRoot = (_prev == null);

    // relTime, the member, is always a number
    const relTime = this.relTime = 
        isRoot ? 0 
      : (_relTimeArg || 0);
    if ((typeof relTime !== 'number') || relTime < 0) 
      throw RangeError('Bad argument for relative time');

    this.time = 
        isRoot ? 0 
      : prev.time + this.relTime;

    const isStop = this.isStop = 
        isRoot ? true 
      : (_relTimeArg != null);

    this.prevStop = 
        isRoot ? null 
      : prev.isStop ? prev 
      : prev.prevStop;

    const matrix = this.matrix = 
        isRoot ? new Matrix() 
      : _matrix;

    // The transformation matrix since (but not including) the last stop
    this.stopProduct = 
        (isRoot || prev.isStop) ? matrix 
      : prev.stopProduct.clone().multiply(matrix);

    // The cumulative transform -- only set for stops
    this.product = 
        isRoot ? matrix 
      : isStop ? this.prevStop.matrix.clone().multiply(this.stopProduct)
      : null;
  }



  // All of the following return a new AnimationContext object that describes
  // an interpolated transformation of this one. 
  // Almost all of these are derived from, and delegate to, methods defined in 
  // the Matrix object. See 
  // https://github.com/epistemex/transformation-matrix-js#quick-overview.

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

  // This interpolates the transformation according to the time
  applyPointTime(p0, t) {
    // Find the prev and next for the interpolation. There are these cases:
    // - t matches a stop's time: no iterpolation, just use the stop
    // - t is after the last entry:
    //     - there is one and only one entry, root: no interpolation, use root
    //     - interpolate using last and last.prev
    // - t is between two entries: interpolate
    
  }
}

// Object methods that delegate to a Matrix method, to create a new 
// AnimationContext:

const transformMethods = [
  'flipX',
  'flipY',
  'reflectVector',
  'rotate',
  'rotateDeg',
  'rotateFromVector',
  'scale',
  'scaleU',
  'scaleX',
  'scaleY',
  'shear',
  'shearX',
  'shearY',
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
module.exports = AnimationContext;
