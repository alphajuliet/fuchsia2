// -----------------------------------------
// fuchsia.ts
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------

/**
 * Application information class
 */
class Info {
    private static readonly _appName = "fuchsia";
    private static readonly _author = "AndrewJ"; 
    private static readonly _version = "2.3.4";
    private static readonly _date = "2025-06-07";
	
    public static get appName(): string { return Info._appName; }
    public static get author(): string { return Info._author; }
    public static get version(): string { return Info._version; }
    public static get date(): string { return Info._date; }
	
    public static appendTo(tagName: string): void {
        const src = document.getElementById(tagName);
        if (!src) {
            console.error(`Element with id ${tagName} not found`);
            return;
        }
        
        const title = document.createElement('span');
        title.className = 'title';
        title.appendChild(document.createTextNode(Info.appName));
        
        const str = document.createElement('p');
        str.appendChild(title);
        str.appendChild(document.createTextNode(Info.version));
        
        src.appendChild(str);
    }
}

// Application constants
const supportsTouch: boolean = 'createTouch' in document;
const DEBUG: boolean = false; // Set to true to enable debug logging

// -----------------------------------------
// Storage options
let notes: Note[] = [];
const store: IStorage = new Html5Storage();

// -----------------------------------------
// Global state
let captured: Note | null = null;
let highestZ: number = 0;
let highestId: number = 0; // Global id counter

// Color palette
const colours: Color[] = [
    '#eeeeee', '#cccccc', // greys
    '#ff9999', '#ffccff', '#ddaaaa', '#cc9966', '#ff99cc', '#cc9900', // reds/browns
    '#ff9966', '#ffff00', '#ff9900', '#ffcc00', '#ffcc99', // oranges/yellows
    '#ccffcc', '#99cccc', '#99cc00', '#99ffcc', '#66ff33', // greens
    '#66ccff', '#bbddff', '#cc99ff', '#ccccff', '#99ffff', '#cc99cc', '#99ccff', '#ff99ff', '#ff9999'  // blues/purples/pinks
];

// -----------------------------------------
/**
 * Initialize the application after loading
 */
function loaded(): void {
    store.initialise();
}
 
// -----------------------------------------
/**
 * Format a date as a modified string
 */
function modifiedString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `Last Modified: ${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get a random color from the palette
 */
function randomColour(): Color {
    return colours[Math.floor(Math.random() * colours.length)];
}

// -----------------------------------------
/**
 * Create a new note
 */
function newNote(): void {
    const note = new Note();
    note.id = ++highestId;
    note.timestamp = new Date().getTime();
    note.left = `${Math.round(Math.random() * 400)}px`;
    note.top = `${Math.round(Math.random() * 500)}px`;
    note.zIndex = (++Note.highestZ).toString();
    note.colour = randomColour();
    note.saveAsNew();
    notes.push(note);
    
    const editField = note.noteDiv.querySelector<HTMLInputElement>('.edit');
    if (editField) {
        editField.focus();
    }
}

/**
 * Randomize colors of all notes
 */
function randomiseColours(): void {
    notes.forEach(note => {
        note.colour = randomColour();
        note.save();
    });
}

/**
 * Export notes as text
 */
function exportNotesText(): void {
    const dialog = document.getElementById('output') as HTMLDialogElement;
    const dialogText = document.getElementById('dialogText') as HTMLDivElement;
    
    if (!dialog || !dialogText) {
        console.error('Export dialog elements not found');
        return;
    }
    
    const exportText = notes
        .map(note => note.text.trim())
        .join("<br/>")
        .replace(/<br><br\/>/g, "<br/>");
    
    dialogText.innerHTML = exportText;
    dialog.showModal();
    
    const range = new Range();
    range.selectNode(dialogText);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

/**
 * Import notes from text
 */
function importNotesText(): void {
    const dialog = document.createElement('dialog');
    dialog.id = 'import-dialog';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Import Notes';
    dialog.appendChild(heading);
    
    const textarea = document.createElement('textarea');
    textarea.rows = 10;
    textarea.cols = 50;
    textarea.placeholder = 'Enter text here. Each line will become a new note.';
    dialog.appendChild(textarea);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    
    const importButton = document.createElement('button');
    importButton.textContent = 'Import';
    importButton.addEventListener('click', () => {
        const text = textarea.value;
        const lines = text.split('\n');
        
        lines.forEach(line => {
            if (line.trim()) {
                createNoteFromText(line.trim());
            }
        });
        
        closeDialog(dialog);
    });
    buttonContainer.appendChild(importButton);
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginLeft = '10px';
    cancelButton.addEventListener('click', () => closeDialog(dialog));
    buttonContainer.appendChild(cancelButton);
    
    dialog.appendChild(buttonContainer);
    document.body.appendChild(dialog);
    dialog.showModal();
}

/**
 * Create a note from text
 */
function createNoteFromText(text: string): Note {
    const note = new Note();
    note.id = ++highestId;
    note.timestamp = new Date().getTime();
    note.left = `${Math.round(Math.random() * 400)}px`;
    note.top = `${Math.round(Math.random() * 500)}px`;
    note.zIndex = (++Note.highestZ).toString();
    note.colour = randomColour();
    note.text = text;
    note.saveAsNew();
    notes.push(note);
    return note;
}

/**
 * Close and remove a dialog
 */
function closeDialog(dialog: HTMLDialogElement): void {
    dialog.close();
    document.body.removeChild(dialog);
}
 
/**
 * Confirm deletion of all notes
 */
function confirmDeleteAllNotes(): void {
    const dialog = document.createElement('dialog');
    dialog.id = 'confirm-delete-dialog';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Confirm Delete All Notes';
    dialog.appendChild(heading);
    
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to delete all notes? This action cannot be undone.';
    dialog.appendChild(message);
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '10px';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete All';
    deleteButton.style.backgroundColor = '#ff6666';
    deleteButton.addEventListener('click', () => {
        closeDialog(dialog);
        deleteAllNotes();
    });
    buttonContainer.appendChild(deleteButton);
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginLeft = '10px';
    cancelButton.addEventListener('click', () => closeDialog(dialog));
    buttonContainer.appendChild(cancelButton);
    
    dialog.appendChild(buttonContainer);
    document.body.appendChild(dialog);
    dialog.showModal();
}

/**
 * Delete all notes
 */
function deleteAllNotes(): void {
    store.deleteAllNotes();
    notes = [];
    
    // Clear the notes container
    const notesContainer = document.getElementById('notes');
    if (notesContainer) {
        notesContainer.innerHTML = '';
    }
}

/**
 * Add a button to a target element
 */
function addButtonTo(target: HTMLElement, text: string, onclick: () => void): void {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onclick);
    target.appendChild(button);
}

/**
 * Create a div option for dropdown
 */
function divOption(text: string, onclick: () => void): HTMLElement {
    const div = document.createElement('div');
    div.textContent = text;
    div.addEventListener('click', onclick);
    return div;
}

/**
 * Add layout dropdown to target element
 */
function addLayoutDropdownTo(target: HTMLElement): void {
    const dropdown = document.createElement('button');
    dropdown.className = 'dropdown';
    dropdown.textContent = 'Layout ∨';
    
    const options = document.createElement('div');
    options.className = 'options';
    options.appendChild(divOption('Random', () => Layout.randomLayout(notes)));
    options.appendChild(divOption('Stack', () => Layout.stackLayout(notes)));
    options.appendChild(divOption('Grid', () => Layout.gridLayout(notes)));
    
    dropdown.appendChild(options);
    target.appendChild(dropdown);
    
    dropdown.addEventListener('click', () => {
        dropdown.classList.toggle('active');
    });
}

/**
 * Add all buttons to the UI
 */
function addButtons(): void {
    const buttons = document.getElementById('buttons');
    if (!buttons) {
        console.error('Buttons container not found');
        return;
    }

    const newNoteButton = document.createElement('button');
    newNoteButton.addEventListener('click', newNote);
    newNoteButton.accessKey = 'n';
    newNoteButton.textContent = 'New Note';
    newNoteButton.disabled = !store.isAvailable;
    buttons.appendChild(newNoteButton);

    addButtonTo(buttons, 'Delete all', confirmDeleteAllNotes);
    addLayoutDropdownTo(buttons);
    addButtonTo(buttons, 'Random colours', randomiseColours);
    addButtonTo(buttons, 'Export text', exportNotesText);
    addButtonTo(buttons, 'Import text', importNotesText);
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts(): void {
    let awaitingCommand = false;
    
    document.addEventListener('keydown', (event: KeyboardEvent) => {
        // First check for backslash to enter command mode
        if (event.key === '\\' && !awaitingCommand) {
            event.preventDefault();
            awaitingCommand = true;
            return;
        }
        
        // If we're awaiting a command after backslash
        if (awaitingCommand) {
            event.preventDefault();
            awaitingCommand = false;
            
            switch (event.key.toLowerCase()) {
                case 'n':
                    if (store.isAvailable) {
                        newNote();
                    }
                    break;
                case 'e':
                    exportNotesText();
                    break;
                case 'i':
                    importNotesText();
                    break;
                case 'r':
                    randomiseColours();
                    break;
                case '3':
                    Layout.gridLayout(notes);
                    break;
                case '2':
                    Layout.stackLayout(notes);
                    break;
                case '1':
                    Layout.randomLayout(notes);
                    break;
                case 'd':
                    confirmDeleteAllNotes();
                    break;
            }
        }
    });
}

// -----------------------------------------
// Initialize the application
if (store.isAvailable) {
    addEventListener('load', loaded, false);
}

function initialise(): void {
    Info.appendTo("heading");
    addButtons();
    setupKeyboardShortcuts();
}

// -----------------------------------------
window.onload = initialise;
