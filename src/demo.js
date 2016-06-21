'use strict';

const Matrix = Znap.Matrix;
const Space = Znap.Space;
const Stage = Znap.Stage;



//------------------------------------------------------------------------
// The parade demo

const parade = () => {

  // stops is an array of describing the transformation matrices at
  // specific points in time.

  var stops = [ 
    { dt: 1,
      m: Space.identity(),
    },
    { dt: 12,
      m: Space.scaleU(2),
    },
    { dt: 33,
      m: Space.rotateDeg(45),
    },
  /*
    { dt: 5,
      m: Space.rotateDeg(0),
    },
    { dt: 5,
      m: Space.rotateDeg(20),
    },
  */
  ];

  return new Stage({
    initialize: function(ctx) {
      const stage = this;
      this.ctx = ctx;
      const space = this.space = Znap.Space.fromStops(stops);
      const duration = this.duration = space.duration;
      this.xUnit = this.width / duration;

      // debugging:
      this.msgCount = 0;
      this.startMsgs = false;

      // Initialize colors and a drawing routine for each stop box
      stops.forEach(stop => {
        stop.color = Color.random();
        stop.drawBox = () => {
          stage.scene(() => {
            applyMatrix(ctx, stop.m);
            stage.drawBox(stop.color);
          });
        };
      });
    },

    // Draws one box. The coordinates should be settled before calling this
    drawBox: function(color) {
      this.ctx.fillStyle = color.toString();
      this.ctx.fillRect(-20, -30, 40, 60);
    },

    draw: function(ctx, t) {
      const stage = this;
      const duration = this.duration;

      this.scene(() => {
        // translate coordinates for the parade as a whole
        ctx.translate(this.width / 2, this.height / 4);

        // Draw two boxes for each, to make sure we have coverage
        stops.forEach(stop => {
          const xpos = (stop.t - t).mod(duration) - duration;

          [0, duration].forEach(extraX => {
            stage.scene(() => {
              ctx.translate(stage.xUnit * (xpos + extraX), 0);
              stop.drawBox();
            });
          });
        });
      });


      // Now for the transformating box
      this.scene(() => {
        ctx.translate(this.width / 2, 3 * this.height / 4);
        this.drawBox('black');

        const m = this.space.matrix(t);
        //console.log(m);
        //applyMatrix(ctx, stop.m);

        //ctx.

      });
    },
  });
};


//------------------------------------------------------------------------
// Helpers

// Applies a transformation matrix to a canvas context
function applyMatrix(ctx, m) {
  ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
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


//------------------------------------------------------------------------
// main

const hash = (typeof window === 'undefined') ? '' :
  window.location.hash.substr(1);
const stage = hash === 'solar-system' ? Stage.solarSystem: parade();
stage.start();
stage.enableKeyboard();

