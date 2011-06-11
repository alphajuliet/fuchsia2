// -----------------------------------------
// HTML5 storage

function html5Storage() {
	 
	var prefix = "fuchsia2.";
	
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
		localStorage[prefix + note.id] = [note.text, note.timestamp, note.left, note.top, note.zIndex];
	}
	
	// ---------------------------------------
	this.updateNote = function (note) {
		localStorage[prefix + note.id] = [note.text, note.timestamp, note.left, note.top, note.zIndex];
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
		var len = localStorage.length;
		if (len == 0)
			fn2();
		for (var i=0; i<len; i++) {
			var k = localStorage.key(i);
			var v = localStorage[k];
			fn1(k, v);
		}
	}
	
	// ---------------------------------------
 	this.loadNotes = function () {
		this.forEach(function (key, val) {
			var v = val.split(',');
			var note = new Note();
			note.id = key.substr(prefix.length, key.length-1);
			note.text = v[0];
			note.timestamp = v[1];
			note.left = v[2];
			note.top = v[3];
			note.zIndex = v[4];
			// note.bgColor = v[5];

			if (note.id > highestId)
				highestId = note.id;
			if (note.zIndex > highestZ)
				highestZ = note.zIndex;
		}, function () {
			newNote();
		});
	}
	
	// ---------------------------------------
	if (!this.isAvailable)
		alert("Local storage not available. Please use an HTML5 compatible browser.");
}

