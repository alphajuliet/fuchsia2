// -----------------------------------------
// HTML5 storage

class Html5Storage {
	private readonly prefix = "fuchsia2.";
	private readonly _isAvailable: boolean;

	constructor() {
		this._isAvailable = this.checkAvailability();
		if (!this._isAvailable) {
			alert("Local storage not available. Please use an HTML5 compatible browser.");
		}
	}

	// ---------------------------------------
	private checkAvailability(): boolean {
		try {
			return 'localStorage' in window && window.localStorage !== null;
		} catch (e) {
			return false;
		}
	}

	// ---------------------------------------
	public get isAvailable(): boolean {
		return this._isAvailable;
	}
	
	// ---------------------------------------
	public initialise(): void {
		this.loadNotes();
	}
	
	// ---------------------------------------
	public createNote(note: Note): void {
		this.saveNoteToStorage(note);
	}
	
	// ---------------------------------------
	public updateNote(note: Note): void {
		this.saveNoteToStorage(note);
	}
	
	// ---------------------------------------
	private saveNoteToStorage(note: Note): void {
		const encodedColour = encodeURIComponent(note.colour);
		const key = this.prefix + note.id;
		const value = [note.text, encodedColour, note.timestamp, note.left, note.top, note.zIndex].join(',');
		localStorage.setItem(key, value);
	}
	
	// ---------------------------------------
	public deleteNote(note: Note): void {
		localStorage.removeItem(this.prefix + note.id);
	}
	
	// ---------------------------------------
	public deleteAllNotes(): void {
		// Only clear items with our prefix to avoid clearing other app data
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith(this.prefix)) {
				localStorage.removeItem(key);
			}
		}
	}
	
	// ---------------------------------------
	// Iterate over the local store. 
	// Execute fn1 for each key-value pair, or execute fn2 if none.
	public forEach(fn1: (key: string, val: string) => void, fn2: () => void): void {
		const len = localStorage.length;
		if (len === 0) {
			fn2();
			return;
		}
		
		for (let i = 0; i < len; i++) {
			const k = localStorage.key(i);
			if (k === null) continue;
			
			const v = localStorage.getItem(k);
			if (v !== null) {
				fn1(k, v);
			}
		}
	}
	
	// ---------------------------------------
	private loadNotes(): void {
		this.forEach((key, val) => {
			if (key.startsWith(this.prefix)) {
				const note = new Note();
				const v = val.split(',');
				
				if (v.length < 6) {
					console.warn(`Invalid note data for key ${key}`);
					return;
				}
				
				try {
					note.id = parseInt(key.substring(this.prefix.length), 10);
					note.text = v[0] || '';
					note.colour = decodeURIComponent(v[1] || '');
					note.timestamp = parseInt(v[2] || '0', 10);
					note.left = parseInt(v[3] || '0', 10) + 'px';
					note.top = parseInt(v[4] || '0', 10) + 'px';
					note.zIndex = parseInt(v[5] || '0', 10).toString();

					if (note.id > highestId) {
						highestId = note.id;
					}
					
					const zIndex = parseInt(note.zIndex, 10);
					if (zIndex > highestZ) {
						highestZ = zIndex;
					}
					
					notes.push(note);
				} catch (e) {
					console.error(`Error loading note with key ${key}:`, e);
				}
			}
		}, () => {
			// Empty storage, no action needed
		});
	}
}