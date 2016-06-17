# Spiral project


## Custom blocks

### zoom block

"zoom at rate [rate] times / second"

Invokes:

```javascript
Znap.zoom(rate);
```

Right now, that doesn't even set any xform matrices. I sets

```
Znap.zoomRate = rate;
```

### Z glide [duration] secs to [x] [y]

const coords = Znap.getCoords(t, x, y);
Znap.addTime(t);
return coords;
