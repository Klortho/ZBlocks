How does this work:
- http://snap.berkeley.edu/init redirects to a URL that auto-loads the
  "tools":
  http://snap.berkeley.edu/snapsource/snap.html#open:http://snap.berkeley.edu/snapsource/tools.xml

* Can I point it at any URL?
    - Try  http://snap.berkeley.edu/snapsource/libraries/list-utilities.xml
      works.
    - Try cloning to nicolausmaloney.org, and
      http://nicolausmaloney.org/znap/snap/libraries/list-utilities.xml:
      http://snap.berkeley.edu/snapsource/snap.html#open:http://nicolausmaloney.org/znap/snap/libraries/list-utilities.xml
    - Works, once I set the CORS headers

* What about GH?
    - https://raw.githubusercontent.com/Klortho/snap/05bb73e01073c7e3a54e4f549359f2b24517f5ab/libraries/leap-library.xml

http://snap.berkeley.edu/snapsource/snap.html#open:https://raw.githubusercontent.com/Klortho/snap-blocks/master/libraries/cases.xml


--------------------
* Get spiral working


* Make it into a regular snap project.
* Can I hook into existing blocks?
* Get all tests working again, and a build procedure.
* Combine matrix-jig and animation-contexts


----

Blocks:

* ( x' position )
* ( y' position )
* ( x' position in [t] seconds )
* ( y' position in [t] seconds )


----
Let's use real time.


strategy:

* Get drawing a box in a loop working





