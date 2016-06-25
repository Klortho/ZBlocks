# Next

## npm tests

**Get tests working again:**

* ✓utils.js
* Xassertions.js - not going to test this independently
* ✓point.js
* ✓space.js
* stage.js
* znap.js

## Generic declarative matrix function format 

Need a simple way to describe, in a static data structure, basic arithmetical
manipulations to matrices.

For example, how would you specify, using static (no functions) data only,
something like:

* translate in direction ta with speed ts, staring at position tx0,ty0, and
* rotate clockwise at speed rs, starting at angle ra0, and
* scale at rate zs, starting at magnification z0
* multiply all that with a constant skew 
* ...

The starting positions can be pulled out and made into constants:

* xlate constant tx0,ty0
* xlate direction=a, speed=s
* rotate constant angle=ra0
* rotate speed=rs
* scale constant x0
* scale rate=zs
* skew constant



## Harmonize my classes with the blocks I've designed

* Represent points as `point` objects. Try not to make any distinction
  between points and vectors -- use the same objects for both.
* Add pen color transformations
