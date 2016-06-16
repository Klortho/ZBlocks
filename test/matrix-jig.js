'use strict';

// Fix the modulo operator (see
// http://stackoverflow.com/questions/4467539/javascript-modulo-not-behaving)
Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};

// Get the current time, in seconds
const now = function() {
  var today = new Date();
  return today.getSeconds() + today.getMilliseconds() / 1000;
};

// Wrap a context drawing activity in save and restore
function wrapDraw(ctx, draw) {
  ctx.save();
  draw();
  ctx.restore();
}

//----------------------------------------------------------------------
// A set of stop, each of which has a point in time and a transform matrix.
// It loops by default.
// I'm using the word `stop` for these, but they are really intervals, with
// a stop on each end. A given object in the list stores a matrix that defines
// the transform at the beginning of that interval.

class Stops {

  constructor() {
    const stops = this.stops = [
      // identity
      { duration: 2,
        matrix: (new Matrix()),
      },
      // double scale
      { duration: 1,
        matrix: (new Matrix()).scale(2, 2),
      },
      // rotate
      { duration: 5,
        matrix: (new Matrix()).rotateDeg(90),
      },
      // shear
      { duration: 1,
        matrix: (new Matrix()).shearX(2),
      },
      // back down in scale
      { duration: 2,
        matrix: (new Matrix()).scale(0.5, 0.5),
      },
    ];

    const first = this.first = stops[0];
    const last = this.last = stops[stops.length - 1];

    // Fix up the entries:
    // - add `start` and `end`, times that are based on duration
    // - add `prev` and `next`, that reflect the loop
    // - add `num`, a sequential counter
    stops.forEach((stop, i) => {
      stop.num = i;
      const isFirst = stop.isFirst = stop === first;
      const isLast = stop.isLast = stop === last;
      const prev = stop.prev = isFirst ? last : stops[i - 1];
      const next = stop.next = isLast ? first : stops[i + 1];

      const start = stop.start = isFirst ? 0 : prev.end;
      const end = stop.end = start + stop.duration;
    });
  }

  get duration() {
    return this.last.end;
  }

  // The number of stops in this set
  get count() {
    return this.stops.length;
  }

  // Given an integer as an index to a stop number, this applies modulo
  index(n) {
    return n.mod(this.count);
  }

  // Return a stop by number (modulo is applied for you)
  at(n) {
    return this.stops[this.index(n)];
  }

  // Given an absolute time, returns the modulo time for this sequence
  modTime(t) {
    return t.mod(this.duration);
  }

  // Given a time, get the stop (interval)
  getStop(t) {
    const tm = this.modTime(t);
    return this.stops.find(stop => {
      return stop.start <= tm && (stop.isLast || tm < stop.next.start);
    });
  }

  // Given a time, get the previous and next stops, and the normalized
  // time (between 0 - 1)
  getInterval(t) {
    const prev = this.getStop(t);
    // compute normalized time (between 0 - 1)
    const modTime = this.modTime(t);
    const normTime =(modTime - prev.start) / (prev.end - prev.start)
    return {
      modTime: modTime,
      normTime: normTime,
      prev: prev,
      next: prev.next,
    };
  }
}

//----------------------------------------------------------------------
// Stage is an animation driver. Different scences/animations should be
// instances of this, not subclasses.
// Usage:
//   my solarSystem = new Stage({
//     initialize: function() { this.sun = ...; },
//     draw: function(ctx) { ... },
//   });

class Stage {
  constructor(props) {
    // defaults here:
    this.speed = 1;

    // Mix in the options (overrides) and methods passed to us
    if (typeof props === 'object' && props) {
      Object.keys(props).forEach(key => {
        const prop = props[key];
        this[key] = typeof prop === 'function' ? prop.bind(this) : prop;
      });
    }

    // Get the canvas and the context object
    const canvas = this.canvas = document.getElementById('canvas');
    const width = this.width = canvas.width;
    const height = this.height = canvas.height;
    const ctx = this.ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-over';

    // `animate` gets passed to the window.requestAnimationFrame function.
    // It draws one frame, and then loops. It is kicked off by start()
    this.animate = () => {
      this.initFrame(ctx);
      const t = (now() - this.startTime) * this.speed;
      this.draw(ctx, t);
      window.requestAnimationFrame(this.animate);
    };

    this.initialize(ctx);
  }

  // default initialize method
  initialize(ctx) {}

  start() {
    this.startTime = now();
    window.requestAnimationFrame(this.animate);
  }

  initFrame(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
  }

  // Executes a drawing function inside ctx.save and .restore
  scene(drawFunc, ...args) {
    this.ctx.save();
    drawFunc.call(this, ...args);
    this.ctx.restore();
  }
}

//----------------------------------------------------------------------
// Solar system example (adapted from Mozilla's tutorial)

const solarSystem = function() {
  return new Stage({
    initialize: function(ctx) {
      this.sun = new Image();
      this.sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
      this.earth = new Image();
      this.earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    },

    draw: function(ctx, t) {
      const stage = this;

      ctx.save();
        ctx.translate(150, 150);

        // here's how to apply a transform from a Matrix object
        const m = new Matrix().scale(0.5, 0.5);
        //m.applyToContext(ctx);    // this overrides completely
        // but this multiplies:
        ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);

        // Earth
        ctx.rotate(2 * Math.PI * t / 60);
        ctx.translate(105, 0);
        ctx.fillRect(0, -12, 50, 24); // Shadow
        ctx.drawImage(stage.earth, -12, -12);
      ctx.restore();
      
      ctx.beginPath();
      ctx.arc(150, 150, 105, 0, 2 * Math.PI, false); // Earth orbit
      ctx.stroke();
     
      ctx.drawImage(stage.sun, 0, 0, 300, 300);
    },
  });
}

//------------------------------------------------------------------------
// Color class

class Color {
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  toString() {
    return 'rgba(' + [this.r, this.g, this.b, this.a].join(', ') + ')';
  }

  // Return a new color interpolated between this and the next
  interpolate(next, t) {
    function interp(a, b) {   // interpolate integers
      return Math.floor((b - a) * t + a);
    }
    return new Color(
      interp(this.r, next.r),
      interp(this.g, next.g),
      interp(this.b, next.b),
      0.6
    );
  }
}

Color.random = function() {
  const r = Math.random();
  const g = Math.random();
  const b = Math.random();
  const sum = r + g + b;
  const norm = base => Math.floor(300 * base / sum);
  return new Color(norm(r), norm(g), norm(b), 0.6);
};

//----------------------------------------------------------------------
// Rectangle with transformations

const rectangle = function() {

  function applyMatrix(ctx, m) {
    ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  return new Stage({
    initialize: function(ctx) {
      const stops = this.stops = new Stops();
      // Make a unique box for each stop
      for (var i = 0; i < stops.count;  ++i) {
        stops.at(i).box = this.newBox(); 
      }
    },

    // Returns a function that draws a box of a random color
    newBox: function() {
      const color = Color.random();
      const ctx = this.ctx;
      const box = function() {
        ctx.fillStyle = color.toString();
        ctx.fillRect(-50, -30, 100, 60);
      };
      box.color = color;
      return box;
    },

    transBox: function(prevColor, nextColor, t) {
      const color = prevColor.interpolate(nextColor, t);
      const ctx = this.ctx;
      ctx.fillStyle = color.toString();
      ctx.fillRect(-50, -30, 100, 60);
    },

    draw: function(ctx, t) {
      this.scene(() => {
        ctx.translate(this.width / 2, this.height / 2);

        const interval = this.stops.getInterval(t);
        const prev = interval.prev;
        const normTime = interval.normTime;

        // Draw the boxes at the top
        this.scene(() => {
          var x = -(3 + normTime) * 200;
          var stop = prev.prev.prev.prev;
          for (var i = 0; i < 7; ++i) {
            this.scene(() => {
              ctx.translate(x, -60);
              applyMatrix(ctx, stop.matrix);
              stop.box();
            });
            x += 200;
            stop = stop.next;
          }
        });

        // interpolateAnim() is broken! Use interpolate instead.
        //const m = pm.interpolateAnim(nm, interval.normTime);

        // Now draw the transitioning box
        const next = interval.next;
        this.scene(() => {
          ctx.translate(0, 60);
          const m = prev.matrix.interpolate(next.matrix, normTime);
          applyMatrix(ctx, m);
          this.transBox(prev.box.color, next.box.color, normTime);
        });
      });
    },
  });
}

//------------------------------------------------------------------------
// Quick test that runs from node

const tester = function() {
  global.Matrix = require("transformation-matrix-js").Matrix;
  const stops = new Stops();

  const assert = require('./assert-close-enough.js');
  /* Commenting these all out, since I changed the set of stops since I wrote
    these.
    assert.equal(stops.getStop(0).num, 0);
    assert.equal(stops.getStop(0.5).num, 0);
    assert.equal(stops.getStop(1).num, 1);
    assert.equal(stops.getStop(1.1).num, 1);
    assert.equal(stops.getStop(2.5).num, 1);
    assert.equal(stops.getStop(2.999).num, 1);
    assert.equal(stops.getStop(8.5).num, 3);
    assert.equal(stops.getStop(9).num, 4);
    assert.equal(stops.getStop(10.999).num, 4);
    assert.equal(stops.getStop(11).num, 0);
    assert.equal(stops.getStop(-1).num, 4);
    assert.equal(stops.getStop(-10.1).num, 0);
    assert.equal(stops.getStop(-11).num, 0);
    assert.equal(stops.getStop(21).num, 4);
  */
};

//------------------------------------------------------------------------
// main

if (typeof global === 'object') tester();
else {
  //solarSystem().start();
  rectangle().start();
}


//------------------------------------------------------------------------
/* This is not being used. Not sure if it's valuable or not.

// All changes to the canvax context will go through an instance of this
// class. This doesn't save a stack; it just keeps the current transformation,
// and it is mutable.
class CanvasTransformManager {
  constructor(_ctx) {
    this.ctx = _ctx;
    this.reset();
  }

  // Root matrix, can't be overridden
  get root() {
    if (!this.hasOwnProperty('root')) {
      this._root = (new Matrix()).translate(width/2, height/2);
    }
    return this._root;
  }

  get current() {
    return this._current;
  }

  // Set the canvax ctx object back to the root transformation
  reset() {
    this.set(this.root);
  }

  // Set the current transformation matrix. This applies it to the canvas.
  set(m) {
    this._current = m;
    m.applyToContext(ctx);
  }

  // Set the transformation matrix to the product of the current one and a
  // new one.
  multiply(m) {
    this.set(this._current.multiply(m));
  }
}
*/
