// -----------------------------------------
// Web SQL database

function sqlDB() {
	var db = null;
	 
	try {
		if (window.openDatabase) {
			db = openDatabase("fuchsia2", "0.0", "Note storage", 200000);
			if (!db)
				alert("Failed to open the database on disk.  This is probably because the version was bad or there is not enough space left in this domain's quota");
		} else
			alert("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
	} catch(err) {
		db = null;
		alert("Couldn't open the database.  Please try with a WebKit nightly with this feature enabled");
	}	
	
	// ---------------------------------------
	this.isAvailable = function () {
		return (db != null);
	}
	
	// ---------------------------------------
	this.initialise = function () {
		db.transaction(function(tx) {
			tx.executeSql("SELECT COUNT(*) FROM WebkitStickyNotes", [], function(result) {
				store.loadNotes();
			}, function(tx, error) {
				tx.executeSql("CREATE TABLE WebKitStickyNotes (id REAL UNIQUE, note TEXT, timestamp REAL, left TEXT, top TEXT, zindex REAL)", [], function(result) { 
					store.loadNotes(); 
				});
			});
		});
	}
	
	// ---------------------------------------
	this.createNote = function (note) {
		db.transaction(function (tx)  {
            tx.executeSql("INSERT INTO WebKitStickyNotes (id, note, timestamp, left, top, zindex) VALUES (?, ?, ?, ?, ?, ?)", [note.id, note.text, note.timestamp, note.left, note.top, note.zIndex]);
        }); 		
	}
	
	// ---------------------------------------
	this.updateNote = function (note) {
		db.transaction(function (tx) {
            tx.executeSql("UPDATE WebKitStickyNotes SET note = ?, timestamp = ?, left = ?, top = ?, zindex = ? WHERE id = ?", [note.text, note.timestamp, note.left, note.top, note.zIndex, note.id]);
        });
	}
	
	// ---------------------------------------
	this.deleteNote = function (note) {
		db.transaction(function(tx) {
            tx.executeSql("DELETE FROM WebKitStickyNotes WHERE id = ?", [note.id]);
        });
	}
	
	// ---------------------------------------
	this.loadNotes = function () {
		db.transaction(function(tx) {
			tx.executeSql("SELECT id, note, timestamp, left, top, zindex FROM WebKitStickyNotes", [], function(tx, result) {
				for (var i = 0; i < result.rows.length; ++i) {
					var row = result.rows.item(i);
					var note = new Note();
					note.id = row['id'];
					note.text = row['note'];
					note.timestamp = row['timestamp'];
					note.left = row['left'];
					note.top = row['top'];
					note.zIndex = row['zindex'];
	 
					if (row['id'] > highestId)
						highestId = row['id'];
					if (row['zindex'] > highestZ)
						highestZ = row['zindex'];
				}
	 
				if (!result.rows.length)
					newNote();
			}, function(tx, error) {
				alert('Failed to retrieve notes from database - ' + error.message);
				return;
			});
		});
	}
}

