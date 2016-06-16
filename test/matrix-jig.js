'use strict';
var debug = false;


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

// Utility functions

// Compute a new random translucent color
const randomColor = function() {
  // split a sum color value of 200 at random
  const bases = [1, 2, 3].map(Math.random);
  const sum = bases[0] + bases[1] + bases[2];
  const rgb = bases.map(b => Math.floor(200 * b / sum));
  const rgba = rgb.concat(0.2);
  const str = 'rgba(' + rgba.join(', ') + ')'; 
  console.log('random color: ', str);
  return str;
};

// This draws a fixed size-position box (in whatever matrix it is embedded
// within) with a random color
const drawBox = function() {
  console.log('drawing a box');
  ctx.fillStyle = randomColor();
  ctx.fillRect (-50, -30, 100, 60);
};


// A set of points in time, each of which is associated with a transform.
// It loops by default.
// I'm using the word `stop` for these, but they are really intervals, with
// a stop on each end. A given object in the list stores a matrix that defines
// the transform at the beginning of that interval.

class Stops {

  constructor() {
    const stops = this.stops = [
      // identity
      { duration: 1,
        matrix: (new Matrix()),
      },

      // double scale
      { duration: 2,
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

    this.duration = last.end;
  }

  // Given a time, get the stop (interval)
  getStop(t) {
    const tm = t.mod(this.duration);
    return this.stops.find(stop => {
      return stop.start <= tm && (stop.isLast || tm < stop.next.start);
    });
  }

  // Given a time, get the previous and next stops
  getInterval(t) {
    const prev = this.getStop(t);
    return [ prev, prev.next ];
  }
}


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
    this.speed = 10;

    // Mix in the options (overrides) and methods passed to us
    if (typeof props === 'object' && props) {
      Object.keys(props).forEach(key => {
        const prop = props[key];
        this[key] = typeof prop === 'function' ? prop.bind(this) : prop;
      });
    }

    // call initialize if we've got it
    if (this.hasOwnProperty('initialize')) this.initialize();

    // Get the canvas and the context object
    const canvas = this.canvas = document.getElementById('canvas');
    const width = this.width = canvas.width;
    const height = this.height = canvas.height;
    const ctx = this.ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-over';

    // `animate` gets passed to the window.requestAnimationFrame function.
    // It draws one frame, and then loops. It is kicked off by start()
    this.animate = () => {
      const t = now() * this.speed;
      this.draw(t);
      window.requestAnimationFrame(this.animate);
    };
  }

  start() {
    this.startTime = now();
    window.requestAnimationFrame(this.animate);
  }
}

const solarSystem = new Stage({
  initialize: function() {
    this.sun = new Image();
    this.sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
    this.earth = new Image();
    this.earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';    
  },

  draw: function(t) {
    const stage = this;
    const ctx = stage.ctx;

    ctx.clearRect(0, 0, 300, 300); // clear canvas

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';

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




function run2() {
  const startTime = now();



  // Refresh the entire canvas every frame.
  function draw() {
    mm.reset();
    ctx.clearRect(0, 0, width, height); // clear canvas
    ctx.save();

      var t = now();
      interval = getInterval();

      var m;
      if (t0 == t1) m = m0;
      else {
        const rt = (t - t0) / (t1 - t0);
        m = m0.interpolateAnim(m1, rt);
      }

      mm.set(m);
      box();

    ctx.restore();
  }

  setInterval(draw, 2000);
}




// Some quick-and-dirty test that runs from node
const tester = function() {
  global.Matrix = require("transformation-matrix-js").Matrix;
  const stops = new Stops();

  const assert = require('./assert-close-enough.js');
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
};

if (debug && (typeof global === 'object')) tester();
else {
  solarSystem.start();
}
