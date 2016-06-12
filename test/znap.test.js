'use strict';

const assert = require('chai').assert;

require('../src/znap.js');


//const zoomer = new Znap.Zoomer;


// extends
(function() {
  var target, results;

  const defaults = {a: 1, c: 3, d: 4 };
  const savedDefaults = Object.assign({}, defaults);
  assert.notStrictEqual(defaults, savedDefaults);
  assert.deepEqual(defaults, savedDefaults);

  // Test agg first
  const agg = Znap.agg;
  target = {}
  results = agg(target, defaults);
  assert(target === results);
  assert.deepEqual(results, defaults);

  target = {c: 4, e: 5};
  results = agg(target, defaults);
  assert.deepEqual(results, {a: 1, c: 3, d: 4, e: 5});

  // Test extend.
  const extend = Znap.extend;
  results = extend({a: 1}, {b: 2});
  assert.deepEqual(results, {a: 1, b: 2});

  results = extend(
    defaults, 
    {b: 2, c: 35, e: 5}, 
    null, 
    {b: 0}, 
    undefined, 
    {b: 3}
  );
  assert.deepEqual(results, {a: 1, b: 3, c: 35, d: 4, e: 5});

  // Verify that the leftmost object doesn't get overwritten
  assert.deepEqual(defaults, savedDefaults);



})();





/*
// Mocks

// Spiralizer sets the real coords to zero, and:
zb.initialize();
assert.deepEqual(zb.r0, {x: 0, y: 0, t: 0});
assert.deepEqual(zb.v0, {x: 0, y: 0, t: 0});

var next = zb.glideTo(100, 100, 90);
console.log('next: ', next);
var next = zb.glideTo(100, 100, 90);
console.log('next: ', next);
}
else {
window.zb = zb;
}

*/