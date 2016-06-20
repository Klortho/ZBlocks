// animation-context.js
// Objects of AnimationContext are chains of transformation matrices,
// each of which has an associated time, and
// where each matrix specifies a affine coordinate transformation. 
// Any given AnimationContext has a single matrix describing what it brings
// to the party, and a reference to its predecessor.
'use strict';

const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('./point.js');
const utils = require('./utils.js');



// FIXME: temporary
const assert = pred => {
  if (!pred) throw Error('assertion failed');
};

class AnimationContext {

  // Constructor. All parameters are named:
  // - prev: The previous AC in the chain. If prev is null or absent, then 
  //   this is the root
  // - t: Relative time since the last AC in the chain; used to compute the 
  //   `time` property (which is absolute). If prev was given as null, t is
  //   not zero, then a new identity root AC will be created first, and this
  //   chained off of that. So, in other words, this:
  //     var ac = new AC({t: 5, scaleU: [2]})
  //   is shorthand for this:
  //     var ac = (new AC()).scaleU({t: 5}, [2]);
  //   If t is 0, then this AC replaces the prev in the chain.
  // - isLoop - creates a special AC that causes a chain to loop back to the
  //   root
  // - extendBy: "overwrite" - new matrix is used as-is; "multiply" - new matrix
  //   is multiplied by the prev. Default is "multiply"
  //
  // Also including any of a number of ways to specify the matrix. If none of
  // these are given, it defaults to the identity matrix. See 
  // matrixMethods, below.

  constructor(_opts) {
    const opts = this.opts = utils.extend(defaults, _opts);

    if (this.isLoop && this.isRoot)
      throw RangeError('root can\'t loop to itself');

    if (!this.isLoop) {
      // Get the matrix argument to this constructor, which could
      // be specified in a number of ways
      const matrixArg = getMatrix(opts);

      // Compute the real matrix for this stop, by multiplying or overwriting
      // prev.matrix
      this.matrix = 
          (this.isRoot || this.extendBy === 'overwrite') ? matrixArg
        : this.prev.matrix.clone().multiply(matrixArg);
    }
    else {
      this.matrix = null;
    }

    // If t is non-zero, and this is root, then insert a new root identity
    // matrix, and chain off that
    if (this.isRoot && this.t !== 0) {
      const root = new AnimationContext();
      this.opts.prev = root;
    }

    // If t is 0, and this is not the root, then this AC will replace
    // prev, rather than add to the chain
    if (!this.isRoot && this.t === 0) this.prev = this.prev.prev;

    // For diagnostics, give each one an the index number of where it appears
    // in the chain
    this.i = this.isRoot ? 0 : this.prev.i + 1;
  }

  get prev() {
    return this.opts.prev;
  }

  get isRoot() {
    return this.prev == null;
  }

  get isLoop() {
    return this.opts.isLoop;
  }

  // Relative time (since prev)
  get t() {
    return this.opts.t;    
  }

  // Absolute time (since root)
  get time() {
    return this.isRoot ? 0 : this.prev.time + this.t;
  }

  // loop() is a factory method that returns a new Animation Context that loops
  // back to the root, t seconds after the last one in the chain. The new AC
  // is special, in that it acts a little bit like a proxy for the root AC. It
  // doesn't have it's own matrix, but does have a time property.
  loop(t) {
    return new AnimationContext({isLoop: true}, this, t, m);
  }




  // This takes a point in the local coordinates, and returns the corresponding
  // point in absolute, by applying the matrix. This doesn't do anything
  // with time.
  applyToPoint(p0) {
    const m = this.matrix;
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
  // FIXME: make sure this works with isLoop
  // FIXME: let's call these "stops".
  graphicalContexts() {
    const ret = [];
    for (var gc = this; gc != null; gc = gc.prev) {
      ret.unshift(gc);
    }
    return ret;
  }

  toString() {
    return 'AnimationContext #' + this.i + ': ' +
      `t=${this.t}; matrix: ${this.matrix.toString()}`;
  }
}

const defaults = AnimationContext.defaults = {
  prev:  null,
  t: 0,
  isLoop: false,
  extendBy: 'multiply',
};

// Methods for specifying a new matrix.
// See https://github.com/epistemex/transformation-matrix-js
const matrixMethods = AnimationContext.matrixMethods = [
  'from',               // Matrix.from(a, b, c, d, e, f)
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

// This function is used by the contructor to instantiate the Matrix object
// from the specification in opts, which can either be `matrix`, or one of
// the methods above.
const getMatrix = AnimationContext.getMatrix = function(opts) {
  const method = matrixMethods.find(_method => _method in opts) || null;
  const matrix = 
      method == null ? new Matrix()   // default is identity
    : method == 'from' ? Matrix.from(...opts.from)
    : (new Matrix())[method](...opts[method]);
  return matrix;
}

matrixMethods.forEach(method => {
  AnimationContext.prototype[method] = function(...args) {
    const opts = args.shift();
    opts[method] = args;
    opts.prev = this;
    return new AnimationContext(opts);
  };
});

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


// Attach this, for convenience
AnimationContext.Matrix = Matrix;
module.exports = AnimationContext;
