# znap!

I've been playing around a little bit with 
[Snap!](http://snap.berkeley.edu/snapsource/snap.html). This is a sandox to 
try out some ideas for a more functional-programming oriented way of doing
graphics and animations.

# Development

To work on this, make sure you clone with `--recursive`, because it uses the
Snap! repo as a submodule. Then, start the server:

```
git clone --recursive git@github.com:Klortho/znap.git
./run-server.sh
```

The submodule is [my fork of the Snap!](git@github.com:Klortho/snap.git), 
but haven't found it necessary to override anything yet. I'm using a 
proxying HTTP server, currently, to override the snap.html file, so that
I can add my custom `<script>` tag.

I also have [this js-fiddle](http://jsfiddle.net/klortho/gopr0buu/3/) where
I am playing with canvas and the transformation matrix library.


# The code

What I have so far is in two places:

* zbman.js - JavaScript code that I'm loading directly, from a `<script>` tag.
  I think, eventually, there's no reason this couldn't be put into a 
  Snap! block.
* history/ - Snap! projects and related stuff that I've done along the way.


# Immediate to-do

* Get back to a working spiral generator, like I had at tag `square-spiral-v1`.
  See [history/README.md](history/README.md). Here's a "flowchart" of how it
  works:
    * Green flag pressed - call Znap.init()
    * In Snap!, initialize the sprite as you normally would (i.e. blocks for
      `clear`, `pen up`, `move to 0, 0`, etc.)
    * Execute the zoomer block. This needs to be re-written. It contains a
      short JavaScript block than calls a Znap method, that instantiates a 
      new animation context, and binds it to this sprite.
    * Forever:
        * Draw a square. For now, continue to use a custom drawing block that
          calls a JS function to find out where it's *really* supposed to go.

* How can integrate most easily with online snap? Can I auto-generate a Snap 
  project that has all the javascript code in custom blocks?
* For motion, can I reuse the existing blocks? See if I can hook into primitive
  functions for setting state, so as to apply my transformations.


# Design ideas

## Principles / goals

* To the extent possible, make everything immutable, both conceptually and
  in implementation. This is an exercise to see what the difficulties 
  are.
* All blocks should be reporters -- no distinction from other types.

## The world

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
  framework. ***Question:*** Can I hook in to whatever primitive 
  functions exist for changing state?

## Animation context

This is analogous to a gradient in graphics, in that it describes smooth 
transitions between a set of "stops". Each stop is at a point in time, and
the thing described by the stop is an affine transformation of the coordinates.

An animation context comprises a linked list. The atoms of the list could
be called graphical contexts (but there's no separate class for them).

Some graphical contexts are stops, others are not. For example, say the ones
marked with an asterisk are stops:

```
*root  <-  gc1  <-  *gc2  <-  gc3  <-  gc4  <-  *gc5
```

This describes three stops. The transforms at each stop are:

- stop 0 - identity - the root is always a stop, and is always identity
- stop 1 - gc1 X gc2
- stop 2 - gc3 X gc4 X gc5

Animation contexts are constructed using times relative to the previous, but 
they just accumulate, and the times are all stored as absolute. So, no time
transformations (yet).

To convert a point's coordinates from a sprite's frame to the canvas frame:

* Find the interval in which t appears - the prev and next graphical contexts
* interpolate between those two
* transform


# Future

After getting the basic idea working, I would add some more features.

## Interpolation of time

This wouldn't have to be as complex as trying to 
figure out how to generalize an affine matrix to 4X4, but could be as 
simple as attaching an easing function to any interval between animation 
contexts.

Then, you could animate harmonic oscillators, cycles, and all kinds of other
things.

## Garden of forking paths

Sprite clones should inherit their parent's AC, but when they make a change,
it should be theirs alone.


# How-tos / miscellaneous notes

## Javascript blocks

See the "JavaScript" example in Snap! (Open -> examples).

See also the [history/](history/) folder here.


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

