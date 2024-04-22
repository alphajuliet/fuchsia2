// note.js

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
 
    const deleteButton = document.createElement('div');
    deleteButton.className = 'deleteButton';
    deleteButton.addEventListener('click', function(event) { return self.delete(event) }, false);
    note.appendChild(deleteButton);
 
    const colourButton = document.createElement('button');
    colourButton.className = 'colourButton';
    colourButton.addEventListener('click', function(event) { return self.changeColour(event) }, false);
    note.appendChild(colourButton);
    
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
 
    delete: function(event) {
        this.cancelPendingSave();
 
        let note = this;
        store.deleteNote(note);

        let duration = event.shiftKey ? 2 : .25;
        this.note.style.webkitTransition = '-webkit-transform ' + duration + 's ease-in, opacity ' + duration + 's ease-in';
        this.note.offsetTop; // Force style recalc
        this.note.style.webkitTransformOrigin = "0 0";
        this.note.style.webkitTransform = 'skew(30deg, 0deg) scale(0)';
        this.note.style.opacity = '0';
 
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

// The End 