// -----------------------------------------
// fuchsia.js
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------

// Object: info
class Info {
    public static appName = "fuchsia";
    public static author = "AndrewJ"; 
    public static version = "2.3.2";
    public static date = "2025-06-01";
	
	public static appendTo(tagName: string): void {
		const src = document.getElementById(tagName);
		const title = document.createElement('span');
		title.className = 'title';
		title.appendChild(document.createTextNode(Info.appName));
		const str = document.createElement('p');
		str.appendChild(title);
		str.appendChild(document.createTextNode(Info.version));
		src.appendChild(str);
	}
}
const info = new Info();
const supportsTouch = 'createTouch' in document;
const debug = true;

// -----------------------------------------
// Storage options
let notes = [];
const store = new Html5Storage();

// -----------------------------------------
let captured: Note | null = null;
let highestZ = 0;
let highestId = 0; // Global id counter

const colours = [
    '#eeeeee', '#cccccc', // greys
    '#ff9999', '#ffccff', '#ddaaaa', '#cc9966', '#ff99cc', '#cc9900', // reds/browns
    '#ff9966', '#ffff00', '#ff9900', '#ffcc00', '#ffcc99', // oranges/yellows
    '#ccffcc', '#99cccc', '#99cc00', '#99ffcc', '#66ff33', // greens
    '#66ccff', '#bbddff', '#cc99ff', '#ccccff', '#99ffff', '#cc99cc', '#99ccff', '#ff99ff', '#ff9999'  // blues/purples/pinks
];

// -----------------------------------------
function loaded(): void {
	store.initialise();
}
 
// -----------------------------------------
function modifiedString(date: Date): string {
    return `Last Modified: ${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}

function randomColour(): string {
    return colours[Math.floor(Math.random() * colours.length)];
}

// -----------------------------------------
function newNote(): void {
    let note = new Note();
    note.id = ++highestId;
    note.timestamp = new Date().getTime();
    note.left = Math.round(Math.random() * 400) + 'px';
    note.top = Math.round(Math.random() * 500) + 'px';
    note.zIndex = (++Note.highestZ).toString();
    note.colour = randomColour();
    note.saveAsNew();
    notes.push(note);
    note.noteDiv.querySelector<HTMLInputElement>('.edit')!.focus();
}

function randomiseColours(): void {
    notes.forEach(note => {
        note.colour = randomColour();
        note.save();
    })
}

function exportNotesText(): void {
    const dialog = document.getElementById('output') as HTMLDialogElement;
    const dialogText = document.getElementById('dialogText') as HTMLDivElement;
    const exportText = notes.map(note => `${note.text.trim()}`).join("<br/>").replace(/<br><br\/>/g, "<br/>");
    // console.log(exportText);
    dialogText.innerHTML = exportText;
    dialog.showModal();
    const range = new Range();
    range.selectNode(dialogText);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
}

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
    importButton.onclick = () => {
        const text = textarea.value;
        const lines = text.split('\n');
        
        lines.forEach(line => {
            if (line.trim()) {
                const note = new Note();
                note.id = ++highestId;
                note.timestamp = new Date().getTime();
                note.left = Math.round(Math.random() * 400) + 'px';
                note.top = Math.round(Math.random() * 500) + 'px';
                note.zIndex = (++Note.highestZ).toString();
                note.colour = randomColour();
                note.text = line.trim();
                note.saveAsNew();
                notes.push(note);
            }
        });
        
        dialog.close();
        document.body.removeChild(dialog);
    };
    buttonContainer.appendChild(importButton);
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginLeft = '10px';
    cancelButton.onclick = () => {
        dialog.close();
        document.body.removeChild(dialog);
    };
    buttonContainer.appendChild(cancelButton);
    
    dialog.appendChild(buttonContainer);
    document.body.appendChild(dialog);
    dialog.showModal();
}
 
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
    deleteButton.onclick = () => {
        dialog.close();
        document.body.removeChild(dialog);
        deleteAllNotes();
    };
    buttonContainer.appendChild(deleteButton);
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginLeft = '10px';
    cancelButton.onclick = () => {
        dialog.close();
        document.body.removeChild(dialog);
    };
    buttonContainer.appendChild(cancelButton);
    
    dialog.appendChild(buttonContainer);
    document.body.appendChild(dialog);
    dialog.showModal();
}

function deleteAllNotes(): void {
	store.deleteAllNotes();
    notes = [];
    // Clear the notes container which will remove all notes, delete buttons, and color pickers
    document.getElementById('notes').innerHTML = '';
}

function addButtonTo(target: HTMLElement, text: string, onclick: () => void): void {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.onclick = onclick;
    target.appendChild(button);
}

function divOption(text: string, onclick: () => void): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = text;
    div.onclick = onclick;
    return div;
}

function addLayoutDropdownTo(target: HTMLElement): void {
    const dropdown = document.createElement('button');
    dropdown.className = 'dropdown';
    dropdown.innerHTML = 'Layout ∨';
    const options = document.createElement('div');
    options.className = 'options';
    options.appendChild(divOption('Random', () => Layout.randomLayout(notes)));
    options.appendChild(divOption('Stack', () => Layout.stackLayout(notes)));
    options.appendChild(divOption('Grid', () => Layout.gridLayout(notes)));
    dropdown.appendChild(options);
    target.appendChild(dropdown);
    dropdown.onclick = function() {
        dropdown.classList.toggle("active")
    }
}

function addButtons(): void {
    const buttons = document.getElementById('buttons');

    const newNoteButton = document.createElement('button');
    newNoteButton.onclick = newNote;
    newNoteButton.accessKey = 'n';
    newNoteButton.innerHTML = 'New Note';
    newNoteButton.disabled = !store.isAvailable;
    buttons.appendChild(newNoteButton);

    addButtonTo(buttons, 'Delete all', confirmDeleteAllNotes);
    addLayoutDropdownTo(buttons);
    addButtonTo(buttons, 'Random colours', randomiseColours);
    addButtonTo(buttons, 'Export text', exportNotesText);
    addButtonTo(buttons, 'Import text', importNotesText);
}

// -----------------------------------------
if (store.isAvailable)
    addEventListener('load', loaded, false);

function initialise(): void {
	Info.appendTo("heading");
    addButtons();
}

// -----------------------------------------
window.onload = initialise;
