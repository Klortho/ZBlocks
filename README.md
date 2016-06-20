# Znap!

This is a fork/library of the amazing
[Snap!](http://snap.berkeley.edu/snapsource/snap.html) block-based
graphical programming environment. This project adds a new way to
draw images and do animations, based on standard coordinate
transformation matrices.

It is a work in progress. I hope to have something usable soon.


# Animation contexts

The fundamental feature of Znap is that the x-y coordinates used
for all of the moving and drawing commands can be transformed
in a very flexible way. This can make it really easy to make very
interesting drawings and shapes.

It works by allowing the user to define an "animation context" 
which is used to resolve x- and y-coordinates. 

Technically, an 
animation context is a function that takes time as an argument, 
and returns an affine transformation matrix. These types of matrices 
are a standard way to specify transformations that include 
translation (moving side-to-side or up/down), scaling (larger or 
smaller), and/or rotations. Multiple transformations can be combined 
into one to create combined effects such as shearing. You can read 
more about these on the Wikipedia article, [Affine 
transformation](https://en.wikipedia.org/wiki/Affine_transformation).

As mentioned, animation contexts define more than just single 
transformation matrices, they define a continuous function of
matrices over time. They do this in a way that is analogous to a gradient in 
a vector graphics drawing. The data structure comprises a set of "stops". Each 
stop specifies the exact transformation in effect at a specific point in time.

An AnimationContext (AC) object is implemented as a linked list, with each 
instance in the list including:

* `matrix` - The transformation matrix,
* `time` - The exact time at which `matrix` describes the exact transformation
  in effect
* `prev` - A reference to the previous AC. We guarantee that 
  `(prev == null) || (prev.time <= this.time)`. 

By default (always?) the "root" matrix corresponds to `time == 0`, is the 
identity matrix, and has `root.prev == null`.


The values of the nodes of the list, comprising a specific time and matrix,
could be called graphical contexts (GC), but there is no actual class used
for them.

At any given time `t`, to convert a point's coordinates from canvas coordinates
(absolute x, y) to transformed coordinates:

* Find the interval in which `t` appears -- the `prev` and `next` GCs.
* If `t` coincides exactly with one GC, use it's matrix, 
* Otherwise, interpolate between `prev` and `next` to create a new matrix
* Apply that as a transformation to the point.


# Znap blocks

This project replaces all of the blocks in the *Motion* category
(blue color) with new ones that are "aware" of the current
animation context.

The following lists the blocks in the *Znap* category, and what
they do. Many of the *Motion* blocks have direct counterparts in
*Znap*, but not all.


## Utilities

Not for general users.
I had been starting these with a `Z`, but I think a better convention is
just to put them in the *Other* category.

* (/) `Z close enough to` - predicate for testing [tests]


## Coordinate conversion blocks

These reporters give the position of the sprite in traditional
Snap! coordinates. By convention, I'm calling these "canvas 
coordinates", to distinguish them from transformed coordinates.

In general, these blocks should be also be considered low-level,
and shouldn't be needed by general users. Perhaps they should be moved to the
*Other* category.

![canvas-x-coordinate](docs/canvas-x-coordinate.png)
![canvas-y-coordinate](docs/canvas-y-coordinate.png)

The x- or y- coordinate of the sprite's position, right now. 
These report exactly the same value as the *Motion* blocks 
x-position and y-position. These should be used, instead of
the *Motion* blocks, to avoid confusion. (I don't know about
you, but I find it very easy to get confused by coordinate
transformations!)

![canvas-x-in-time](docs/canvas-x-in-time.png)
![canvas-y-in-time](docs/canvas-y-in-time.png)

x- or y- coordinate, corresponding to the current point, but
at some relative time offset, in seconds.

![canvas-coords-in-time](docs/canvas-coords-in-time.png)

This is the general conversion function from *Znap* to *Snap* 
coordinates.


## Points

* `point x, y`

* ✓ `point x [] y []`
* ✓ `point r [] angle []`

* ✓ `x of point []`
* ✓ `y of point []`

* ✓ `r of point []`
* ✓ `angle of point []`



## Geometry calculations

* `vector from [] to []`
* `distance from [] to []`
* `direction from [] to []`


## Moving and gliding

For these blocks, we need to know where we're going, and when we should get 
there: that is, the three independent variables `x`, `y`, and `time`. 
Here's an enumeration of the ways to specify those:

* {x, y, time},
* {x, y, speed},
* {r, angle, time},
* {r, angle, speed},
* {angle, time, speed}

This list translates to:

* {point, time} - where point can be either {x, y} or {r, angle}
* {point, speed}
* {angle, time, speed}

These are the blocks:

* `glide: direction: [] duration: [] speed: []`
* `move to x [] y []`

## Higher-level drawing

* `square size [] speed [] start angle []`


## Animation contexts

* `zoom at rate [] times / second`



# Development

To work on this, make sure you clone with `--recursive`, because it uses the
Snap! repo as a submodule. Then:

```
git clone --recursive git@github.com:Klortho/znap.git
cd znap
npm install
./run-server.sh
```

The submodule is [my fork of the Snap!](git@github.com:Klortho/snap.git), 
but haven't found it necessary to override anything yet. I'm using a 
proxying HTTP server, currently, to override the snap.html file, so that
I can add my custom `<script>` tag.

I also have [this js-fiddle](http://jsfiddle.net/klortho/gopr0buu/3/) where
I am playing with canvas and the transformation matrix library.


# Tests


## Mocha tests

The following runs mocha tests on everything matching
"test/*.test.js":

```
npm test
```

Run them a-la-carte with, for example

```
mocha test/utils.test.js
```

To select a subset, use regular expressions with, for example,

```
mocha -g 'can scale'
```


## Matrix-jig

This is an HTML page for learning about, and testing, code that does
transformations on the canvas. If you've started `./run-server.js` as
described above, then bring it up at 
http://localhost:8756/test/matrix-jig.html.


## Snap! tests

The project in projects/znap.xml has lots of tests written in Snap
itself.



# Questions

* How can integrate with online snap? Can I auto-generate a Snap 
  project that has all the javascript code in custom blocks? Could the 
  Znap blocks be made into a library?
* Ideally, for motion, I could reuse the existing blocks. I had a look at
  the code, and I couldn't find any one place where I could override getting
  and setting of coordinates. Is there some way to do this that I've missed?


# Future

Here is a list of ideas for how this might be enhanced in the future.

## Blocks for more canned ACs

For example:

* Allow any drawing block (like draw a square) to also be used to define an
  AC. Instead of the spring moving and turning, the AC would translate and
  rotate.

## Interpolation of time

We could attach an easing function to any interval between GCs. Then, for
example, you could have a zoomer that started gradually and accelerated, or
bounced, or any number of other wacky effects.

## Garden of forking paths

Sprite clones should inherit their parent's AC, but when they make a change,
it should be theirs alone.

## Capturing canvas animations

Using the library 
[spite/ccapture.js](https://github.com/spite/ccapture.js), you can 
capture canvas-based animations into little videos.


# Pie-in-the-sky plans

I originally started this based on some fanciful ideas I had after watching
Zombo play with [Crunchzilla](http://www.crunchzilla.com/). He liked it, but
had a lot of trouble with syntax errors, like missing semicolons. I started to
formulate an idea for a graphical, block-based way to program, before ever 
having learned of Scratch or Snap!.

What I had in mind, though, was something that would be strictly based on
functional programming principles.

Then I discovered Snap!, and was amazed at what a good fit it is for this idea.
One of the goals of this project, then, has been to try to find a way to adapt
the existing Snap! system to my original conception of a purely functional
way of programming.

The following are some notes I jotted down related to those goals. How far I
get in realizing them is anybody's guess.

## Principles / goals

* To the extent possible, make everything immutable
* All blocks should be reporters -- no distinction from other types.

## The world

Here are some ideas for how to do animations inside and "immutable world".

* At any point when it is rendered, we have a data structure that 
  represents everything we know about the world up to that point in time.
* That model is a function (a set of functions), and time is one 
  parameter. The return values give the renderer what it needs to draw.
* As more info arrives (e.g. two things collide) a new world data structure
  is created, layered on top of the previous, that contains overrides.
* The world comprises a set of sprites

## Sprites

* No distinction between original sprites and clones.
* Every sprite has an animation context, which is a function defining
  its position and time coordinates.
* It also has a chain of "actions", like "pen up", "move 5 spaces".
  These, however, do not mutate anything; they are just functions that
  describe the state of the sprite at any given time.
* State variables:
    * position (in it's own animation context)
    * pen color
    * direction
    * pen size
* As much as possible, make all the existing blocks work in the new 
  framework. 


# History / milestones

See [history/README.md](history/README.md) for some intermediate results.



# Other software

Here is a list of other work that might be relevant.

## Flowy

* [Demo page](http://test.tjvr.org/flowy4/) - this looks really cool.
  It is data pipelines using scratch blocks.
* By [blob8108](https://twitter.com/blob8108) - on Twitter. He posts a lot of
  demo videos and such to twitter.
* I posted some comments/questions to him
  [here](https://scratch.mit.edu/discuss/topic/4464/?page=194#post-2041047).

## pixie / visual

This is a completely independent (I think) port of Scratch blocks to 
JavaScript.

On GitHub:

* [nathan/pixie](https://github.com/nathan/pixie)
* [nathan/visual](https://github.com/nathan/visual)

