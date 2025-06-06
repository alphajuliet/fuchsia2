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
    private readonly colorPicker: HTMLDivElement;
    private readonly colorDisplay: HTMLDivElement;
    private readonly deleteButton: HTMLDivElement;
    
    private mouseMoveHandler?: (e: MouseEvent) => boolean;
    private mouseUpHandler?: (e: MouseEvent) => boolean;
    private touchMoveHandler?: (e: TouchEvent) => boolean;
    private touchEndHandler?: (e: TouchEvent) => boolean;
    
    private startX: number = 0;
    private startY: number = 0;
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
        note.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        note.addEventListener('click', () => this.onNoteClick(), false);
        
        if (supportsTouch) {
            note.addEventListener('touchstart', (e) => this.onTouchStart(e), false);
            note.addEventListener('touchend', (e) => this.onTouchEnd(e), false);
            note.addEventListener('touchcancel', (e) => this.onTouchEnd(e), false);
        }
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
        ts.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        this.lastModified = ts;

        // Create the delete button
        this.deleteButton = this.createDeleteButton();
        
        // Create the color picker
        this.colorPicker = this.createColorPicker();
        this.colorDisplay = this.colorPicker.querySelector('.colorDisplay') as HTMLDivElement;
        
        // Set up event listeners for showing/hiding UI elements
        this.setupUIVisibilityEvents(note);
        
        // Add elements to the DOM
        const notesContainer = document.getElementById('notes');
        if (notesContainer) {
            notesContainer.appendChild(this.deleteButton);
            notesContainer.appendChild(this.colorPicker);
            notesContainer.appendChild(note);
        } else {
            console.error('Notes container not found');
        }
    }

    /**
     * Delete this note
     */
    public delete(event: Event): void {
        // Remove from the store
        this.cancelPendingSave();
        store.deleteNote(this);
        
        // Remove UI elements from the DOM
        this.deleteButton.remove();
        this.colorPicker.remove();
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
     * Handle mouse down event
     */
    private onMouseDown(e: MouseEvent): boolean {
        captured = this;
        this.startX = e.clientX - this.note.offsetLeft;
        this.startY = e.clientY - this.note.offsetTop;
        this.zIndex = (++Note.highestZ).toString();

        // Memoize event handlers
        if (!this.mouseMoveHandler) {
            this.mouseMoveHandler = this.onMouseMove.bind(this);
            this.mouseUpHandler = this.onMouseUp.bind(this);
        }

        document.addEventListener('mousemove', this.mouseMoveHandler!, true);
        document.addEventListener('mouseup', this.mouseUpHandler!, true);
        return false;
    }

    /**
     * Handle mouse move event
     */
    private onMouseMove(e: MouseEvent): boolean {
        if (this !== captured) {
            return true;
        }

        this.left = `${e.clientX - this.startX}px`;
        this.top = `${e.clientY - this.startY}px`;
        
        this.updateUIElementPositions();
        
        return false;
    }

    /**
     * Handle mouse up event
     */
    private onMouseUp(e: MouseEvent): boolean {
        if (this.mouseMoveHandler) {
            document.removeEventListener('mousemove', this.mouseMoveHandler, true);
        }
        
        if (this.mouseUpHandler) {
            document.removeEventListener('mouseup', this.mouseUpHandler, true);
        }
        
        this.save();
        return false;
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
     * Handle touch start event
     */
    private onTouchStart(e: TouchEvent): boolean {
        e.preventDefault();
        if (e.targetTouches.length !== 1) {
            return false;
        }

        captured = this;
        this.startX = e.targetTouches[0].clientX - this.note.offsetLeft;
        this.startY = e.targetTouches[0].clientY - this.note.offsetTop;
        this.zIndex = (++Note.highestZ).toString();

        if (!this.touchMoveHandler || !this.touchEndHandler) {
            this.touchMoveHandler = this.onTouchMove.bind(this);
            this.touchEndHandler = this.onTouchEnd.bind(this);
        }
        
        document.addEventListener('touchmove', this.touchMoveHandler, true);
        document.addEventListener('touchend', this.touchEndHandler, true);
        document.addEventListener('touchcancel', this.touchEndHandler, true);
        
        return false;
    }   

    /**
     * Handle touch move event
     */
    private onTouchMove(e: TouchEvent): boolean {
        if (this !== captured) {
            return true;
        }
        
        this.left = `${e.targetTouches[0].clientX - this.startX}px`;
        this.top = `${e.targetTouches[0].clientY - this.startY}px`;
        
        this.updateUIElementPositions();
        
        return false; 
    }

    /**
     * Handle touch end event
     */
    private onTouchEnd(e: TouchEvent): boolean {
        if (this.touchMoveHandler) {
            document.removeEventListener('touchmove', this.touchMoveHandler, true);
        }
        
        if (this.touchEndHandler) {
            document.removeEventListener('touchend', this.touchEndHandler, true);
            document.removeEventListener('touchcancel', this.touchEndHandler, true);
        }
        
        this.save();
        return false;
    }

    /**
     * Handle paste event
     */
    private onPaste(e: ClipboardEvent): void {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertHTML', false, text);
    }
    
    /**
     * Create the delete button
     */
    private createDeleteButton(): HTMLDivElement {
        const deleteButton = document.createElement('div');
        deleteButton.className = 'deleteButton';
        deleteButton.title = "Delete this note";
        deleteButton.setAttribute('data-note-id', this.id.toString());
        deleteButton.addEventListener('click', (event) => this.delete(event), false);
        deleteButton.style.display = 'none'; // Initially hidden
        
        // Position the delete button
        deleteButton.style.left = `${parseInt(this.left || '0') - 15}px`;
        deleteButton.style.top = `${parseInt(this.top || '0') - 15}px`;
        
        return deleteButton;
    }
    
    /**
     * Create the color picker
     */
    private createColorPicker(): HTMLDivElement {
        // Create the color picker container
        const colorPicker = document.createElement('div');
        colorPicker.className = 'colorPicker';
        colorPicker.title = "Choose note color";
        colorPicker.style.display = 'none'; // Initially hidden
        
        // Position the color picker
        colorPicker.style.left = `${parseInt(this.left || '0') - 10}px`;
        colorPicker.style.top = `${parseInt(this.top || '0') + 125 - 10}px`;
        
        // Create the color display
        const colorDisplay = document.createElement('div');
        colorDisplay.className = 'colorDisplay';
        colorDisplay.style.backgroundColor = this.colour;
        colorPicker.appendChild(colorDisplay);

        // Create the color options container
        const colorOptions = document.createElement('div');
        colorOptions.className = 'colorOptions';

        // Add color options
        colours.forEach((colour: Color) => {
            const option = document.createElement('div');
            option.className = 'colorOption';
            option.style.backgroundColor = colour;
            option.addEventListener('click', () => this.changeColour(colour));
            colorOptions.appendChild(option);
        });

        colorPicker.appendChild(colorOptions);
        
        return colorPicker;
    }
    
    /**
     * Set up events for showing/hiding UI elements
     */
    private setupUIVisibilityEvents(note: HTMLDivElement): void {
        // Show UI elements on mouseover
        note.addEventListener('mouseover', () => {
            this.deleteButton.style.display = 'block';
            this.colorPicker.style.display = 'block';
            this.updateUIElementPositions();
        });
        
        // Hide UI elements on mouseout
        note.addEventListener('mouseout', (e) => {
            // Check if the mouse is still over the note or its UI elements
            const relatedTarget = e.relatedTarget as Node;
            if (!note.contains(relatedTarget) && 
                relatedTarget !== this.deleteButton && 
                relatedTarget !== this.colorPicker && 
                !this.colorPicker.contains(relatedTarget)) {
                this.deleteButton.style.display = 'none';
                this.colorPicker.style.display = 'none';
            }
        });
    }
    
    /**
     * Update positions of UI elements
     */
    private updateUIElementPositions(): void {
        // Update delete button position
        if (this.deleteButton && this.deleteButton.style.display !== 'none') {
            this.deleteButton.style.left = `${parseInt(this.left) - 15}px`;
            this.deleteButton.style.top = `${parseInt(this.top) - 15}px`;
        }
        
        // Update color picker position
        if (this.colorPicker && this.colorPicker.style.display !== 'none') {
            this.colorPicker.style.left = `${parseInt(this.left) - 10}px`;
            this.colorPicker.style.top = `${parseInt(this.top) + parseInt(this.note.style.height || '125') - 10}px`;
        }
    }
}
