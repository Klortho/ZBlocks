'use strict';
// This is chai with a custom assertion
const assert = require('./assert-close-enough.js');

const Utils = require('../src/utils.js');


describe('util extend', function() {
  it('works as expected', function () {

    var target, results;

    const defaults = {a: 1, c: 3, d: 4};
    const savedDefaults = Object.assign({}, defaults);
    assert.notStrictEqual(defaults, savedDefaults);
    assert.deepEqual(defaults, savedDefaults);

    // Test the simple two-object override, first
    const assign = Utils.assign;
    target = {}
    results = assign(target, defaults);
    assert(target === results);
    assert.deepEqual(results, defaults);

    target = {c: 4, e: 5};
    results = assign(target, defaults);
    assert.deepEqual(results, {a: 1, c: 3, d: 4, e: 5});

    // Test extend.
    const extend = Utils.extend;
    results = assign({a: 1}, {b: 2});
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
  });
});



