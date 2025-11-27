# ASCII Configurator Walkthrough

I have built a premium, browser-based ASCII art configurator.

## Features

### 1. Image Upload
- **Drag & Drop**: Simply drag an image anywhere onto the canvas area.
- **File Picker**: Use the "Choose File" button in the sidebar.

### 2. Real-time Controls
- **Aspect Ratio**: Choose from standard ratios (1:1, 4:3, 16:9, etc.) or use the image's original ratio.
- **Transforms**:
    - **Scale**: Zoom in or out.
    - **Rotation**: Rotate the image.
    - **Pan X/Y**: Move the image within the frame.
- **Resolution**: Adjusts the density of the ASCII characters.
- **Contrast**: Increases or decreases the dynamic range.
- **Brightness**: Adjusts the overall lightness.
- **Color Mode**: Toggle between classic White-on-Black or Full Color ASCII.
    - **Custom Tint**: When Color Mode is active, enable this to set custom Highlight and Shadow colors for a duotone effect.
- **Invert**: Inverts the mapping (Bright areas become dark, Dark areas become bright).

### 4. Viewport Controls
- **Pan**: Click and drag on the canvas to move it around.
- **Zoom**: Use your mouse wheel or trackpad scroll to zoom in and out.
- **Adaptive Fit**: The canvas automatically fits to the screen when you upload an image or change the aspect ratio.

### 5. History
- **Undo**: `Cmd/Ctrl + Z`
- **Redo**: `Cmd/Ctrl + Shift + Z`

### 6. Export
- **PNG & JPEG**: Download high-resolution renders of your ASCII art.

## Technical Implementation
- **Core**: Vanilla JavaScript (ES6 Modules) with Vite.
- **Rendering**: HTML5 Canvas API for high-performance image processing.
- **Styling**: CSS Variables, Glassmorphism, and Responsive Design.
- **Architecture**: Modular codebase with separation of concerns:
    - `state.js`: State management and History (Undo/Redo).
    - `renderer.js`: Pure rendering logic.
    - `viewport.js`: Pan/Zoom and Adaptive Fit logic.
    - `ui.js`: DOM manipulation and UI updates.
    - `utils.js`: Helper functions.
    - `main.js`: Application entry point and event binding. (contrast/brightness) before processing.
- **Responsive Design**: The layout adapts to the screen size, with a glassmorphism sidebar.

## How to Run
1. Open the project directory.
2. Run `npm run dev` (if using Vite) or simply open `index.html` in a browser (though some file access features might require a local server).
