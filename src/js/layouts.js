// layouts.js

const Layout = {

    noteWidth: 160,
    noteHeight: 135,

    randomInRange: (a, b) => Math.random() * (b - a) + a,

    randomLayout: (notes) => {
        const margin = 100;
        const width = window.innerWidth;
        const height = window.innerHeight;
        notes.forEach(note => {
            note.left = Layout.randomInRange(margin, width - 2 * margin) + 'px';
            note.top = Layout.randomInRange(margin, height - 2 * margin) + 'px';
            store.updateNote(note); 
        });
    },

    gridLayout: (notes) => {
        outerMargin = 100;
        innerMargin = 20;
        const width = window.innerWidth;
        const cols = Math.floor((width - (innerMargin * 2)) / (Layout.noteWidth + innerMargin));
        let row = 0;
        let col = 0;
        notes.forEach(note => {
            note.left = (col * (Layout.noteWidth + innerMargin)) + innerMargin + 'px';
            note.top = outerMargin + (row * (Layout.noteHeight + innerMargin)) + innerMargin + 'px';
            store.updateNote(note);
            col++;
            if (col == cols) {
                col = 0;
                row++;
            }
        })
    },

    stackLayout: (notes) => {
       randomOffset = 20;
       notes.forEach(note => {
           note.left = 150 + Layout.randomInRange(-randomOffset, randomOffset) + 'px';
           note.top = 200 + Layout.randomInRange(-randomOffset, randomOffset) + 'px';
           store.updateNote(note);
       }) 
    }
};
