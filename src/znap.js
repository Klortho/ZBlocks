'use strict';

const AnimationContext = require('./animation-context.js');
//const Offset = require('./offset.js');
const Point = require('./point.js');
const Vector = require('./vector.js');
const utils = require('./utils.js');
const now = utils.now;

const currentAC = new AnimationContext();


function zoom(rate) {

  // FIXME: zoomRate and startTime are hacks right now
  Znap.zoomRate = rate;
  Znap.startTime = now();

  console.log(`Starting zoom rate ${rate} at time ${Znap.startTime}`);

  //const nextAC = Znap.currentAC.scaleU(rate);
  //Znap.push(nextAC);
  //return nextAC;
};

// Get the given x, y position at time deltaT from now.
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
  console.log('======================== FIXME');
}

function addTime(t) {
  Znap.startTime += t;
}

const Znap = module.exports = {
  addTime,
  AnimationContext,
  Point,

  currentAC,
  getCoords,
  push,
  utils,
  Vector,
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