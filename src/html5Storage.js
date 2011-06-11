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
	this.loadNotes = function () {		
		var len = localStorage.length;
		if (len == 0) 
			newNote();
		else {
			for (var i=0; i<len; i++) {
				if (localStorage.key(i).substr(0, prefix.length) == prefix) {
					var k = localStorage.key(i);
					var v = localStorage[k].split(','); // array
					var note = new Note();
					note.id = k.substr(prefix.length, k.length-1);
					note.text = v[0];
					note.timestamp = v[1];
					note.left = v[2];
					note.top = v[3];
					note.zIndex = parseInt(v[4]);

					if (note.id > highestId)
						highestId = note.id;
					if (note.zIndex > highestZ)
						highestZ = note.zIndex;
				}
			}
		}
	}
	
	// ---------------------------------------
	if (!this.isAvailable)
		alert("Local storage not available. Please use an HTML5 compatible browser.");
}

