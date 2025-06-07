// note-controls.ts

/**
 * UI controls for notes (delete button and color picker)
 * Extracted from note.ts for better separation of concerns
 */
class NoteControls {
    private deleteButton: HTMLDivElement;
    private colorPicker: HTMLDivElement;
    private colorDisplay: HTMLDivElement;
    private note: Note;

    constructor(note: Note) {
        this.note = note;
        this.deleteButton = this.createDeleteButton();
        this.colorPicker = this.createColorPicker();
        this.colorDisplay = this.colorPicker.querySelector('.colorDisplay') as HTMLDivElement;
        
        this.addToDOM();
        this.setupUIVisibilityEvents();
    }

    /**
     * Show the UI controls
     */
    public show(): void {
        this.deleteButton.style.display = 'block';
        this.colorPicker.style.display = 'block';
        this.updatePositions();
    }

    /**
     * Hide the UI controls
     */
    public hide(): void {
        this.deleteButton.style.display = 'none';
        this.colorPicker.style.display = 'none';
    }

    /**
     * Update positions of UI controls relative to the note
     */
    public updatePositions(): void {
        // Update delete button position
        if (this.deleteButton && this.deleteButton.style.display !== 'none') {
            this.deleteButton.style.left = `${parseInt(this.note.left) - 15}px`;
            this.deleteButton.style.top = `${parseInt(this.note.top) - 15}px`;
        }
        
        // Update color picker position
        if (this.colorPicker && this.colorPicker.style.display !== 'none') {
            this.colorPicker.style.left = `${parseInt(this.note.left) - 10}px`;
            this.colorPicker.style.top = `${parseInt(this.note.top) + parseInt(this.note.noteDiv.style.height || '125') - 10}px`;
        }
    }

    /**
     * Clean up and remove UI controls from DOM
     */
    public destroy(): void {
        this.deleteButton.remove();
        this.colorPicker.remove();
    }

    /**
     * Create the delete button
     */
    private createDeleteButton(): HTMLDivElement {
        const deleteButton = document.createElement('div');
        deleteButton.className = 'deleteButton';
        deleteButton.title = "Delete this note";
        deleteButton.setAttribute('data-note-id', this.note.id.toString());
        deleteButton.addEventListener('click', (event) => this.note.delete(event), false);
        deleteButton.style.display = 'none'; // Initially hidden
        
        // Position the delete button
        deleteButton.style.left = `${parseInt(this.note.left || '0') - 15}px`;
        deleteButton.style.top = `${parseInt(this.note.top || '0') - 15}px`;
        
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
        colorPicker.style.left = `${parseInt(this.note.left || '0') - 10}px`;
        colorPicker.style.top = `${parseInt(this.note.top || '0') + 125 - 10}px`;
        
        // Create the color display
        const colorDisplay = document.createElement('div');
        colorDisplay.className = 'colorDisplay';
        colorDisplay.style.backgroundColor = this.note.colour;
        colorPicker.appendChild(colorDisplay);

        // Create the color options container
        const colorOptions = document.createElement('div');
        colorOptions.className = 'colorOptions';

        // Add color options
        colours.forEach((colour: Color) => {
            const option = document.createElement('div');
            option.className = 'colorOption';
            option.style.backgroundColor = colour;
            option.addEventListener('click', () => this.note.changeColour(colour));
            colorOptions.appendChild(option);
        });

        colorPicker.appendChild(colorOptions);
        
        return colorPicker;
    }

    /**
     * Add UI controls to the DOM
     */
    private addToDOM(): void {
        const notesContainer = document.getElementById('notes');
        if (notesContainer) {
            notesContainer.appendChild(this.deleteButton);
            notesContainer.appendChild(this.colorPicker);
        } else {
            console.error('Notes container not found');
        }
    }
    
    /**
     * Set up events for showing/hiding UI elements
     */
    private setupUIVisibilityEvents(): void {
        const noteDiv = this.note.noteDiv;
        
        // Show UI elements on mouseover (desktop only)
        if (!supportsTouch) {
            noteDiv.addEventListener('mouseover', () => {
                this.show();
            });
            
            // Hide UI elements on mouseout (desktop only)
            noteDiv.addEventListener('mouseout', (e) => {
                // Check if the mouse is still over the note or its UI elements
                const relatedTarget = e.relatedTarget as Node;
                if (!noteDiv.contains(relatedTarget) && 
                    relatedTarget !== this.deleteButton && 
                    relatedTarget !== this.colorPicker && 
                    !this.colorPicker.contains(relatedTarget)) {
                    this.hide();
                }
            });
        }
        
        // For touch devices, hide UI elements when touching elsewhere
        if (supportsTouch) {
            document.addEventListener('touchstart', (e) => {
                const target = e.target as Node;
                if (!noteDiv.contains(target) && 
                    target !== this.deleteButton && 
                    target !== this.colorPicker && 
                    !this.colorPicker.contains(target)) {
                    this.hide();
                }
            });
        }
    }
}