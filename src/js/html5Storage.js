// -----------------------------------------
// HTML5 storage

"use strict";

function html5Storage() {
	 
	let prefix = "fuchsia2.";
	
	// ---------------------------------------
	this.isAvailable = function () {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	
	// ---------------------------------------
	this.initialise = function () {
		this.loadNotes();
	}
	
	// ---------------------------------------
	this.createNote = function (note) {
		const encodedColour = encodeURIComponent(note.colour);
		localStorage[prefix + note.id] = [note.text, encodedColour, note.timestamp, note.left, note.top, note.zIndex];
	}
	
	// ---------------------------------------
	this.updateNote = function (note) {
		const encodedColour = encodeURIComponent(note.colour);
		localStorage[prefix + note.id] = [note.text, encodedColour, note.timestamp, note.left, note.top, note.zIndex];
	}
	
	// ---------------------------------------
	this.deleteNote = function (note) {
		localStorage.removeItem(prefix + note.id);
	}
	
	// ---------------------------------------
	this.deleteAllNotes = function () {
		localStorage.clear();
	}
	
	// ---------------------------------------
	// Iterate over the local store. 
	// Execute fn1 for each key-value pair, or execute fn2 if none.
	this.forEach = function (fn1, fn2) {
		const len = localStorage.length;
		if (len == 0)
			fn2();
		for (let i=0; i<len; i++) {
			const k = localStorage.key(i);
			const v = localStorage[k];
			fn1(k, v);
		}
	}
	
	// ---------------------------------------
 	this.loadNotes = function () {
		this.forEach(function (key, val) {
			const note = new Note();
			let v = val.split(',');
			note.id = key.substr(prefix.length, key.length-1);
			note.text = v.shift();
			note.colour = decodeURIComponent(v.shift());
			note.timestamp = v.shift();
			note.left = v.shift();
			note.top = v.shift();
			note.zIndex = v.shift();

			if (note.id > highestId)
				highestId = note.id;
			if (note.zIndex > highestZ)
				highestZ = note.zIndex;
		}, function () {
			// newNote();
		});
	}
	
	// ---------------------------------------
	if (!this.isAvailable)
		alert("Local storage not available. Please use an HTML5 compatible browser.");
}

