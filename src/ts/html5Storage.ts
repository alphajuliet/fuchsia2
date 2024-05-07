// -----------------------------------------
// HTML5 storage

class Html5Storage {

	private prefix = "fuchsia2.";

	// ---------------------------------------
	public isAvailable(): boolean {
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	
	// ---------------------------------------
	public initialise() {
		this.loadNotes();
	}
	
	// ---------------------------------------
	public createNote(note: Note) {
		const encodedColour = encodeURIComponent(note.colour);
		localStorage[this.prefix + note.id] = [note.text, encodedColour, note.timestamp, note.left, note.top, note.zIndex];
	}
	
	// ---------------------------------------
	public updateNote(note: Note) {
		const encodedColour = encodeURIComponent(note.colour);
		localStorage[this.prefix + note.id] = [note.text, encodedColour, note.timestamp, note.left, note.top, note.zIndex];
	}
	
	// ---------------------------------------
	public deleteNote(note: Note) {
		localStorage.removeItem(this.prefix + note.id);
	}
	
	// ---------------------------------------
	public deleteAllNotes() {
		localStorage.clear();
	}
	
	// ---------------------------------------
	// Iterate over the local store. 
	// Execute fn1 for each key-value pair, or execute fn2 if none.
	public forEach(fn1: (key: string, val: string) => void, fn2: () => void) {
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
	private loadNotes() {
		this.forEach((key, val) => {
			if (key.startsWith(this.prefix)) {
				const note = new Note();
				const v = val.split(',');
				note.id = parseInt(key.substring(this.prefix.length));
				note.text = v.shift();
				note.colour = decodeURIComponent(v.shift());
				note.timestamp = parseInt(v.shift());
				note.left = parseInt(v.shift()).toString();
				note.top = parseInt(v.shift()).toString();
				note.zIndex = parseInt(v.shift()).toString();

				if (note.id > highestId)
					highestId = note.id;
				if (parseInt(note.zIndex) > highestZ)
					highestZ = parseInt(note.zIndex);
				notes.push(note);
			}
		}, () => {
			// newNote();
		});
	}
	
	// ---------------------------------------
	constructor() {
		if (!this.isAvailable)
			alert("Local storage not available. Please use an HTML5 compatible browser.");
	}
}

// const html5Storage = new Html5Storage();

// The End