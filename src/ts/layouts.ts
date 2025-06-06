// layouts.ts

class Layout {
    private static readonly noteWidth: number = 160;
    private static readonly noteHeight: number = 135;

    private static randomInRange(a: number, b: number): number {
        return Math.random() * (b - a) + a;
    }

    public static randomLayout(notes: Note[]): void {
        const margin: number = 100;
        const width: number = window.innerWidth;
        const height: number = window.innerHeight;
        notes.forEach(note => {
            note.left = this.randomInRange(margin, width - 2 * margin) + 'px';
            note.top = this.randomInRange(margin, height - 2 * margin) + 'px';
            store.updateNote(note); 
        });
    }

    public static gridLayout(notes: Note[]): void {
        const topMargin: number = 150;
        const innerMargin: number = 25;
        const width: number = window.innerWidth;
        const cols: number = Math.floor((width - (innerMargin * 2)) / (Layout.noteWidth + innerMargin));
        let row: number = 0;
        let col: number = 0;
        
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
        const randomOffset: number = 20;
        notes.forEach(note => {
            note.left = 150 + this.randomInRange(-randomOffset, randomOffset) + 'px';
            note.top = 200 + this.randomInRange(-randomOffset, randomOffset) + 'px';
            store.updateNote(note);
        });
    }
}
