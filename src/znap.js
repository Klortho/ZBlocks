// znap - custom snap-based programming and drawing tool.
// Conventions for my classes:
// - constructors provide a rigid canonical set of arguments
// - if you want flexibility, use a class method named `from`, that inspects
//   the arguments


(function() {
  console.log('Znap!');

  //------------------------------------------------------------
  // Some utilities

  // Lightweight (shallow) extend for options, for now. Returns a copy - mutates
  // nothing
  const agg = Znap.agg = function(acc, cur) {
    return (typeof cur !== 'object' || cur == null) ? acc : 
      Object.assign(acc, cur);
  };

  const extend = Znap.extend = (...args) => args.reduce(agg, {});

  // Some type-checking / validation
  const isNumber = n => typeof n === 'number';
  const isObject = obj => (obj != null && typeof obj === 'object');

  // Math shortcuts
  const sq = x => Math.pow(x, 2);
  const sqrt = Math.sqrt;





  //------------------------------------------------------------
  // Znap class

  const Znap = class {
  }

  // Degrees to radians
  const degToRad = Znap.degToRad = deg => deg * Math.PI / 180;

  // Radians to degrees
  const radToDeg = Znap.radToDec = rad => rad * 180 / Math.PI;


  //------------------------------------------------------------
  // Zoomer

  const Zoomer = Znap.Zoomer = class {

    // Initialize for zoomer. For now, require that the origins coincide
    constructor(_opts) {
      this.opts = Znap.extend(Zoomer.defaults, _opts);
    }

    // Move to an event in the future.
    // Input: relative-coordinates: where are we moving to
    // Output: real-coords: relative time, absolute coords.
    glideTo(vspeed, vlength, vdirection) {
      console.log('=================> glideTo');
      // If this is called before the zblocks constructor, set these points
      // to the origin.
      if (!('v0' in zb) || !typeof zb.v0 === 'object') zb.v0 = zb.ORIGIN;
      const v0 = zb.v0;
      if (!('r0' in zb) || !typeof zb.v0 === 'object') zb.r0 = zb.ORIGIN;
      const r0 = zb.r0;

      const vdir = degToRad(vdirection);
      const dvx = vlength * Math.sin(vdir);
      const dvy = vlength * Math.cos(vdir);
      const vduration = vlength / vspeed;
      console.log('=================> glideTo A');
      const v1 = {
        x: v0.x + dvx,
        y: v0.y + dvy,
        t: v0.t + vduration,
      };
      console.log('=================> glideTo B');

      // compute the real coords, and the return value from this function
      const r1 = v2r(v1);
      console.log('r1: ', r1);
      console.log('r0: ', r0);
      const ret = { x: r1.x, y: r1.y, dt: r1.t - r0.t, };
      console.log('ret: ', ret);

      // Now update the simulator
      zb.v0 = v1;
      zb.r0 = r1;
      console.log('v0: ', zb.v0);

      //return ret;
      // rx1, ry1, 
      return new List([ret.x, ret.y, ret.dt]);
    };
  }

  // Zoomer class properties and methods

  Zoomer.defaults = {
    lastAbsolute: ORIGIN,
    lastRelative: ORIGIN,
    // Rate that the magnification increases (or decreases, if < 1),
    // per second.
    rate: 1.1,
  };




  //-----------------------------------------------------------------
  // Point class. Immutable (only getters defined).
  // Convention (same as Snap!):
  // - x increases from left to right
  // - y increases from bottom to top

  class Point {

    // Ways to construct a Point:
    // - `x, y`
    // - `anotherPoint`
    // - `{x: 3, y: 2}`  (cartesian)
    // - `{r: 6, a: 1}`  (polar)

    constructor(..args) {
      // Either (x, y) or (r, a) must be defined. The other set is evaluated
      // late, if needed
      this._x = null;
      this._y = null;
      this._r = null;
      this._a = null;

      if (args.length === 1) {
        const arg = args[0];

        if (arg instanceof Point) {
          this._x = p._x;
          this._y = p._y;
        }

        else if (isObject(arg)) {
          if ('x' in arg && 'y' in arg) {
            this._x = arg.x;
            this._y = arg.y;
          }
          else if ('r' in arg && 'a' in arg) {
            this._r = arg.r;
            this._a = arg.a;
          }
        }
      }

      else if (args.length === 2) {
        if (isNumber(args[0]) && isNumber(args[1])) {        
          this._x = args[0];
          this._y = args[1];
        }
      }

      // validate
      if ((this._x == null || this._y == null) && 
          (this._r == null || this._a == null))
        throw RangeError('Invalid arguments to Point.from');
    }

    get x() {
      if (this._x == null) this._x = Point.ORIGIN.xOffset(this);
      return this._x;
    }
    get y() {
      if (this._y == null) this._y = Point.ORIGIN.yOffset(this);
      return this._y;
    }

    get r() {
      if (this._r == null) this._r = Point.ORIGIN.distanceTo(this);
      return this._r;
    }

    get a() {
      if (this._a == null) this._a = Point.ORIGIN.directionTo(this);
      return this._a;
    }

    // Create a new point from this point and an offset (distance, direction)
    point(offset) {

    } 


    // Neither of these should be necessary, probably, but why not?
    get polar() {
      return {r: this.r, a: this.a};
    }
    get cartesian() {
      return (x: this.x, y: this.y);
    }


  }

  Point.ORIGIN = new Point(0, 0);


  //-----------------------------------------------------------------
  // Offset class - describes the difference as a vector from one Point to
  // another. A Point is just an offset from the origin.
  class Offset {


    // Ways to construct an Offset:
    // - `dx, dy`
    // - `{dx: 3, dy: 2}`  (cartesian)
    // - `{dr: 6, da: 1}`  (dr is distance, da is direction)

    constructor(dx, dy) {
      // Either (x, y) or (r, a) must be defined. The other set is evaluated
      // late, if needed
      this._dx = null;
      this._dy = null;
      this._dr = null;
      this._da = null;

      if (args.length === 1) {
        const arg = args[0];

        if (isObject(arg)) {
          if ('dx' in arg && 'dy' in arg) {
            this._dx = arg.dx;
            this._dy = arg.dy;
          }
          else if ('dr' in arg && 'da' in arg) {
            this._dr = arg.dr;
            this._da = arg.da;
          }
        }
      }

      else if (args.length === 2) {
        if (isNumber(args[0]) && isNumber(args[1])) {        
          this._dx = args[0];
          this._dy = args[1];
        }
      }

      // validate
      if ((this._dx == null || this._dy == null) && 
          (this._dr == null || this._da == null))
        throw RangeError('Invalid arguments to Offset constructor');
    }







    }

    // Construct an offset from (distance, direction). `direction` in radians
    static from(distance, direction)
      const dx = distance * Math.cos(direction);
      const dy = distance * Math.sin(direction);
      return new Offset(dx, dy);
    }

    get distance() {
      return _;
    }
    get dir() {
      return _dir;
    }


    // Distance to another point
    distanceTo(aPoint) {
      const dx = aPoint.x - this._x;
      const dy = aPoint.y - this._y;
      return sqrt( sq(dx) + sq(dy) );
    }

    // Direction to another point, in radians.
    // Conventions: 
    // - internally, all angles are in radians from 0 <= z < 2pi
    // - for directions: 0 == right
    // - increasing value goes counter-clockwise.
    directionTo(aPoint) {
      const PI = Math.PI;
      const dx = aPoint.x - this._x;
      const dy = aPoint.y - this._y;

      if (dy === 0) return dx >= 0 ? 0 : PI/2; 

      const theta = Math.atan(dx/dy);
      // adjust for sign - coefficient
      const adj = 
        (dx >= 0 && dy >= 0) ? 0 :
        (dx >= 0 && dy < 0) ? 2 : 1;
      return theta + adj * PI;
    }




  }





  //-----------------------------------------------------------------
  // TimePoint class - this is an "event" in spacetime, but the name "event" 
  // is already taken. Keep this separate (no formal inheritance) from
  // Point until it becomes clear how to do it.

  class TimePoint {
    // Constructor: 
    //   var pi = new TimePoint(new Point(x, y), t);
    // For a shortcut, use: `Point.from(x, y, t)`
    constructor(aPoint, t) {
      this._p = aPoint;
      this._t = t || 0;
    }

    get point() {
      return this._p;
    }
    get x() {
      return this._p.x;
    }
    get y() {
      return this._p.y;
    }
    get t() {
      return this._t;
    }
  }

  TimePoint.ORIGIN = new TimePoint(Point.ORIGIN, 0);

  const globalObj = typeof global === 'undefined' ? window : global;

})();
