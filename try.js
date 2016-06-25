const R = require('ramda');
const utils = require('./src/utils.js');

var intervals = [ 
  { i: 0,
    dt: 1,
    start: 0,
  },
  { i: 1,
    dt: 2,
    start: 1,
  },
  { i: 2,
    dt: 3,
    start: 3,
  },
];

const duration = 6;

// Get the  minimum dt
const boxWidth = R.reduce(
  (acc, intr) => R.min(acc) (R.prop('dt')(intr)),
  Infinity, intervals
);

const drawingWidth = duration + boxWidth * 2;
const xStart = -drawingWidth / 2;
const xEnd = -xStart;

console.log('duration: ', duration);
console.log('boxWidth: ', boxWidth);
console.log('drawingWidth: ', drawingWidth);
console.log('xStart: ', xStart);

const draw = function(t) {
  console.log('  draw t: ', t);

  // The parade has been going for a while. This is the offset to apply such
  // that we are guaranteed, that the x position of the first box will be
  // < xStart.
  const xOffset = Math.floor((xStart + t) / duration) * duration;
  console.log('  xOffset: ', xOffset);

  // computes the x position of *the first* box associated with the interval
  const xpos = interval => interval.start + xOffset;

  // Start drawing with this box
  const first = R.find(intv => xpos(intv) >= xStart, intervals);
  console.log('  first interval is #' + first.i + ', xpos: ' + xpos(first));

  // Draw boxes that cover the drawing area.
  // Start drawing when (xpos > -(duration/2 + boxWidth)
  const step = function(interval, xpos) {
    const i = interval.i;
    console.log(`    Interval ${i} xpos: ${xpos}`);

    const nextX = xpos + interval.dt;
    if (nextX <= xEnd) {
      const nextI = (i + 1) % intervals.length;
      step(intervals[nextI], nextX);
    }
  }

  step(first, xpos(first));
}

draw(0);