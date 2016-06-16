'use strict';

const AnimationContext = require('./animation-context.js');
//const Offset = require('./offset.js');
const Point = require('./point.js');
const Vector = require('./vector.js');
const utils = require('./utils.js');


const currentAC = new AnimationContext();


function zoom(rate) {
  // FIXME: this is all a hack right now
  Znap.zoomRate = rate;
  const nextAC = Znap.currentAC.scaleU(rate);
  Znap.currentTime = 0;
  Znap.push(nextAC);
  return nextAC;
};

var factor = 1;

function getCoords(time, x, y) {
  //const absTime = Znap.currentTime + time;
  //const factor = Math.pow(Znap.zoomRate, absTime);
  //const newX = factor * x;
  //const newY = factor * y;
  factor = factor * 2;
  return new List([x * factor, y * factor]);
}

function push(nextAC) {
  console.log('FIXME');
}

function addTime(t) {
  Znap.currentTime += t;
}

const Znap = module.exports = {
  AnimationContext,
  Vector,
  Point,
  utils,

  currentAC,
  getCoords,
  push,
  zoom,
  addTime,
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