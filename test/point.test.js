'use strict';

const assert = require('./assertions.js');
const Point = require('../src/point.js');


describe('Point class', function() {
  it('can get the angle from the origin to an x, y point', function() {

    const cases = [
      { x:  0,   y:  0,   exp: 0 },
      { x:  0,   y:  1,   exp: 0 },
      { x:  0.1, y:  1,   exp: 0.09966865249116204 },
      { x:  1,   y:  0.1, exp: 1.4711276743037345 },
      { x:  1,   y:  0,   exp: 1.5707963267948966 },
      { x:  1,   y: -0.1, exp: 1.6704649792860586 },
      { x:  0.1, y: -1,   exp: 3.0419240010986313 },
      { x:  0,   y: -1,   exp: 3.141592653589793 },
      { x: -0.1, y: -1,   exp: 3.241261306080955 },
      { x: -1,   y: -0.1, exp: 4.612720327893528 },
      { x: -1,   y:  0,   exp: 4.71238898038469 },
      { x: -1,   y:  0.1, exp: 4.8120576328758515 },
      { x: -0.1, y:  1,   exp: 6.183516654688424 },
    ];

    cases.forEach(cs => {
      assert.nearlyEqual(Point.angleRad(cs.x, cs.y), cs.exp);
    });

    cases.forEach(cs => {
      assert.nearlyEqual(Point.angle(cs.x, cs.y), cs.exp * 180 / Math.PI);
    });
  });

  it('default constructor works as advertised', function() {

    // call default (no argument) constructor
    assert.pointsEqual(new Point(), 
      {x: 0, y: 0, r: 0, a: 0});
    assert.pointsEqual(new Point(34), 
      { x: 34, y: 0, r: 34, a: 90 });
    assert.pointsEqual(new Point(0, 10), 
      { x: 0, y: 10, r: 10, a: 0 });
    assert.pointsEqual(new Point(-34), 
      { x: -34, y: 0, r: 34, a: 270 });
    assert.pointsEqual(new Point(1, 1), 
      { x: 1, y: 1, r: Math.sqrt(2), a: 45 });
    assert.pointsEqual(new Point({x: -7}),
      { x: -7, y: 0, r: 7, a: 270 });
    assert.pointsEqual(new Point({y: 9.2}),
      { x: 0, y: 9.2, r: 9.2, a: 0 });
    assert.pointsEqual(new Point({x: 7, y: 4}),
      { x: 7, y: 4, r: Math.sqrt(7*7 + 4*4), a: 60.255118703057796 });
    assert.pointsEqual(new Point({r: 7}),
      { x: 0, y: 7, r: 7, a: 0 });
    assert.pointsEqual(new Point({r: 2, a: 10}),
      { x: 0.34729635533386066, y: 1.969615506024416, r: 2, a: 10 });

    // Because r is zero, the angle will be set to zero
    assert.pointsEqual(new Point({a: 20}),
      { x: 0, y: 0, r: 0, a: 0 });

    // clone a point
    const p1 = new Point({r: 2, a: 10});
    assert.pointsEqual(p1.clone(),
      { x: 0.34729635533386066, y: 1.969615506024416, r: 2, a: 10 });
  });
});
