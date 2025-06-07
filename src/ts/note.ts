// note.ts

/**
 * Represents a sticky note in the application
 * Implements the INote interface
 */
class Note implements INote {
    private _id: number = 0;
    private _timestamp: number = 0;
    private _saveTimer?: number;

    private static _highestId = 0;
    public static highestZ = 0;

    private readonly note: HTMLDivElement;
    private readonly editField: HTMLDivElement;
    private readonly lastModified: HTMLDivElement;
    
    private draggable: NoteDraggable;
    private controls: NoteControls;
    private dirty: boolean = false;

    /**
     * Get the note's DOM element
     */
    public get noteDiv(): HTMLDivElement { 
        return this.note; 
    }

    /**
     * Get or set the note's ID
     */
    public get id(): number {
        if (!this._id) {
            this._id = ++Note._highestId;
        }
        return this._id;
    }
    
    public set id(value: number) { 
        this._id = value; 
    }
    
    /**
     * Get or set the note's text content
     */
    public get text(): string { 
        return this.editField.innerHTML; 
    }
    
    public set text(value: string) { 
        this.editField.innerHTML = value; 
    }

    /**
     * Get or set the note's timestamp
     */
    public get timestamp(): number {
        if (!this._timestamp) {
            this._timestamp = 0;
        }
        return this._timestamp;
    }
    
    public set timestamp(value: number) {
        if (this._timestamp === value) {
            return;
        }
        this._timestamp = value;
        const date = new Date();
        date.setTime(value);
        this.lastModified.textContent = modifiedString(date);
    }

    /**
     * Get or set the note's background color
     */
    public get colour(): string { 
        return this.note.style.backgroundColor; 
    }
    
    public set colour(value: string) { 
        this.note.style.backgroundColor = value; 
    }
    
    /**
     * Get or set the note's left position
     */
    public get left(): string { 
        return this.note.style.left; 
    }
    
    public set left(value: string) { 
        this.note.style.left = value; 
    }
    
    /**
     * Get or set the note's top position
     */
    public get top(): string { 
        return this.note.style.top; 
    }
    
    public set top(value: string) { 
        this.note.style.top = value; 
    }
    
    /**
     * Get or set the note's z-index
     */
    public get zIndex(): string { 
        return this.note.style.zIndex; 
    }
    
    public set zIndex(value: string) { 
        this.note.style.zIndex = value; 
    }

    /**
     * Create a new note
     */
    constructor() {
        // Create the main note element
        const note = document.createElement('div');
        note.className = 'note';
        note.setAttribute('id', `note_${this.id}`);
        note.addEventListener('click', () => this.onNoteClick(), false);
        this.note = note;

        // Create the editable content area
        const edit = document.createElement('div');
        edit.className = 'edit';
        edit.setAttribute('contentEditable', 'true');
        edit.addEventListener('keyup', () => this.onKeyUp(), false);
        edit.addEventListener('paste', (e) => this.onPaste(e), false);
        note.appendChild(edit);
        this.editField = edit;

        // Create the timestamp element
        const ts = document.createElement('div');
        ts.className = 'timestamp';
        this.lastModified = ts;

        // Add note to the DOM
        const notesContainer = document.getElementById('notes');
        if (notesContainer) {
            notesContainer.appendChild(note);
        } else {
            console.error('Notes container not found');
        }

        // Create UI controls
        this.controls = new NoteControls(this);
        
        // Initialize draggable functionality
        this.draggable = new NoteDraggable(note, {
            onDragStart: () => {
                captured = this;
                this.zIndex = (++Note.highestZ).toString();
            },
            onDragMove: () => {
                this.controls.updatePositions();
            },
            onDragEnd: () => {
                this.save();
            },
            onLongPress: () => {
                this.onLongPress();
            }
        });
    }

    /**
     * Delete this note
     */
    public delete(event: Event): void {
        // Remove from the store
        this.cancelPendingSave();
        store.deleteNote(this);
        
        // Clean up draggable and controls
        this.draggable.destroy();
        this.controls.destroy();
        
        // Remove note from DOM
        this.note.remove();
        
        // Remove from the notes array
        notes = notes.filter(note => note !== this);
    }

    /**
     * Change the note's color
     */
    public changeColour(color: Color): void {
        this.colour = color;
        this.saveSoon();
    }

    /**
     * Schedule saving the note
     */
    public saveSoon(): void {
        this.cancelPendingSave();
        this._saveTimer = window.setTimeout(() => this.save(), 2000);
    }

    /**
     * Cancel any pending save operation
     */
    public cancelPendingSave(): void {
        if (this._saveTimer === undefined) {
            return;
        }
        clearTimeout(this._saveTimer);
        this._saveTimer = undefined;
    }

    /**
     * Save the note
     */
    public save(): void {
        this.cancelPendingSave();

        if (this.dirty) {
            this.timestamp = new Date().getTime();
            this.dirty = false;
        }

        store.updateNote(this);
    }

    /**
     * Save the note as a new note
     */
    public saveAsNew(): void {
        this.timestamp = new Date().getTime();
        store.createNote(this);
    }


    /**
     * Handle note click event
     */
    private onNoteClick(e?: Event): void {
        this.editField.focus();
        const sel = window.getSelection();
        if (sel && sel.anchorNode) {
            sel.collapseToEnd();
        }
    }

    /**
     * Handle key up event
     */
    private onKeyUp(): void {
        this.dirty = true;
        this.saveSoon();
    }

    /**
     * Handle long press event (called by NoteDraggable)
     */
    private onLongPress(): void {
        this.controls.show();
    }

    /**
     * Handle paste event
     */
    private onPaste(e: ClipboardEvent): void {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertHTML', false, text);
    }
}
