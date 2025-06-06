// types.ts - Type definitions for the application

/**
 * Interface for a note object
 */
interface INote {
    readonly id: number;
    text: string;
    colour: Color;
    timestamp: number;
    left: string;
    top: string;
    zIndex: string;
    readonly noteDiv: HTMLDivElement;
    
    delete(event: Event): void;
    changeColour(color: Color): void;
    saveSoon(): void;
    save(): void;
    saveAsNew(): void;
}

/**
 * Interface for storage operations
 */
interface IStorage {
    readonly isAvailable: boolean;
    initialise(): void;
    createNote(note: Note): void;
    updateNote(note: Note): void;
    deleteNote(note: Note): void;
    deleteAllNotes(): void;
    forEach(fn1: (key: string, val: string) => void, fn2: () => void): void;
}

/**
 * Type for a color value
 */
type Color = string;

/**
 * Type for a layout function
 */
type LayoutFunction = (notes: Note[]) => void;