# Next

* Keep tests working
* Changes to AC:
    * Get rid of `product`. There is no need for it. It's all `matrix`.
    * Does the root *have* to be the identity matrix?
    * Implement circularity

* Reimplement matrix-jig using AC.











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


