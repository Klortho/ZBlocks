# Next

* Keep tests working
* Changes to AC:
    * (/)Get rid of `product`. There is no need for it. It's all `matrix`.
    * (/)Does the root *have* to be the identity matrix?
    * (/)Implement circularity - got an isLoop() flag in
    * (x)The way matrix-jig works now: time as recorded by the AC doesn't have 
      to really be wall-clock time. Allow for pause/continue, etc. That's not
      part of the AC class.

New features and tests:

* Change the test cases to make them simple to change by eyeball.

* extendBy=multiply as the default
* if relTime == 0, this AC replaces the last one in the chain, rather than
  adding on.
* The root is identity by default, but isn't necessarily so.
* isLoop
* Different ways to specify the matrix
* Chaining matrix methods




* Reimplement matrix-jig using AC.
    * Actually do implement the isLoop flag











# Znap block design

Represent points as `point` objects. Try not to make any distinction
between points and vectors -- use the same objects for both.

These should all be able to take any of various forms:

* position as point objects, thus x-y or r-angle

Make pen up / pen state implicit. Have blocks for "move to" or
"line to"






# Where next?

* It would not be easy to hook into the existing blocks -- so
  that means I need new blocks.


