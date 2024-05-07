// note.ts

class Note {
    private _id: number;
    private _timestamp: number;
    private _saveTimer: number;

    private static highestId = 0;
    public static highestZ = 0;

    private note: HTMLDivElement;
    private editField: HTMLDivElement;
    private lastModified: HTMLDivElement;
    private mouseMoveHandler: (e: MouseEvent) => boolean;
    private mouseUpHandler: (e: MouseEvent) => boolean;
    private touchMoveHandler: (e: TouchEvent) => boolean;
    private touchEndHandler: (e: TouchEvent) => boolean;
    private startX: number;
    private startY: number;

    get noteDiv(): HTMLDivElement { return this.note; }

    get id(): number {
        if (!this._id)
            this._id = ++Note.highestId;
        return this._id;
    }
    set id(x: number) { this._id = x; }
    get text(): string { return this.editField.innerHTML; }
    set text(x: string) { this.editField.innerHTML = x; }

    get timestamp(): number {
        if (!this._timestamp)
            this._timestamp = 0;
        return this._timestamp;
    }
    set timestamp(x: number) {
        if (this._timestamp == x)
            return;
        this._timestamp = x;
        let date = new Date();
        // date.setTime(parseFloat(x));
        date.setTime(x);
        this.lastModified.textContent = modifiedString(date);
    }

    get colour(): string { return this.note.style.backgroundColor; }
    set colour(c: string) { this.note.style.backgroundColor = c; }
    get left(): string { return this.note.style.left; }
    set left(x: string) { this.note.style.left = x; }
    get top(): string { return this.note.style.top; }
    set top(x: string) { this.note.style.top = x; }
    get zIndex(): string { return this.note.style.zIndex; }
    set zIndex(x: string) { this.note.style.zIndex = x; }

    private dirty: boolean;

    constructor() {
        const note = document.createElement('div');
        note.className = 'note';
        note.setAttribute('id', `note_${this.id}`);
        note.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        note.addEventListener('click', () => this.onNoteClick(), false);
        // supportsTouch && note.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
        // supportsTouch && note.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
        // supportsTouch && note.addEventListener('touchcancel', (e) => this.onTouchEnd(e), false);
        this.note = note;

        const edit = document.createElement('div');
        edit.className = 'edit';
        edit.setAttribute('contentEditable', 'true');
        edit.addEventListener('keyup', () => this.onKeyUp(), false);
        edit.addEventListener('paste', (e) => this.onPaste(e), false);
        // Remove deprecated call
        // edit.addEventListener("paste", function(e) { 
        //     e.preventDefault(); 
        //     const text = e.clipboardData.getData("text/plain"); 
        //     document.execCommand("insertHTML", false, text); 
        // }, false);
        note.appendChild(edit);
        this.editField = edit;

        const ts = document.createElement('div');
        ts.className = 'timestamp';
        ts.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        // note.appendChild(ts);
        this.lastModified = ts;

        const deleteButton = document.createElement('div');
        deleteButton.className = 'deleteButton';
        deleteButton.title = "Delete this note"
        deleteButton.addEventListener('click', (event) => this.delete(event), false);
        note.appendChild(deleteButton);

        const colourButton = document.createElement('button');
        colourButton.className = 'colourButton';
        colourButton.title = "Randomise the note colour";
        colourButton.addEventListener('click', (event) => this.changeColour(event), false);
        note.appendChild(colourButton);

        document.getElementById('notes').appendChild(note);
    }

    public delete(event: Event): void {
        // Remove from the store
        this.cancelPendingSave();
        store.deleteNote(this);
        // Remove the note from the DOM
        this.note.remove();
        // Remove from the notes array
        notes = notes.filter(note => note != this);
    }

    public changeColour(event: Event): void {
        this.colour = randomColour();
    }

    public saveSoon(): void {
        this.cancelPendingSave();
        const self = this;
        this._saveTimer = setTimeout(() => this.save(), 2000);
    }

    public cancelPendingSave(): void {
        if (!this._saveTimer)
            return;
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    }

    public save(): void {
        this.cancelPendingSave();

        if ("dirty" in this) {
            this.timestamp = new Date().getTime();
            delete this.dirty;
        }

        let note = this;
        store.updateNote(note);
    }

    public saveAsNew(): void {
        this.timestamp = new Date().getTime();
        const note = this;
        store.createNote(note);
    }

    public onMouseDown(e: MouseEvent): boolean {
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = (++Note.highestZ).toString();

        // Memoize these event listeners to avoid creating a new function on each mouse down event.
        if (!this.mouseMoveHandler) {
            this.mouseMoveHandler = this.onMouseMove.bind(this);
            this.mouseUpHandler = this.onMouseUp.bind(this);
        }

        document.addEventListener('mousemove', this.mouseMoveHandler, true);
        document.addEventListener('mouseup', this.mouseUpHandler, true);
        return false;
    }

    public onMouseMove(e: MouseEvent): boolean {
        if (this != captured)
            return true;

        this.left = (e.clientX - this.startX) + 'px';
        this.top = (e.clientY - this.startY) + 'px';
        return false;
    }

    public onMouseUp(e: MouseEvent): boolean {
        document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        document.removeEventListener('mouseup', this.mouseUpHandler, true);
        this.save();
        return false;
    }

    public onNoteClick(e?: Event): void {
        this.editField.focus();
        const sel = getSelection();
        if (sel.anchorNode) 
            sel.collapseToEnd();
    }

    public onKeyUp(): void {
        this.dirty = true;
        this.saveSoon();
    }

    // -----------------------------------------
    // iPad touch events. Similar to mouse events above.
    // See http://developer.apple.com/library/safari/#documentation/InternetWeb/Conceptual/SafariVisualEffectsProgGuide/InteractiveVisualEffects/InteractiveVisualEffects.html
    // @@TODO Refactor these events into the mouse events above to remove duplication.
    public onTouchStart(e: TouchEvent): boolean {
    	e.preventDefault();
    	if (e.targetTouches.length != 1)
    		return false;

        const captured = this;
        this.startX = e.targetTouches[0].clientX - this.note.offsetLeft;
        this.startY = e.targetTouches[0].clientY - this.note.offsetTop;
        this.zIndex = (++Note.highestZ).toString();

        const self = this;
        if (!this.touchMoveHandler) {
            this.touchMoveHandler = (e: TouchEvent) => this.onTouchMove(e);
            this.touchEndHandler = (e: TouchEvent) => this.onTouchEnd(e);
        }
    }   

    public onTouchMove(e: TouchEvent): boolean {
        if (this != captured)
            return true;
        this.left = e.targetTouches[0].clientX - this.startX + 'px';
        this.top = e.targetTouches[0].clientY - this.startY + 'px';
        return false; 
    }

    public onTouchEnd(e: TouchEvent): boolean {
        document.removeEventListener('touchmove', this.touchMoveHandler, true);
        document.removeEventListener('touchend', this.touchEndHandler, true);
        document.removeEventListener('touchcancel', this.touchEndHandler, true);
        return false;
    }

    public onPaste(e: ClipboardEvent): void {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertHTML', false, text);
    }
}