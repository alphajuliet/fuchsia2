// -----------------------------------------
// fuchsia.js
// Based on http://net.tutsplus.com/articles/news/create-a-sticky-note-effect-in-5-easy-steps-with-css3-and-html5/
// -----------------------------------------
"use strict";

// Object: info
const Info = {
	name: "fuchsia",
	author: "AndrewJ", 
	version: "2.1.1",
	date: "2024-04-22",
	appendTo: function(tagName) {
		const src = document.getElementById(tagName);
		const title = document.createElement('span');
		title.className = 'title';
		title.appendChild(document.createTextNode(this.name));
		const str = document.createElement('p');
		str.appendChild(title);
		str.appendChild(document.createTextNode(this.version));
		src.appendChild(str);
	},
}

const supportsTouch = 'createTouch' in document;
const debug = true;

// -----------------------------------------
// Storage options
let notes = [];
const store = new html5Storage();

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
    note.zIndex = ++highestZ;
    note.colour = randomColour();
    note.saveAsNew();
    note.note.getElementsByClassName('edit')[0].focus();
    notes.push(note);
}

function randomiseColours() {
    notes.forEach(note => {
        note.colour = randomColour();
        note.save();
    })
}

function exportNotesText() {
    const dialog = document.getElementById('output');
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

function addButtons() {
    const buttons = document.getElementById('buttons');

    const newNoteButton = document.createElement('button');
    newNoteButton.onclick = newNote;
    newNoteButton.accessKey = 'n';
    newNoteButton.innerHTML = 'New Note';
    newNoteButton.disabled = !store.isAvailable;
    buttons.appendChild(newNoteButton);

    addButtonTo(buttons, 'Delete all', deleteAllNotes);
    addButtonTo(buttons, 'Random layout', () => Layout.randomLayout(notes));
    addButtonTo(buttons, 'Stack layout', () => Layout.stackLayout(notes));
    addButtonTo(buttons, 'Grid layout', () => Layout.gridLayout(notes));
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
