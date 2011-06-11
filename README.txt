Fuchsia2
======

Description
------------
Fuchsia2 is an HTML5 version of the original Fuchsia, starting simpler, and gradually implementing more functions.  It will be simpler and have fewer functions than the original Fuchsia. It currently does not require any external libraries, even jQuery. 

It is based on an HTML5 [demo page](http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/) that uses the [Web SQL Database][] API. However, this API is no longer being developed.

Backlog
---------
* Delete all notes
* Change the colour of a note
* Implement cloud storage using CloudDB
* Make browser independent
   * Use [Modernizr][] to detect browser capabilities
   * Use [jQuery][] to isolate browser differences

Done
------
* Re-implement offline storage using [HTML5 Storage][]
   
Links
------
[HTML5 Storage]: http://diveintohtml5.org/storage.html
[jQuery]: http://jquery.com/
[Modernizr]: http://www.modernizr.com/
[Web SQL Database]: http://dev.w3.org/html5/webdatabase/


The End.
