# Fuchsia 2

A TypeScript-based sticky notes web application that stores notes in browser local storage.

## Features

- Create, edit, and delete sticky notes
- Drag and drop notes anywhere on the screen
- Color picker with a palette of colors
- Multiple layout options: Random, Stack, and Grid
- Import/export notes as text
- Keyboard shortcuts
- Touch device support
- Persistent storage using browser localStorage

## Running the App

### Prerequisites

- Node.js and npm installed
- A modern web browser

### Build and Run

```bash
# Install dependencies (first time only)
npm install

# Build the application
npm run build

# Open src/index.html in your browser
open src/index.html
```

For development with auto-rebuild on file changes:

```bash
npm run dev
```

Then open `src/index.html` in your browser and refresh after making changes.

## Keyboard Shortcuts

Press `\` (backslash) followed by a key:

| Key | Action |
|-----|--------|
| `n` | New note |
| `e` | Export notes as text |
| `i` | Import notes from text |
| `r` | Randomize note colors |
| `1` | Random layout |
| `2` | Stack layout |
| `3` | Grid layout |
| `d` | Delete all notes |

## Architecture

The app is built with TypeScript and uses a modular architecture:

- **types.ts** - TypeScript interfaces and type definitions
- **html5Storage.ts** - LocalStorage abstraction
- **note.ts** - Note class with editing and persistence
- **note-draggable.ts** - Drag and drop functionality
- **note-controls.ts** - UI controls (delete button, color picker)
- **layouts.ts** - Layout algorithms (grid, stack, random)
- **fuchsia.ts** - Main application controller

## License

No license. Use it however you want.
