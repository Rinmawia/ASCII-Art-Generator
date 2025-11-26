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
- **Invert**: Inverts the mapping (Bright areas become dark, Dark areas become bright).

### 3. Export
- **PNG & JPEG**: Download high-resolution renders of your ASCII art.

## Technical Implementation
- **Canvas API**: Used for both analyzing the source image pixel data and rendering the final ASCII text.
- **Offscreen Canvas**: Used to resize and filter the image (contrast/brightness) before processing.
- **Responsive Design**: The layout adapts to the screen size, with a glassmorphism sidebar.

## How to Run
1. Open the project directory.
2. Run `npm run dev` (if using Vite) or simply open `index.html` in a browser (though some file access features might require a local server).
