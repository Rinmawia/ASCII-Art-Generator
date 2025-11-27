// Configuration State
const state = {
  image: null,
  resolution: 128,
  contrast: 1.0,
  brightness: 1.0,
  colorMode: false,
  customTint: false,
  highlightColor: "#ffffff",
  shadowColor: "#000000",
  invert: false,
  aspectRatio: 'auto',
  scale: 1.0,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  asciiChars: " .:-=+*#%@", // Simple gradient
  // Viewport State
  viewScale: 1,
  viewPanX: 0,
  viewPanY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
};

// History State
const history = {
  undoStack: [],
  redoStack: [],
  lastCommittedState: null // Will be initialized in init
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
  customTint: document.getElementById('customTint'),
  highlightColor: document.getElementById('highlightColor'),
  shadowColor: document.getElementById('shadowColor'),
  colorControls: document.getElementById('colorControls'),
  tintPickers: document.getElementById('tintPickers'),
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
  toast: document.getElementById('toast'),
  resetBtn: document.getElementById('resetBtn'),
  navActions: document.getElementById('navActions'),
  loader: document.getElementById('loader'),
};

// Initialize History
function initHistory() {
  history.lastCommittedState = cloneState(state);
}

function cloneState(s) {
  return {
    image: s.image,
    resolution: s.resolution,
    contrast: s.contrast,
    brightness: s.brightness,
    colorMode: s.colorMode,
    customTint: s.customTint,
    highlightColor: s.highlightColor,
    shadowColor: s.shadowColor,
    invert: s.invert,
    aspectRatio: s.aspectRatio,
    scale: s.scale,
    rotation: s.rotation,
    offsetX: s.offsetX,
    offsetY: s.offsetY,
    asciiChars: s.asciiChars
    // Viewport is UI state, maybe not strictly history?
    // User asked for undo/redo of parameters. Viewport is usually transient.
    // Let's NOT include viewport in history for now to keep it simple and fluid.
  };
}

// Initial State for Reset
const initialState = cloneState(state);

function resetApp() {
  // Reset state to initial
  Object.assign(state, cloneState(initialState));
  state.image = null; // Ensure image is cleared

  // Reset Viewport
  state.viewScale = 1;
  state.viewPanX = 0;
  state.viewPanY = 0;
  updateViewport();

  // Clear history
  history.undoStack = [];
  history.redoStack = [];
  history.lastCommittedState = cloneState(state);

  // Update UI
  applyState(state);

  showToast('Reset');
}

function commitState() {
  history.undoStack.push(history.lastCommittedState);
  history.redoStack = [];
  history.lastCommittedState = cloneState(state);
  if (history.undoStack.length > 50) history.undoStack.shift();
}

function undo() {
  if (history.undoStack.length === 0) return;
  history.redoStack.push(history.lastCommittedState);
  const prevState = history.undoStack.pop();

  // Determine what changed for Toast
  const changes = getChanges(history.lastCommittedState, prevState);

  applyState(prevState);
  history.lastCommittedState = prevState;

  if (changes.length > 0) {
    showToast(`Undo: ${changes.join(', ')}`);
  } else {
    showToast('Undo');
  }
}

function redo() {
  if (history.redoStack.length === 0) return;
  history.undoStack.push(history.lastCommittedState);
  const nextState = history.redoStack.pop();

  const changes = getChanges(history.lastCommittedState, nextState);

  applyState(nextState);
  history.lastCommittedState = nextState;

  if (changes.length > 0) {
    showToast(`Redo: ${changes.join(', ')}`);
  } else {
    showToast('Redo');
  }
}

function getChanges(oldState, newState) {
  const changes = [];
  if (oldState.resolution !== newState.resolution) changes.push('Resolution');
  if (oldState.contrast !== newState.contrast) changes.push('Contrast');
  if (oldState.brightness !== newState.brightness) changes.push('Brightness');
  if (oldState.colorMode !== newState.colorMode) changes.push('Color Mode');
  if (oldState.customTint !== newState.customTint) changes.push('Tint');
  if (oldState.highlightColor !== newState.highlightColor) changes.push('Highlight');
  if (oldState.shadowColor !== newState.shadowColor) changes.push('Shadow');
  if (oldState.invert !== newState.invert) changes.push('Invert');
  if (oldState.aspectRatio !== newState.aspectRatio) changes.push('Aspect Ratio');
  if (oldState.scale !== newState.scale) changes.push('Scale');
  if (oldState.rotation !== newState.rotation) changes.push('Rotation');
  if (oldState.offsetX !== newState.offsetX || oldState.offsetY !== newState.offsetY) changes.push('Position');
  if (oldState.image !== newState.image) changes.push('Image');
  return changes;
}

let toastTimeout;
function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 2000);
}

function applyState(newState) {
  Object.assign(state, cloneState(newState));

  elements.resolution.value = state.resolution;
  document.getElementById('resolutionValue').textContent = state.resolution;

  elements.contrast.value = state.contrast;
  document.getElementById('contrastValue').textContent = state.contrast;

  elements.brightness.value = state.brightness;
  document.getElementById('brightnessValue').textContent = state.brightness;

  elements.colorMode.checked = state.colorMode;
  elements.customTint.checked = state.customTint;
  elements.highlightColor.value = state.highlightColor;
  elements.shadowColor.value = state.shadowColor;

  elements.invert.checked = state.invert;
  elements.aspectRatio.value = state.aspectRatio;

  elements.scale.value = state.scale;
  document.getElementById('scaleValue').textContent = state.scale;

  elements.rotation.value = state.rotation;
  document.getElementById('rotationValue').textContent = `${state.rotation}°`;

  elements.offsetX.value = state.offsetX;
  document.getElementById('offsetXValue').textContent = state.offsetX;

  elements.offsetY.value = state.offsetY;
  document.getElementById('offsetYValue').textContent = state.offsetY;

  // UI Visibility Logic
  updateControlVisibility();

  if (state.image) {
    elements.placeholder.classList.add('hidden');
    elements.resetBtn.classList.remove('hidden');
    elements.navActions.classList.remove('hidden');
  } else {
    elements.placeholder.classList.remove('hidden');
    elements.resetBtn.classList.add('hidden');
    elements.navActions.classList.add('hidden');
    // Clear canvas
    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    // Reset canvas size to 0 or small to avoid taking space?
    // Actually canvas is inside container, clearing it is enough visually.
    // But let's keep it clean.
    elements.canvas.width = 0;
    elements.canvas.height = 0;
  }

  render();
}

function updateControlVisibility() {
  if (state.colorMode) {
    elements.colorControls.classList.remove('hidden');
  } else {
    elements.colorControls.classList.add('hidden');
  }

  if (state.customTint) {
    elements.tintPickers.classList.remove('hidden');
  } else {
    elements.tintPickers.classList.add('hidden');
  }
}

// Helper to parse hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Viewport Logic
function updateViewport() {
  elements.canvas.style.transform = `translate(${state.viewPanX}px, ${state.viewPanY}px) scale(${state.viewScale})`;
}

function fitCanvasToScreen() {
  if (!state.image) return;

  const containerWidth = elements.canvasContainer.clientWidth;
  const containerHeight = elements.canvasContainer.clientHeight;
  const canvasWidth = elements.canvas.width / 2; // /2 because of scale=2 in render
  const canvasHeight = elements.canvas.height / 2;

  if (canvasWidth === 0 || canvasHeight === 0) return;

  const padding = 40;
  const availableWidth = containerWidth - padding;
  const availableHeight = containerHeight - padding;

  const scaleX = availableWidth / canvasWidth;
  const scaleY = availableHeight / canvasHeight;

  // Fit to contain
  state.viewScale = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 100% initially if it fits
  if (state.viewScale < 0.1) state.viewScale = 0.1; // Min scale safety

  // Center
  state.viewPanX = 0;
  state.viewPanY = 0;

  updateViewport();
}

// Event Listeners
elements.resetBtn.addEventListener('click', resetApp);
elements.imageInput.addEventListener('change', handleImageUpload);
elements.placeholder.addEventListener('click', () => elements.imageInput.click());

elements.resolution.addEventListener('input', updateSettings);
elements.contrast.addEventListener('input', updateSettings);
elements.brightness.addEventListener('input', updateSettings);
elements.scale.addEventListener('input', updateSettings);
elements.rotation.addEventListener('input', updateSettings);
elements.offsetX.addEventListener('input', updateSettings);
elements.offsetY.addEventListener('input', updateSettings);
elements.highlightColor.addEventListener('input', updateSettings);
elements.shadowColor.addEventListener('input', updateSettings);

const controls = [
  elements.resolution, elements.contrast, elements.brightness,
  elements.scale, elements.rotation, elements.offsetX, elements.offsetY,
  elements.colorMode, elements.invert, elements.aspectRatio,
  elements.customTint, elements.highlightColor, elements.shadowColor
];

controls.forEach(el => {
  el.addEventListener('change', (e) => {
    updateSettings(e);
    commitState();
  });
});

document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      redo();
    } else {
      undo();
    }
  }
});

elements.exportPng.addEventListener('click', () => exportImage('png'));
elements.exportJpeg.addEventListener('click', () => exportImage('jpeg'));

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

// Viewport Event Listeners
elements.canvasContainer.addEventListener('wheel', (e) => {
  if (!state.image) return;
  e.preventDefault();

  const zoomIntensity = 0.1;
  const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
  const newScale = state.viewScale + delta;

  // Limit zoom
  if (newScale > 0.1 && newScale < 5) {
    state.viewScale = newScale;
    updateViewport();
  }
});

elements.canvasContainer.addEventListener('mousedown', (e) => {
  if (!state.image) return;
  state.isDragging = true;
  state.lastMouseX = e.clientX;
  state.lastMouseY = e.clientY;
  elements.canvasContainer.style.cursor = 'grabbing';
});

window.addEventListener('mousemove', (e) => {
  if (!state.isDragging) return;
  e.preventDefault();

  const deltaX = e.clientX - state.lastMouseX;
  const deltaY = e.clientY - state.lastMouseY;

  state.viewPanX += deltaX;
  state.viewPanY += deltaY;

  state.lastMouseX = e.clientX;
  state.lastMouseY = e.clientY;

  updateViewport();
});

window.addEventListener('mouseup', () => {
  state.isDragging = false;
  elements.canvasContainer.style.cursor = 'grab';
});

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (file) processFile(file);
}

function processFile(file) {
  elements.loader.classList.remove('hidden');

  // Use setTimeout to allow UI to update (show loader) before heavy processing
  setTimeout(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;
        elements.placeholder.classList.add('hidden');
        elements.resetBtn.classList.remove('hidden');
        elements.navActions.classList.remove('hidden');

        render();
        fitCanvasToScreen(); // Fit on load
        commitState();

        elements.loader.classList.add('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, 50);
}

function updateSettings(e) {
  if (e) {
    const { id, value, type, checked } = e.target;
    if (type === 'checkbox') {
      state[id] = checked;
    } else {
      // For color inputs, value is hex string, don't parseFloat
      if (type === 'color') {
        state[id] = value;
      } else if (type === 'range' || type === 'number') {
        state[id] = parseFloat(value);
      } else {
        state[id] = value;
      }

      const display = document.getElementById(`${id}Value`);
      if (display) {
        if (id === 'rotation') display.textContent = `${value}°`;
        else display.textContent = value;
      }
    }

    // Check for Aspect Ratio change to trigger fit
    if (id === 'aspectRatio') {
      // We need to wait for render to update canvas size first
      setTimeout(() => fitCanvasToScreen(), 0);
    }
  }

  updateControlVisibility();
  if (state.image) render();
}

function getTargetDimensions(imgWidth, imgHeight) {
  if (state.aspectRatio === 'auto') {
    return { width: imgWidth, height: imgHeight, ratio: imgWidth / imgHeight };
  }
  const [w, h] = state.aspectRatio.split(':').map(Number);
  const targetRatio = w / h;
  let targetWidth = imgWidth;
  let targetHeight = imgWidth / targetRatio;
  return { width: targetWidth, height: targetHeight, ratio: targetRatio };
}

function render() {
  if (!state.image) return;

  const { width: imgWidth, height: imgHeight } = state.image;
  const { width: targetWidth, height: targetHeight, ratio: targetRatio } = getTargetDimensions(imgWidth, imgHeight);

  const cols = state.resolution;
  const fontAspectRatio = 0.6;
  const rows = Math.floor(cols / targetRatio * fontAspectRatio);

  const offCanvas = document.createElement('canvas');
  offCanvas.width = cols;
  offCanvas.height = rows;
  const offCtx = offCanvas.getContext('2d');

  offCtx.fillStyle = '#000000';
  offCtx.fillRect(0, 0, cols, rows);
  offCtx.filter = `contrast(${state.contrast}) brightness(${state.brightness})`;

  offCtx.save();
  offCtx.translate(cols / 2, rows / 2);
  offCtx.translate(state.offsetX * (cols / 100), state.offsetY * (rows / 100));
  offCtx.rotate(state.rotation * Math.PI / 180);
  offCtx.scale(state.scale, state.scale);

  const imgRatio = imgWidth / imgHeight;
  let drawWidth, drawHeight;
  const gridImgRatio = imgRatio / 0.6;
  if (gridImgRatio > (cols / rows)) {
    drawWidth = cols;
    drawHeight = cols / gridImgRatio;
  } else {
    drawHeight = rows;
    drawWidth = rows * gridImgRatio;
  }

  offCtx.drawImage(state.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  offCtx.restore();

  const imageData = offCtx.getImageData(0, 0, cols, rows);
  const data = imageData.data;

  const fontSize = 10;
  const scale = 2;
  const charWidth = fontSize * 0.6;
  const charHeight = fontSize;

  elements.canvas.width = cols * charWidth * scale;
  elements.canvas.height = rows * charHeight * scale;

  const ctx = elements.ctx;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, elements.canvas.width / scale, elements.canvas.height / scale);

  ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
  ctx.textBaseline = 'top';

  // Pre-calculate tint colors if needed
  let shadowR, shadowG, shadowB, highR, highG, highB;
  if (state.colorMode && state.customTint) {
    const s = hexToRgb(state.shadowColor);
    const h = hexToRgb(state.highlightColor);
    shadowR = s.r; shadowG = s.g; shadowB = s.b;
    highR = h.r; highG = h.g; highB = h.b;
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = (y * cols + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a < 128) continue;

      const brightness = (r + g + b) / 3;

      let charIndex;
      if (state.invert) {
        charIndex = Math.floor(((255 - brightness) / 255) * (state.asciiChars.length - 1));
      } else {
        charIndex = Math.floor((brightness / 255) * (state.asciiChars.length - 1));
      }
      charIndex = Math.max(0, Math.min(charIndex, state.asciiChars.length - 1));
      const char = state.asciiChars[charIndex];

      if (state.colorMode) {
        if (state.customTint) {
          // Interpolate between Shadow and Highlight based on brightness
          const t = brightness / 255;
          const finalR = Math.round(shadowR + (highR - shadowR) * t);
          const finalG = Math.round(shadowG + (highG - shadowG) * t);
          const finalB = Math.round(shadowB + (highB - shadowB) * t);
          ctx.fillStyle = `rgb(${finalR},${finalG},${finalB})`;
        } else {
          ctx.fillStyle = `rgb(${r},${g},${b})`;
        }
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
