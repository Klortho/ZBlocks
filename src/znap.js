'use strict';

const Matrix = require("transformation-matrix-js").Matrix;
const Point = require('./point.js');
const Space = require('./space.js');
const Stage = require('./stage.js');
const utils = require('./utils.js');

const now = utils.now;

const currentAC = new Space();


function zoom(rate) {

  // FIXME: zoomRate and startTime are hacks right now
  Znap.zoomRate = rate;
  Znap.startTime = now();

  console.log(`Starting zoom rate ${rate} at time ${Znap.startTime}`);

  //const nextAC = Znap.currentAC.scaleU(rate);
  //Znap.push(nextAC);
  //return nextAC;
};

// Takes a set of canvas coordinates in, and a relative time
// in seconds. Returns the position of where this point will be at
// that time, according to the active animation context. The returned
// value is also in canvas coordinates.
function getCoords(deltaT, x, y) {

  // FIXME: temporary hacks

  const relTime = now() - Znap.startTime;
  const t = relTime + deltaT;

  if (!('zoomRate' in Znap) || typeof Znap.zoomRate !== 'number') 
    Znap.zoomRate = 1;
  const factor = Math.pow(Znap.zoomRate, t);
  const x1 = x * factor;
  const y1 = y * factor;

  return new List([x1, y1]);
}

function push(nextAC) {
  //console.log('======================== FIXME');
}

function addTime(t) {
  Znap.startTime += t;
}

const Znap = module.exports = {
  addTime,
  currentAC,
  getCoords,
  Matrix,
  Point,
  push,
  Space,
  Stage,
  utils,
  zoom,
};


//-----------------------------------------------------------
// some tests
function testMe() {

  // block:  "zoom at rate ___ times / second":
  Znap.zoom(1.1);

  // block: "glide ___ secs to x ___ y ____"
  const coords = Znap.getCoords(t, x, y);
  Znap.addTime(t);
  return coords;

}