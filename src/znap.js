/* For now, we'll use a global named Znap for everything

  The most generic would have transformation among x, y, and t. Right now, this
  is just a feature that zooms over time, and so it just has a linear transform 
  for both x and y.
*/
(function() {
  const globalObj = typeof global === 'undefined' ? window : global;
  console.log('Znap!');

  //------------------------------------------------------------
  // Znap

  const Znap = globalObj.Znap = class {
    // Apply position scale to a coordinate.
    scale(mag, c0) { 
      return {
        x: mag * c0.x,
        y: mag * c0.y,
        t: c0.t,
      };
    }
  }

  // Znap class properties and methods, including a bunch of utilties
  const ORIGIN = Znap.ORIGIN = { x: 0, y: 0, t: 0, };

  // Lightweight extend for options, for now. Returns a copy - mutates
  // nothing
  const agg = Znap.agg = function(acc, cur) {
    return (typeof cur !== 'object' || cur == null) ? acc : 
      Object.assign(acc, cur);
  };

  const extend = Znap.extend = (...args) => args.reduce(agg, {});

  // Degrees to radians
  const degToRad = Znap.degToRad = deg => deg * Math.PI / 180;

  // Radians to degrees
  const radToDeg = Znap.radToDec = rad => rad * 180 / Math.PI;


  //------------------------------------------------------------
  // Zoomer

  const Zoomer = Znap.Zoomer = class {

    // Initialize for zoomer. For now, require that the origins coincide
    constructor(_opts) {
      this.opts = Znap.extend(Zoomer.defaults, _opts);
    }

    // Move to an event in the future.
    // Input: relative-coordinates: where are we moving to
    // Output: real-coords: relative time, absolute coords.
    glideTo(vspeed, vlength, vdirection) {
      console.log('=================> glideTo');
      // If this is called before the zblocks constructor, set these points
      // to the origin.
      if (!('v0' in zb) || !typeof zb.v0 === 'object') zb.v0 = zb.ORIGIN;
      const v0 = zb.v0;
      if (!('r0' in zb) || !typeof zb.v0 === 'object') zb.r0 = zb.ORIGIN;
      const r0 = zb.r0;

      const vdir = degToRad(vdirection);
      const dvx = vlength * Math.sin(vdir);
      const dvy = vlength * Math.cos(vdir);
      const vduration = vlength / vspeed;
      console.log('=================> glideTo A');
      const v1 = {
        x: v0.x + dvx,
        y: v0.y + dvy,
        t: v0.t + vduration,
      };
      console.log('=================> glideTo B');

      // compute the real coords, and the return value from this function
      const r1 = v2r(v1);
      console.log('r1: ', r1);
      console.log('r0: ', r0);
      const ret = { x: r1.x, y: r1.y, dt: r1.t - r0.t, };
      console.log('ret: ', ret);

      // Now update the simulator
      zb.v0 = v1;
      zb.r0 = r1;
      console.log('v0: ', zb.v0);

      //return ret;
      // rx1, ry1, 
      return new List([ret.x, ret.y, ret.dt]);
    };
  }

  // Zoomer class properties and methods

  Zoomer.defaults = {
    lastAbsolute: ORIGIN,
    lastRelative: ORIGIN,
    // Rate that the magnification increases (or decreases, if < 1),
    // per second.
    rate: 1.1,
  };

})();
