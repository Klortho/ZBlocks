'use strict';

// This is chai with a custom assertion
const assert = require('./assert-close-enough.js');

const Offset = require('../src/offset.js');
const R = require('ramda');

describe('Offset class', function() {
  it('can be constructed', function () {

    const off1 = new Offset(1, 1, 0);
    assert.equal(off1.x, 1, 0);
    assert.equal(off1.y, 1, 0);
    assert.closeEnough(off1.r, Math.sqrt(2));
    assert.closeEnough(off1.a, Math.PI / 4);

    const off2 = new Offset(-1, 1, 0);
    assert.closeEnough(off2.a, 3 * Math.PI / 4);
    const off3 = new Offset(-1, -1, 0);
    assert.closeEnough(off3.a, 5 * Math.PI / 4);
    const off4 = new Offset(1, -1, 0);
    assert.closeEnough(off4.a, 7 * Math.PI / 4);
  });
});
