// layouts.js

class Layout {

    static noteWidth = 160;
    static noteHeight = 135;

    static randomInRange(a, b) {
        return Math.random() * (b - a) + a;
    }

    static randomLayout(notes) {
        const margin = 100;
        const width = window.innerWidth;
        const height = window.innerHeight;
        notes.forEach(note => {
            note.left = this.randomInRange(margin, width - 2 * margin) + 'px';
            note.top = this.randomInRange(margin, height - 2 * margin) + 'px';
            store.updateNote(note); 
        });
    }

    static gridLayout(notes) {
        const outerMargin = 120;
        const innerMargin = 25;
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
    }

    static stackLayout(notes) {
       const randomOffset = 20;
       notes.forEach(note => {
           note.left = 150 + this.randomInRange(-randomOffset, randomOffset) + 'px';
           note.top = 200 + this.randomInRange(-randomOffset, randomOffset) + 'px';
           store.updateNote(note);
       }) 
    }
};
