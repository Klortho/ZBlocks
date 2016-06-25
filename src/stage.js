// A Stage is an very lightweight animation driver -- just used for demo
// and coding practice. Different scenes/animations should be
// instances of this, not subclasses.
//
// For an example, see the solarSystem instance, below.

const utils = require('./utils.js');
const now = utils.now;

class Stage {
  constructor(props) {
    // defaults:
    this.speed = 1;
    this._paused = false;

    // Mix in the options (overrides) and methods passed to us
    if (typeof props === 'object' && props) {
      Object.keys(props).forEach(key => {
        const prop = props[key];
        this[key] = typeof prop === 'function' ? prop.bind(this) : prop;
      });
    }

    // Get the canvas and the context object
    const canvas = this.canvas = document.getElementById('canvas');
    const width = this.width = canvas.width;
    const height = this.height = canvas.height;
    const ctx = this.ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-over';

    // `animate` gets passed to the window.requestAnimationFrame function.
    // It draws one frame, and then loops. It is kicked off by start()
    this.animate = () => {

      // while paused, don't advance the time
      if (!this._paused) {
        const prevAccTime = this._accTime;
        this._accTime += (now() - this._lastTime) * this.speed;
        if (prevAccTime > this._accTime) {
          debugger;
          console.error('whoa!');
        }
      }

      this._lastTime = now();
      const t = this._accTime;
      const displayTime = Math.floor(this._accTime * 10) / 10;
      document.querySelector('#t').innerHTML = displayTime;

      this.initFrame();
      this.draw(t);
      window.requestAnimationFrame(this.animate);
    };

    this.initialize(ctx);
  }

  // default initialize method does nothing
  initialize() {}

  start() {
    // Keep time with an accumulator, rather than (now - start), so that
    // we can speed up or slow down dynamically.
    this._accTime = 0;
    this._lastTime = now();

    window.requestAnimationFrame(this.animate);
  }

  pause(_pauseOn) {
    const pauseOn = _pauseOn || false;
    if (this._paused === pauseOn) 
      console.warn('Already ' + pauseOn ? 'paused' : 'going');
    this._paused = pauseOn;
  }

  initFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  // Executes a drawing function inside ctx.save and .restore
  scene(drawFunc, ...args) {
    this.ctx.save();
    drawFunc.call(this, ...args);
    this.ctx.restore();
  }

  // Executes a drawing function inside a matrix transform
  sceneM(m, drawFunc, ...args) {
    const ctx = this.ctx;
    ctx.save();
      ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      drawFunc.call(this, ...args);
    ctx.restore();
  }

  // Call this to enable some keyboard handlers
  enableKeyboard() {
    document.onkeydown = evt => {
      //console.log(evt);
      const key = evt.keyCode || evt.which;
      if (key === 32) {   // space bar
        this.pause(!this._paused);
      }
      else if (key == 38) {  // up arrow
        this.speed *= 1.2;
      }
      else if (key == 40) {  // down arrow
        this.speed /= 1.2;
      }
    };
  }
}

//----------------------------------------------------------------------
// Solar system demo (adapted from Mozilla's tutorial, simplified)

Object.defineProperty(Stage, 'solarSystem', { 
  get: () => new Stage({
    initialize: function(ctx) {
      this.sun = new Image();
      this.sun.src = 'https://mdn.mozillademos.org/files/1456/Canvas_sun.png';
      this.earth = new Image();
      this.earth.src = 'https://mdn.mozillademos.org/files/1429/Canvas_earth.png';    
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
    },

    draw: function(t) {
      const stage = this;
      const ctx = this.ctx;

      // Earth
      ctx.save();
        ctx.translate(150, 150);
        ctx.rotate(2 * Math.PI * t / 60);
        ctx.translate(105, 0);
        ctx.fillRect(0, -12, 50, 24); // Shadow
        ctx.drawImage(stage.earth, -12, -12);
      ctx.restore();
      
      // Earth orbit
      ctx.beginPath();
      ctx.arc(150, 150, 105, 0, 2 * Math.PI, false);
      ctx.stroke();
     
      // Sun
      ctx.drawImage(stage.sun, 0, 0, 300, 300);
    },
  }),
});


module.exports = Stage;
