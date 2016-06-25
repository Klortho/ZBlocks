// This is meant to be loaded from the browser.
'use strict';

// using `var` to make sure these are globals
var Matrix = Znap.Matrix;
var R = Znap.R;
var Space = Znap.Space;
var Stage = Znap.Stage;
var utils = Znap.utils;

//------------------------------------------------------------------------
// The parade demo

var parade = () => {

  // stops is an array of describing the transformation matrices at
  // specific points in time.

  var stops = [ 
    { dt: 2,
      m: Space.IDENTITY,
    },
    { dt: 2,
      m: Space.scaleU(.7),
    },
    { dt: 3,
      m: Space.rotateDeg(45),
    },
    { dt: 4,
      m: Space.scaleY(2).multiply(Space.rotateDeg(30)),
      absolute: true,
    },
    { dt: 3,
      m: Space.shearX(1.5),
    },
  ];

  const space = Znap.Space.fromStops(stops);
  const duration = space.duration;
  const intervals = space.intervals;

  // Get the minimum dt
  const boxWidth = R.reduce(
    (acc, intr) => R.min(acc) (R.prop('dt')(intr)),
    Infinity, intervals
  );

  const drawingWidth = duration + boxWidth * 2;
  const xStart = -drawingWidth / 2;
  const xEnd = xStart + drawingWidth;

  //console.log('duration: ', duration);
  //console.log('boxWidth: ', boxWidth);
  //console.log('drawingWidth: ', drawingWidth);
  //console.log('xStart: ', xStart);

  return new Stage({
    initialize: function(ctx) {
      const stage = this;
      this.ctx = ctx;
      this.space = space;

      // Global transform for the canvas: 
      // - origin in the middle,
      // - y-coordinate increasing in up direction
      ctx.translate(this.width / 2, this.height);

      // Global scale, such that:
      // - x-coordinates for the parade of boxes are in units of time
      // - maintain aspect ratio
      this.xUnit = this.width / duration;
      ctx.scale(this.xUnit, -this.xUnit);

      // extents in terms of x0, y0, width, height, in the new coords
      this.extents = [-duration/2, 0, duration, this.height/this.xUnit];
      this.drawingHeight = this.height / this.xUnit;

      // Create a box-drawing function for each interval
      const boxMaker = () => { 
        const color = Color.random(); 
        return function() { 
          return stage.drawBox(color);
        } 
      };
      this.renderBox = R.map(boxMaker, intervals);
    },

    initFrame() {
      this.ctx.clearRect(...this.extents);
    },

    // Draws one box. The coordinates should be settled before calling this
    drawBox: function(color) {
      this.ctx.fillStyle = color.toString();
      this.ctx.fillRect(-0.45, -0.45, 0.9, 0.9);
    },

    // Applies a transformation matrix to a canvas context
    // See also stage.sceneM()
    applyMatrix: function(m) {
      this.ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
    },

    draw: function(t) {
      const stage = this;
      const ctx = this.ctx;
      //console.log('  draw t: ', t);

      this.scene(() => {
        // translate coordinates for the parade
        ctx.translate(0, this.extents[3] / 2);

        // This step function draws the boxes that cover the drawing area.
        // `seek` is true initially; when in seek mode, it just looks for
        // the first box to draw.
        const step = function(seek, interval, xpos) {
          const i = interval.i;
          //console.log(`    ${seek ? 'seeking' : 'drawing'}: interval ${i} ` +
          //  `xpos: ${xpos}`);

          if (!seek) {
            stage.scene(() => {
              ctx.translate(xpos, 0);
              stage.sceneM(interval.fm, () => {
                stage.renderBox[i]();
              });
            });
          }

          const nextX = xpos + interval.dt;
          const nextSeek = seek && nextX < xStart;
          if (nextX <= xEnd) {
            const nextI = (i + 1) % intervals.length;
            step(nextSeek, intervals[nextI], nextX);
          }
        }

        // The parade has been going for a while. This is the offset to 
        // apply such that we are guaranteed, that the x position of the 
        // first box will be < xStart.
        const xOffset = Math.floor((xStart + t) / duration) * duration - t;
        //console.log('  xOffset: ', xOffset);

        const i0 = intervals[0];
        step(true, i0, i0.start + xOffset);
      });

    /*
      // Now for the transformating box
      this.scene(() => {
        ctx.translate(this.width / 2, 3 * this.height / 4);
        this.drawBox('black');

        const m = this.space.matrix(t);
        //console.log(m);
        //applyMatrix(ctx, stop.m);

        //ctx.

      });
    */
    },
  });
};


//------------------------------------------------------------------------
// Helpers


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


//------------------------------------------------------------------------
// main

if (!R.isNil(window)) {
  const demos = {
    'solsys': () => Stage.solarSystem,
    'boxes': parade,
  };

  // Not `const`, so that it will be global
  var loadDemo = demo => {
    window.location.hash = "#" + demo;
    window.location.reload(true);
  };

  const div = document.createElement('div');
  div.innerHTML = `
    <p>Time: <span id='t'></span></p>
    <p>Demos:</p>
    <ul>${
      Object.keys(demos).map(demo =>
        `<li><a href='javascript:loadDemo("${demo}");'>${demo}</a></li>`
      ).join('')
    }</ul>
  `;
  document.querySelector('body').appendChild(div);

  // load the current demo
  const hash = window.location.hash.substr(1) || 'boxes';
  if (!(demos[hash] instanceof Function)) {
    console.error('No demo for hash: ' + hash);
  }

  else {
    var stage = demos[hash]();
    stage.start();
    stage.enableKeyboard();
  }
}

// make some globals for debugging
var space = stage.space;
var ctx = stage.ctx;
