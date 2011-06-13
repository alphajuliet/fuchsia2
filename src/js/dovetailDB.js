// -----------------------------------------
// Cloud storage on [DovetailDB](http://millstonecw.com/dovetaildb/)

function DovetailDBStore() {
	
	var bagName = "andrewj";
	
	// ---------------------------------------
	this.isAvailable = function () {
		return (dovetail != null);
	}
	
	// ---------------------------------------
	this.initialise = function () {
		dovetail.defaults.accesskey = "HCYb3Wzgju6u27irLQ0QkNPvIUmTiy1C";
		dovetail.defaults.db = "com.alphajuliet.fuchsia2";		
		this.loadNotes();
	}
	
	// ---------------------------------------
	this.createNote = function (note) {
		var n = {
			text: note.text,
			timestamp: note.timestamp,
			left: note.left,
			top: note.top,
			zIndex: note.zIndex
		};
		dovetail.insert(bagName, n, function (id) {
			note.id = id;	
		});
	}
	
	// ---------------------------------------
	this.updateNote = function (note) {
		var n = {
			text: note.text,
			timestamp: note.timestamp,
			left: note.left,
			top: note.top,
			zIndex: note.zIndex
		};
		dovetail.update(bagName, note.id, n); 
	}
	
	// ---------------------------------------
	this.deleteNote = function (note) {
		dovetail.remove(bagName, note.id);
	}
	
	// ---------------------------------------
	this.deleteAllNotes = function () {
/*  		dovetail.query(bagName, { id_min: "0" }, function (rows) {
			for (var i=0; i<rows.length; i++) {
				dovetail.remove(bagName, rows[i].id);
			}
		});
 */
 		alert("Info: Not implemented yet.");
	}
		
	// ---------------------------------------
 	this.loadNotes = function () {
 		dovetail.query(bagName, { id_min: "0" }, function (rows) {
 			// alert("Info: Loaded " + rows.length + " notes from the database");
			for (var i=0; i<rows.length; i++) {
				var e = rows[i];
				var note = new Note();
				note.id = e.id;
				note.text = e.text;
				note.timestamp = e.timestamp;
				note.left = e.left;
				note.top = e.top;
				note.zIndex = e.zIndex;

				if (note.id > highestId)
					highestId = note.id;
				if (note.zIndex > highestZ)
					highestZ = note.zIndex;
			}
 		});
	}
	
	// ---------------------------------------
	if (!this.isAvailable)
		alert("Cloud storage not available.");
}

