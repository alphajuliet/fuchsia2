// layouts.ts

class Layout {
    private static readonly noteWidth = 160;
    private static readonly noteHeight = 135;

    private static randomInRange(a: number, b: number): number {
        return Math.random() * (b - a) + a;
    }

    public static randomLayout(notes: Note[]): void {
        const margin = 100;
        const width = window.innerWidth;
        const height = window.innerHeight;
        notes.forEach(note => {
            note.left = this.randomInRange(margin, width - 2 * margin) + 'px';
            note.top = this.randomInRange(margin, height - 2 * margin) + 'px';
            store.updateNote(note); 
        });
    }

    public static gridLayout(notes: Note[]): void {
        const topMargin = 150;
        const innerMargin = 25;
        const width = window.innerWidth;
        const cols = Math.floor((width - (innerMargin * 2)) / (Layout.noteWidth + innerMargin));
        let row = 0;
        let col = 0;
        
        notes.forEach(note => {
            note.left = (col * (Layout.noteWidth + innerMargin)) + innerMargin + 'px';
            note.top = topMargin + (row * (Layout.noteHeight + innerMargin)) + innerMargin + 'px';
            store.updateNote(note);
            col++;
            if (col === cols) {
                col = 0;
                row++;
            }
        });
    }

    public static stackLayout(notes: Note[]): void {
        const randomOffset = 20;
        notes.forEach(note => {
            note.left = 150 + this.randomInRange(-randomOffset, randomOffset) + 'px';
            note.top = 200 + this.randomInRange(-randomOffset, randomOffset) + 'px';
            store.updateNote(note);
        });
    }
}
