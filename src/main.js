
// Configuration State
const state = {
  image: null,
  resolution: 128,
  contrast: 1.0,
  brightness: 1.0,
  colorMode: false,
  invert: false,
  aspectRatio: 'auto',
  scale: 1.0,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  asciiChars: " .:-=+*#%@", // Simple gradient
};

// DOM Elements
const elements = {
  imageInput: document.getElementById('imageInput'),
  canvas: document.getElementById('asciiCanvas'),
  ctx: document.getElementById('asciiCanvas').getContext('2d'),
  resolution: document.getElementById('resolution'),
  resolutionValue: document.getElementById('resolutionValue'),
  contrast: document.getElementById('contrast'),
  contrastValue: document.getElementById('contrastValue'),
  brightness: document.getElementById('brightness'),
  brightnessValue: document.getElementById('brightnessValue'),
  colorMode: document.getElementById('colorMode'),
  invert: document.getElementById('invert'),
  aspectRatio: document.getElementById('aspectRatio'),
  scale: document.getElementById('scale'),
  scaleValue: document.getElementById('scaleValue'),
  rotation: document.getElementById('rotation'),
  rotationValue: document.getElementById('rotationValue'),
  offsetX: document.getElementById('offsetX'),
  offsetXValue: document.getElementById('offsetXValue'),
  offsetY: document.getElementById('offsetY'),
  offsetYValue: document.getElementById('offsetYValue'),
  exportPng: document.getElementById('exportPng'),
  exportJpeg: document.getElementById('exportJpeg'),
  placeholder: document.getElementById('uploadPlaceholder'),
  canvasContainer: document.getElementById('canvasContainer'),
};

// Event Listeners
elements.imageInput.addEventListener('change', handleImageUpload);
// Trigger file input when clicking placeholder
elements.placeholder.addEventListener('click', () => elements.imageInput.click());

elements.resolution.addEventListener('input', updateSettings);
elements.contrast.addEventListener('input', updateSettings);
elements.brightness.addEventListener('input', updateSettings);
elements.colorMode.addEventListener('change', updateSettings);
elements.invert.addEventListener('change', updateSettings);
elements.aspectRatio.addEventListener('change', (e) => {
  state.aspectRatio = e.target.value;
  render();
});
elements.scale.addEventListener('input', updateSettings);
elements.rotation.addEventListener('input', updateSettings);
elements.offsetX.addEventListener('input', updateSettings);
elements.offsetY.addEventListener('input', updateSettings);

elements.exportPng.addEventListener('click', () => exportImage('png'));
elements.exportJpeg.addEventListener('click', () => exportImage('jpeg'));

// Drag and Drop
elements.canvasContainer.addEventListener('dragover', (e) => {
  e.preventDefault();
  elements.canvasContainer.style.borderColor = 'var(--accent-color)';
});

elements.canvasContainer.addEventListener('dragleave', (e) => {
  e.preventDefault();
  elements.canvasContainer.style.borderColor = 'transparent';
});

elements.canvasContainer.addEventListener('drop', (e) => {
  e.preventDefault();
  elements.canvasContainer.style.borderColor = 'transparent';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    processFile(file);
  }
});

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      state.image = img;
      elements.placeholder.classList.add('hidden');
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function updateSettings(e) {
  if (e) {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      state[id] = checked;
    } else {
      state[id] = parseFloat(value);
      // Update display value
      const display = document.getElementById(`${id}Value`);
      if (display) {
        if (id === 'rotation') display.textContent = `${value}°`;
        else display.textContent = value;
      }
    }
  }
  if (state.image) render();
}

function getTargetDimensions(imgWidth, imgHeight) {
  if (state.aspectRatio === 'auto') {
    return { width: imgWidth, height: imgHeight, ratio: imgWidth / imgHeight };
  }

  const [w, h] = state.aspectRatio.split(':').map(Number);
  const targetRatio = w / h;

  // We want to base the size on the image's largest dimension to keep resolution high
  // But effectively we are defining a "viewport"
  // Let's say we keep the width constant and adjust height, or vice versa

  let targetWidth = imgWidth;
  let targetHeight = imgWidth / targetRatio;

  return { width: targetWidth, height: targetHeight, ratio: targetRatio };
}

function render() {
  if (!state.image) return;

  const { width: imgWidth, height: imgHeight } = state.image;

  // 1. Determine the "Canvas" dimensions based on Aspect Ratio
  const { width: targetWidth, height: targetHeight, ratio: targetRatio } = getTargetDimensions(imgWidth, imgHeight);

  // 2. Setup the grid for ASCII
  const cols = state.resolution;
  const fontAspectRatio = 0.6;
  const rows = Math.floor(cols / targetRatio * fontAspectRatio);

  // 3. Create offscreen canvas to render the transformed image
  // This canvas represents the "Viewport" pixels
  const offCanvas = document.createElement('canvas');
  offCanvas.width = cols;
  offCanvas.height = rows;
  const offCtx = offCanvas.getContext('2d');

  // Fill with black (or background color) first
  offCtx.fillStyle = '#000000';
  offCtx.fillRect(0, 0, cols, rows);

  // Apply filters
  offCtx.filter = `contrast(${state.contrast}) brightness(${state.brightness})`;

  // 4. Draw the image with transforms
  // We need to map the image coordinates to this small offCanvas

  offCtx.save();

  // Move to center of canvas
  offCtx.translate(cols / 2, rows / 2);

  // Apply transforms
  offCtx.translate(state.offsetX * (cols / 100), state.offsetY * (rows / 100)); // Offset is percentage-ish
  offCtx.rotate(state.rotation * Math.PI / 180);
  offCtx.scale(state.scale, state.scale);

  // Draw image centered
  // We need to scale the image to fit the "viewport" initially?
  // If Aspect Ratio is Auto, it fits perfectly.
  // If Aspect Ratio is different, we probably want 'contain' or 'cover' logic?
  // Let's assume 'contain' logic for the base scale 1.0

  const imgRatio = imgWidth / imgHeight;
  let drawWidth, drawHeight;

  if (imgRatio > targetRatio) {
    // Image is wider than viewport -> Fit to width
    drawWidth = cols;
    drawHeight = cols / imgRatio * fontAspectRatio; // Need to account for non-square pixels of ASCII grid?
    // Actually, we are drawing to a pixel grid that will be interpreted as text.
    // The offCanvas is "cols x rows".
    // If we draw the image to fill "cols x rows", it will look stretched if we don't respect aspect ratio.

    // Let's simplify:
    // We want to draw the image such that it covers the area properly.
    // We are drawing into a coordinate system of [0..cols, 0..rows].
    // The aspect ratio of this coordinate system is targetRatio (visually).

    // If we draw the image with dimensions (cols, cols / imgRatio), it would be distorted because the pixels aren't square?
    // No, the offCanvas pixels are square. The FINAL rendering uses non-square fonts.
    // So 'rows' is calculated to make the final output look like 'targetRatio'.
    // So if we draw a circle on offCanvas, it should look like an ellipse on offCanvas, so that it looks like a circle on final output?
    // Wait.
    // If we have 100 cols. Font is 0.6 width.
    // Visual Width = 100 * 0.6 = 60 units.
    // Visual Height = rows * 1.0 = rows units.
    // We want Visual Width / Visual Height = targetRatio.
    // 60 / rows = targetRatio => rows = 60 / targetRatio.
    // rows = (cols * 0.6) / targetRatio.
    // This matches my 'rows' calculation above.

    // So, the offCanvas represents the visual image squashed horizontally?
    // No.
    // If I draw a perfect square 10x10 pixels on offCanvas.
    // It will be rendered as 10 chars wide (10 * 0.6 = 6 units) and 10 chars tall (10 * 1.0 = 10 units).
    // So it will look tall and thin.
    // To make it look square in output, we need to draw it 10 pixels wide and 6 pixels tall on offCanvas.
    // So we need to squash the Y axis of the drawing on offCanvas?
    // OR stretch the X axis?

    // Let's try to just draw normally and see.
    // If I draw image 0,0,cols,rows -> It fills the ASCII grid.
    // If the grid has the same aspect ratio as the image, it looks fine.
    // My 'rows' calc ensures the grid has the target aspect ratio.
    // So if I draw the image to fill cols/rows, it will be stretched to the target aspect ratio.
    // This is expected behavior if I change aspect ratio to 1:1 but image is 16:9.

    // However, with transforms, we want to maintain aspect ratio of the image itself usually.
    // So we should draw the image with its natural aspect ratio into this grid.

    // Natural aspect ratio in "Grid Units":
    // We want the image to appear correct.
    // Visual Aspect Ratio of Image = imgWidth / imgHeight.
    // Grid Aspect Ratio (cols/rows) != Visual Aspect Ratio.

    // We need to scale the drawing such that:
    // drawnWidth_pixels / drawnHeight_pixels * (fontWidth/fontHeight) = imgWidth / imgHeight
    // drawnWidth / drawnHeight * 0.6 = imgRatio
    // drawnWidth / drawnHeight = imgRatio / 0.6

    const gridImgRatio = imgRatio / 0.6;

    if (gridImgRatio > (cols / rows)) {
      // Image is wider than canvas (in grid units)
      drawWidth = cols;
      drawHeight = cols / gridImgRatio;
    } else {
      // Image is taller
      drawHeight = rows;
      drawWidth = rows * gridImgRatio;
    }
  } else {
    // Same logic as above actually
    const gridImgRatio = imgRatio / 0.6;
    if (gridImgRatio > (cols / rows)) {
      drawWidth = cols;
      drawHeight = cols / gridImgRatio;
    } else {
      drawHeight = rows;
      drawWidth = rows * gridImgRatio;
    }
  }

  offCtx.drawImage(state.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  offCtx.restore();

  const imageData = offCtx.getImageData(0, 0, cols, rows);
  const data = imageData.data;

  // Setup main canvas
  const fontSize = 10;
  const scale = 2;
  const charWidth = fontSize * 0.6;
  const charHeight = fontSize;

  elements.canvas.width = cols * charWidth * scale;
  elements.canvas.height = rows * charHeight * scale;

  const ctx = elements.ctx;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, elements.canvas.width / scale, elements.canvas.height / scale);

  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
  ctx.textBaseline = 'top';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = (y * cols + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      // If transparent (from rotation/scale), skip or draw black
      if (a < 128) continue;

      const brightness = (r + g + b) / 3;

      // Fix Invert Logic
      // Standard (White on Black):
      // Bright pixel (255) -> Dense char (@) -> Looks white
      // Dark pixel (0) -> Sparse char (.) -> Looks black (bg)

      // Inverted (White on Black):
      // Bright pixel (255) -> Sparse char (.) -> Looks black (bg) -> "Inverted"
      // Dark pixel (0) -> Dense char (@) -> Looks white -> "Inverted"

      let charIndex;
      if (state.invert) {
        // Invert: Brightness 255 -> Index 0 (Sparse)
        // Brightness 0 -> Index Max (Dense)
        charIndex = Math.floor(((255 - brightness) / 255) * (state.asciiChars.length - 1));
      } else {
        // Normal: Brightness 255 -> Index Max (Dense)
        charIndex = Math.floor((brightness / 255) * (state.asciiChars.length - 1));
      }

      // Clamp
      charIndex = Math.max(0, Math.min(charIndex, state.asciiChars.length - 1));

      const char = state.asciiChars[charIndex];

      if (state.colorMode) {
        ctx.fillStyle = `rgb(${r},${g},${b})`;
      } else {
        ctx.fillStyle = '#ffffff';
      }

      ctx.fillText(char, x * charWidth, y * charHeight);
    }
  }
}

function exportImage(format) {
  if (!state.image) return;
  const link = document.createElement('a');
  link.download = `ascii-art.${format}`;
  link.href = elements.canvas.toDataURL(`image/${format}`);
  link.click();
}
