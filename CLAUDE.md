# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
# Compile TypeScript to JavaScript
tsc

# Clean built files
rm -rf built/

# Build from source directory
cd src && tsc
```

The TypeScript compiler outputs JavaScript files to the `built/` directory. The HTML file references the compiled JavaScript files from this location.

## Architecture Overview

Fuchsia 2 is a TypeScript-based sticky notes web application with the following modular architecture:

### Core Module Structure
- **index.ts**: Main entry point that imports all modules in correct order
- **types.ts**: TypeScript interfaces and type definitions for the entire application
- **fuchsia.ts**: Application controller containing initialization, UI management, and global state
- **note.ts**: Note class implementing drag-and-drop, editing, and persistence
- **html5Storage.ts**: Local storage abstraction implementing the IStorage interface
- **layouts.ts**: Layout algorithms for arranging notes (grid, stack, random)

### Key Architectural Patterns

**Module Dependencies**: The application uses a specific import order in index.ts to ensure proper initialization:
1. Types (interfaces)
2. Storage layer
3. Note implementation
4. Layout utilities
5. Main application controller

**Global State Management**: The application maintains global state in fuchsia.ts:
- `notes: Note[]` - array of all note instances
- `store: IStorage` - storage interface implementation
- `captured: Note | null` - currently dragged note
- `highestZ`, `highestId` - z-index and ID counters

**Event-Driven UI**: Notes use DOM event listeners for:
- Mouse/touch drag and drop with proper event cleanup
- Keyboard input with auto-save timers
- Hover states for showing/hiding UI controls (delete button, color picker)

**Storage Architecture**: Uses interface-based storage with Html5Storage implementation that:
- Persists notes as comma-separated values in localStorage
- Handles encoding/decoding of note properties
- Maintains referential integrity with global state

### File Structure
- `src/ts/` - TypeScript source files
- `built/` - Compiled JavaScript output (referenced by HTML)
- `src/css/` - Stylesheets
- `src/images/` - UI assets
- `src/index.html` - Main HTML file that loads compiled JS

The application is designed as a single-page web app with no external dependencies beyond the browser's standard APIs.