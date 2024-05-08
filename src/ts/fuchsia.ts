// -----------------------------------------
// fuchsia.js
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------

// Object: info
class Info {
    public static appName = "fuchsia";
    public static author = "AndrewJ"; 
    public static version = "2.2.0";
    public static date = "2024-05-07";
	
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
let captured = null;
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
function loaded() {
	store.initialise();
}
 
// -----------------------------------------
function modifiedString(date) {
    return 'Last Modified: ' + date.getFullYear() 
        + '-' + (date.getMonth() + 1) 
        + '-' + date.getDate() 
        + ' ' + date.getHours() 
        + ':' + date.getMinutes() 
        + ':' + date.getSeconds();
}

function randomColour() {
    return colours[Math.floor(Math.random() * colours.length)];
}

// -----------------------------------------
function newNote() {
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

function randomiseColours() {
    notes.forEach(note => {
        note.colour = randomColour();
        note.save();
    })
}

function exportNotesText() {
    const dialog = document.getElementById('output') as HTMLDialogElement;
    const dialogText = document.getElementById('dialogText');
    const exportText = notes.map(note => `${note.text.trim()}`).join("<br/>").replace(/<br><br\/>/g, "<br/>");
    // console.log(exportText);
    dialogText.innerHTML = exportText;
    dialog.showModal();
    let range = new Range();
    range.selectNode(dialogText);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
 
function deleteAllNotes() {
	store.deleteAllNotes();
    notes = [];
    document.getElementById('notes').innerHTML = '';
}

function addButtonTo(target, text, onclick) {
    const button = document.createElement('button');
    button.innerHTML = text;
    button.onclick = onclick;
    target.appendChild(button);
}

function divOption ( text, onclick ) {
    const div = document.createElement('div');
    div.innerHTML = text;
    div.onclick = onclick;
    return div;
}

function addLayoutDropdownTo(target) {
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

function addButtons() {
    const buttons = document.getElementById('buttons');

    const newNoteButton = document.createElement('button');
    newNoteButton.onclick = newNote;
    newNoteButton.accessKey = 'n';
    newNoteButton.innerHTML = 'New Note';
    newNoteButton.disabled = !store.isAvailable;
    buttons.appendChild(newNoteButton);

    addButtonTo(buttons, 'Delete all', deleteAllNotes);
    addLayoutDropdownTo(buttons);
    addButtonTo(buttons, 'Random colours', randomiseColours);
    addButtonTo(buttons, 'Export text', exportNotesText);
}

// -----------------------------------------
if (store.isAvailable)
    addEventListener('load', loaded, false);

function initialise() {
	Info.appendTo("heading");
    addButtons();
}

// -----------------------------------------
window.onload = initialise;
