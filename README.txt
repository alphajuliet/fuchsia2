Fuchsia2
======

Version: 2.0.1

Description
------------
Fuchsia2 is an HTML5 version of the original Fuchsia, starting simpler, and gradually implementing more functions.  It will be simpler and have fewer functions than the original Fuchsia. It currently does not require any external libraries, even jQuery. 

It is based on an HTML5 [demo page](http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/) that uses the [Web SQL Database][] API. However, this API is no longer being developed.

Backlog
---------
* Make it work on iPad
	* Edit note text on iPad --> waiting on update to MobileSafari to support the HTML5 contentEditable attribute
	* Increase text size on iPad
	* Remove browser bar on iPad
* Delete all notes
* Change the colour of a note
* Make browser independent
	* Use [Modernizr][] to detect browser capabilities
	* Use [jQuery][] to isolate browser differences
* Save and load separate sessions
* Refactor event handling
* Enable offline working and resync back to cloud store
* Make it work on my Android phone

Done
------
* Re-implement offline storage using [HTML5 Storage][]
* Implement cloud storage using [DovetailDB][]
* Drag notes on iPad
   

[DovetailDB]: http://millstonecw.com/dovetaildb/
[HTML5 Storage]: http://diveintohtml5.org/storage.html
[jQuery]: http://jquery.com/
[Modernizr]: http://www.modernizr.com/
[Web SQL Database]: http://dev.w3.org/html5/webdatabase/
