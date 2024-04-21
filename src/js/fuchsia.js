// -----------------------------------------
// fuchsia.js
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------
"use strict";

// Object: info
const Info = {
	name: "fuchsia",
	author: "AndrewJ", 
	version: "2.0.2",
	date: "2024-04-20",
	appendTo: function(tagName) {
		const src = document.getElementById(tagName);
		const title = document.createElement('span');
		title.className = 'title';
		title.appendChild(document.createTextNode(this.name));
		const str = document.createElement('p');
		str.appendChild(title);
		str.appendChild(document.createTextNode(this.version));
		src.appendChild(str);
	},
}

const supportsTouch = 'createTouch' in document;
const debug = true;

// -----------------------------------------
// Storage options
let notes = [];
const store = new html5Storage();

// -----------------------------------------
let captured = null;
let highestZ = 0;
let highestId = 0; // Global id counter

const colours = [
    '#ffffff', '#aaaaaa', '#cccccc', 		   // monochromes
    '#ffcccc', '#ffccff', '#ddaaaa', '#cc8888', '#ff88cc', // reds
    '#ff8844', '#ffff88', '#ffcc44', '#f0e68c', '#f2c249', // browns/oranges/yellows
    '#aaffaa', '#88ff88', '#77cc77', '#8bae43', '#77ccaa', // greens
    '#bbddff', '#88ffcc', '#ccccff', '#aaffff', '#88aacc'  // blues
];

// -----------------------------------------
function Note() {
    let self = this;
 
    const note = document.createElement('div');
    note.className = 'note';
    note.setAttribute('id', `note_${this.id}`);
    note.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    note.addEventListener('click', function() { return self.onNoteClick() }, false); 
    // iPad drag note
    supportsTouch && note.addEventListener('touchstart', function (e) { return self.onTouchStart(e) }, false);
    supportsTouch && note.addEventListener('touchend', function (e) { return self.onTouchEnd(e) }, false);
    supportsTouch && note.addEventListener('touchcancel', function (e) { return self.onTouchEnd(e) }, false);
    this.note = note;
 
    const close = document.createElement('div');
    close.className = 'closebutton';
    close.addEventListener('click', function(event) { return self.close(event) }, false);
    note.appendChild(close);
 
    const edit = document.createElement('div');
    edit.className = 'edit';
    edit.setAttribute('contentEditable', true);
    edit.addEventListener('keyup', function() { return self.onKeyUp() }, false);
    edit.addEventListener("paste", function(e) { 
        e.preventDefault(); 
        const text = e.clipboardData.getData("text/plain"); 
        document.execCommand("insertHTML", false, text); 
    }, false);
    note.appendChild(edit);
    this.editField = edit;
 
    const ts = document.createElement('div');
    ts.className = 'timestamp';
    ts.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
    // note.appendChild(ts);
    this.lastModified = ts;
 
    const colour = document.createElement('button');
    colour.className = 'colourButton';
    colour.setAttribute('type', 'button');
    colour.innerText = 'C';
    colour.addEventListener('click', function(event) { return self.changeColour(event) }, false);
    note.appendChild(colour);
    
    document.getElementById('notes').appendChild(note);
    return this;
}
 
// -----------------------------------------
Note.prototype = {
    get id() {
        if (!("_id" in this))
            this._id = ++highestId;
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
        let date = new Date();
        date.setTime(parseFloat(x));
        this.lastModified.textContent = modifiedString(date);
    },
 
    get colour() { return this.note.style.backgroundColor; },
    set colour(c) { this.note.style.backgroundColor = c; },
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
 
        let note = this;
        store.deleteNote(note);

        let duration = event.shiftKey ? 2 : .25;
        this.note.style.webkitTransition = '-webkit-transform ' + duration + 's ease-in, opacity ' + duration + 's ease-in';
        this.note.offsetTop; // Force style recalc
        this.note.style.webkitTransformOrigin = "0 0";
        this.note.style.webkitTransform = 'skew(30deg, 0deg) scale(0)';
        this.note.style.opacity = '0';
 
        let self = this;
        setTimeout(function() { document.body.removeChild(self.note) }, duration * 1000);
    },

    changeColour: function(event) {
        const self = this;
        self.colour = randomColour();
    },
 
    saveSoon: function() {
        this.cancelPendingSave();
        const self = this;
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
 
        let note = this;
        store.updateNote(note);
    },
 
    saveAsNew: function() {
        this.timestamp = new Date().getTime();
        const note = this;
        store.createNote(note);
    },
 
    onMouseDown: function(e) {
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;
 
        const self = this;
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

        const captured = this;
        this.startX = e.targetTouches[0].clientX - this.note.offsetLeft;
        this.startY = e.targetTouches[0].clientY - this.note.offsetTop;
        this.zIndex = ++highestZ;

        const self = this;
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

function randomColour() {
    return colours[Math.floor(Math.random() * colours.length)];
}

function exportNotesText() {
    const dialog = document.getElementById('output');
    const dialogText = document.getElementById('dialogText');
    const exportText = notes.map(note => `<p>${note.text}</p>`).join("");
    dialogText.innerHTML = exportText;
    dialog.showModal();
    let range = new Range();
    range.selectNode(dialogText);
}
 
// -----------------------------------------
function newNote() {
    let note = new Note();
    note.id = ++highestId;
    note.timestamp = new Date().getTime();
    note.left = Math.round(Math.random() * 400) + 'px';
    note.top = Math.round(Math.random() * 500) + 'px';
    note.zIndex = ++highestZ;
    note.colour = randomColour();
    note.saveAsNew();
    note.note.getElementsByClassName('edit')[0].focus();
    notes.push(note);
}

function deleteAllNotes() {
	store.deleteAllNotes();
    notes = [];
    document.getElementById('notes').innerHTML = '';
}

if (store.isAvailable)
    addEventListener('load', loaded, false);

function randomInRange(a, b) {
    return Math.random() * (b - a) + a;
}

function randomiseLocations() {
    const margin = 100;
    const width = window.innerWidth;
    const height = window.innerHeight;
    for (let i = 0; i < notes.length; i++) {
        notes[i].left = randomInRange(margin, width - 2*margin) + 'px';
        notes[i].top = randomInRange(margin, height - 2*margin) + 'px';
    }
}

function addButtons() {
    const buttons = document.getElementById('buttons');

    const newNoteButton = document.createElement('button');
    newNoteButton.onclick = newNote;
    newNoteButton.accessKey = 'n';
    newNoteButton.innerHTML = 'New Note';
    newNoteButton.disabled = !store.isAvailable;
    buttons.appendChild(newNoteButton);

    const clearNotesButton = document.createElement('button');
    clearNotesButton.onclick = deleteAllNotes;
    clearNotesButton.innerHTML = 'Remove All';
    buttons.appendChild(clearNotesButton);

    const randomiseButton = document.createElement('button');
    randomiseButton.onclick = randomiseLocations;
    randomiseButton.innerHTML = 'Randomise Locations';
    buttons.appendChild(randomiseButton);

    const exportTextButton = document.createElement('button');
    exportTextButton.onclick = exportNotesText;
    exportTextButton.innerHTML = 'Export Text';
    buttons.appendChild(exportTextButton);
}


function initialise() {
	Info.appendTo("heading");
    addButtons();
}

// -----------------------------------------
window.onload = initialise;
