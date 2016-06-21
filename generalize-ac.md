An animation context is a function that, given a time, returns a matrix.
The AnimationContext class contains helpers to make it easy to create some of
the most common functions.

Most general:

    AC.from( t => <Matrix> )

Each of these arguments is a functor: either a constant value or a
function `(t => <float>) `. (This is in the pattern used by D3; see
https://github.com/d3/d3/wiki/Internals#functor)

    AC.from( <fa>, <fb>, <fc>, <fd>, <fe>, <ff> )

So, zoomer would be:

    AC.from( (t => rate ^ t), 0, 0, (t => rate ^ t), 0, 0 )

Or:

    pow = R.curry(Math.pow)
    map(multiply(pow(rate)), IDENTITY)


The piecewise thing I've spent so long on, would be something like this,
using a function `piecewise` that takes an array of {predicate, function}
tuples:

    segments = [
      [ 0, IDENTITY, ],
      [ 1, scaleU(2), ],
      [ 2, rotateDeg(45), ],
    ];
    // turn that into a list of tuples:
    [ t => tprev <= t && t < tnext,
      t => {
        tfraction = (t - tprev) / (tnext - tprev);
        return mprev.interpolate(tfraction, mnext)
      }
    ]
