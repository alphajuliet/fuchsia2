// -----------------------------------------
// fuchsia.js
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------
// Object: info
var Info = {
	name: "fuchsia",
	author: "AndrewJ", 
	version: "2.0.1",
	date: "2011-06-13",
	appendTo: function(tagName) {
		var src = document.getElementById(tagName);
		var title = document.createElement('span');
		title.className = 'title';
		title.appendChild(document.createTextNode(this.name));
		var str = document.createElement('p');
		str.appendChild(title);
		str.appendChild(document.createTextNode(this.version));
		src.appendChild(str);
	},
}

var supportsTouch = 'createTouch' in document;
var debug = true;

// -----------------------------------------
// Storage options
// store = new sqlDB();
// store = new html5Storage();
store = new DovetailDBStore();

// -----------------------------------------
var captured = null;
var highestZ = 0;
var highestId = 0;

var colours = [
	'#ffffff','#d0d0d0','#777777','#000000', 				// monochromes
	'#ffaaaa','#ff00ff', '#ff0000','#aa0000','#9000ff', // reds
	'#ff6c00', '#ffff00', '#ffbb00', '#f0e68c','#d2b229', // browns/oranges/yellows
	'#aaffaa','#00ff00','#00aa00','#6b8e23','#007700', // greens
	'#bbddff','#00ffdd', '#aaaaff','#0000ff','#0000aa' // blues
];
 
// -----------------------------------------
function Note() {
    var self = this;
 
    var note = document.createElement('div');
    note.className = 'note';
    note.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    note.addEventListener('click', function() { return self.onNoteClick() }, false); 
    // iPad drag note
    supportsTouch && note.addEventListener('touchstart', function (e) { return self.onTouchStart(e) }, false);
    supportsTouch && note.addEventListener('touchend', function (e) { return self.onTouchEnd(e) }, false);
    supportsTouch && note.addEventListener('touchcancel', function (e) { return self.onTouchEnd(e) }, false);
    this.note = note;
 
    var close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener('click', function(event) { return self.close(event) }, false);
    note.appendChild(close);
 
    var edit = document.createElement('div');
    edit.className = 'edit';
    edit.setAttribute('contentEditable', true);
    edit.addEventListener('keyup', function() { return self.onKeyUp() }, false);
    note.appendChild(edit);
    this.editField = edit;
 
    var ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    note.appendChild(ts);
    this.lastModified = ts;
 
    var colour = document.createElement('div');
    colour.className = 'colourButton';
    colour.addEventListener('click', function(event) { return self.changeColour(event) }, false);
    note.appendChild(colour);
    
    document.body.appendChild(note);
    return this;
}
 
// -----------------------------------------
Note.prototype = {
    get id() {
        if (!("_id" in this))
            this._id = 0;
        return this._id;
    },
 
    set id(x) { this._id = x;},
    get text() { return this.editField.innerHTML; },
    set text(x) { this.editField.innerHTML = x; },
    
    get timestamp() {
        if (!("_timestamp" in this))
            this._timestamp = 0;
        return this._timestamp;
    },
 
    set timestamp(x) {
        if (this._timestamp == x)
            return;
 
        this._timestamp = x;
        var date = new Date();
        date.setTime(parseFloat(x));
        this.lastModified.textContent = modifiedString(date);
    },
 
    get left() { return this.note.style.left; },
    set left(x) { this.note.style.left = x; },
    get top() { return this.note.style.top; },
    set top(x) { this.note.style.top = x; },
    get zIndex() { return this.note.style.zIndex; },
    set zIndex(x) { this.note.style.zIndex = x; }, 
//    get bgcolor() { return this.style.backgroundColor; },
//    set bgcolor(c) { this.style.backgroundColor = c; },
 
    close: function(event) {
        this.cancelPendingSave();
 
        var note = this;
        store.deleteNote(note);

        var duration = event.shiftKey ? 2 : .25;
        this.note.style.webkitTransition = '-webkit-transform ' + duration + 's ease-in, opacity ' + duration + 's ease-in';
        this.note.offsetTop; // Force style recalc
        this.note.style.webkitTransformOrigin = "0 0";
        this.note.style.webkitTransform = 'skew(30deg, 0deg) scale(0)';
        this.note.style.opacity = '0';
 
        var self = this;
        setTimeout(function() { document.body.removeChild(self.note) }, duration * 1000);
    },
 
    saveSoon: function() {
        this.cancelPendingSave();
        var self = this;
        this._saveTimer = setTimeout(function() { self.save() }, 2000);
    },
 
    cancelPendingSave: function() {
        if (!("_saveTimer" in this))
            return;
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    },
 
    save: function() {
        this.cancelPendingSave();
 
        if ("dirty" in this) {
            this.timestamp = new Date().getTime();
            delete this.dirty;
        }
 
        var note = this;
        store.updateNote(note);
    },
 
    saveAsNew: function() {
        this.timestamp = new Date().getTime();
        var note = this;
        store.createNote(note);
    },
 
    onMouseDown: function(e) {
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;
 
        var self = this;
        if (!("mouseMoveHandler" in this)) {
            this.mouseMoveHandler = function(e) { return self.onMouseMove(e) }
            this.mouseUpHandler = function(e) { return self.onMouseUp(e) }
        }
 
        document.addEventListener('mousemove', this.mouseMoveHandler, true);
        document.addEventListener('mouseup', this.mouseUpHandler, true);
        
        return false;
    },
 
    onMouseMove: function(e) {
        if (this != captured)
            return true;
 
        this.left = e.clientX - this.startX + 'px';
        this.top = e.clientY - this.startY + 'px';
        return false;
    },
 
    onMouseUp: function(e) {
        document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        document.removeEventListener('mouseup', this.mouseUpHandler, true);
 
        this.save();
        return false;
    },
 
    onNoteClick: function(e) {
        this.editField.focus();
        getSelection().collapseToEnd();
    },
 
    onKeyUp: function() {
        this.dirty = true;
        this.saveSoon();
    },
    
    // -----------------------------------------
    // iPad touch events. Similar to mouse events above.
    // See http://developer.apple.com/library/safari/#documentation/InternetWeb/Conceptual/SafariVisualEffectsProgGuide/InteractiveVisualEffects/InteractiveVisualEffects.html
    // @@TODO Refactor these events into the mouse events above to remove duplication.
    onTouchStart: function (e) {
    	e.preventDefault();
    	if (e.targetTouches.length != 1)
    		return false;

        captured = this;
        this.startX = e.targetTouches[0].clientX - this.note.offsetLeft;
        this.startY = e.targetTouches[0].clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;

        var self = this;
        if (!("touchMoveHandler" in this)) {
            this.touchMoveHandler = function (e) { return self.onTouchMove(e) }
            this.touchEndHandler = function (e) { return self.onTouchEnd(e) }
        }
        document.addEventListener('touchmove', this.touchMoveHandler, true);
        document.addEventListener('touchend', this.touchEndHandler, true);
        document.addEventListener('touchcancel', this.touchEndHandler, true);
    },
    
    onTouchMove: function(e) {
    	e.preventDefault();
        if (this != captured)
            return true;
        this.left = e.targetTouches[0].clientX - this.startX + 'px';
        this.top = e.targetTouches[0].clientY - this.startY + 'px';
        return false;
    },

    onTouchEnd: function () {
        // debug && alert("touchEnd event");
        // e.preventDefault();
        this.save();

    	if (e.targetTouches.length > 0)
    		return false;
        document.removeEventListener('touchmove', this.touchMoveHandler, true);
        document.removeEventListener('touchend', this.touchEndHandler, true);
        document.removeEventListener('touchcancel', this.touchEndHandler, true);
    	
        return false;    	
    },
    
}
 
// -----------------------------------------
function loaded() {
	store.initialise();
}
 
// -----------------------------------------
function modifiedString(date) {
    return 'Last Modified: ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}
 
// -----------------------------------------
function newNote() {
    var note = new Note();
    note.id = ++highestId;
    note.timestamp = new Date().getTime();
    note.left = Math.round(Math.random() * 400) + 'px';
    note.top = Math.round(Math.random() * 500) + 'px';
    note.zIndex = ++highestZ;
    note.saveAsNew();
}

function deleteAllNotes() {
	store.deleteAllNotes();
}

if (store.isAvailable)
    addEventListener('load', loaded, false);

function initialise() {
	Info.appendTo("heading");
}

// -----------------------------------------
window.onload = initialise;
