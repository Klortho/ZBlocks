const _test = false;


/*
  Every draw command tells ZBMan where it needs to go, and when it's supposed to
  get there, in relative terms. ZBMan (everything in JS) tells it how *really* to
  get there, and records that as the next point.

  The most generic would have transformation among x, y, and t. Right now, this
  is spiralize, and so it just has a linear transform for both x and y.
*/
(function() {

  const zb = (function() {
    const ORIGIN = { x: 0, y: 0, t: 0, };

    // rate is the rate of increase of the spiral.
    // defaults not implemented yet.
    const defaults = {
      rate: 1.1,
    };

    const v2r = function(v) { 
      const scale = Math.pow(zb.rate, v.t);
      return {
        x: scale * v.x,
        y: scale * v.y,
        t: v.t,
      };
    };

    // Initialize for spiralizer. For now, require that the r and v origins
    // coincide
    const initialize = function(_opts) {
      zb.rate = _opts && _opts.rate ? (_opts.rate - 0) : defaults.rate;
      zb.r0 = Object.assign({}, ORIGIN);
      zb.v0 = v2r(zb.r0);
    };

    const degToRad = deg => deg * Math.PI / 180;
    const radToDeg = rad => rad * 180 / Math.PI;


    // Move to an event in the future.
    // Input: virtual-coords: relative
    // Output: real-coords: relative time, absolute coords.
    const glideTo = function(vspeed, vlength, vdirection) {
      const v0 = zb.v0;

      const vdir = degToRad(vdirection);
      const dvx = vlength * Math.sin(vdir);
      const dvy = vlength * Math.cos(vdir);
      const vduration = vlength / vspeed;
      const v1 = {
        x: v0.x + dvx,
        y: v0.y + dvy,
        t: v0.t + vduration,
      };

      // compute the real coords, and the return value from this function
      const r1 = v2r(v1);
      const ret = { x: r1.x, y: r1.y, dt: r1.t - zb.r0.t, };

      // Now update the simulator
      zb.v0 = v1;
      zb.r0 = r1;

      //return ret;
      // rx1, ry1, 
      return new List([ret.x, ret.y, ret.dt]);
    };

    return {
      defaults,
      initialize,
      v2r,
      degToRad,
      radToDeg,
      glideTo,
    };
  })();


  // Testing
  if (_test) {
    const assert = require('chai').assert;

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

})();
