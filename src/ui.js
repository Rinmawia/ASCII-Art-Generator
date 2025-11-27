export const elements = {
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
  resetBtn: document.getElementById('resetBtn'), // Keeping for reference if needed, but we use cancelBtn now
  cancelBtn: document.getElementById('cancelBtn'),
  loader: document.getElementById('loader'),

  // Layout Elements
  sidebar: document.getElementById('sidebar'),
  navbar: document.getElementById('navbar'),
  toolbar: document.getElementById('toolbar'),
  filenameText: document.getElementById('filenameText'),

  // Tabs
  tabBtnAdjustments: document.getElementById('tabBtnAdjustments'),
  tabBtnTransform: document.getElementById('tabBtnTransform'),
  tabAdjustments: document.getElementById('tabAdjustments'),
  tabTransform: document.getElementById('tabTransform'),

  // Toolbar
  toolCursor: document.getElementById('toolCursor'),
  toolHand: document.getElementById('toolHand'),
  toolZoom: document.getElementById('toolZoom'),
  btnUndo: document.getElementById('btnUndo'),
  btnRedo: document.getElementById('btnRedo'),
  btnExport: document.getElementById('btnExport'),
  exportMenu: document.getElementById('exportMenu'),
  btnAdjustment: document.getElementById('btnAdjustment'),

  // Zoom Controls
  zoomControls: document.getElementById('zoomControls'),
  zoomIn: document.getElementById('zoomIn'),
  zoomOut: document.getElementById('zoomOut'),

  // Background
  backgroundColor: document.getElementById('backgroundColor'),

  // Backdrop
  backdropCanvas: document.getElementById('backdropCanvas'),
};

let toastTimeout;

export function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 2000);
}

export function toggleLoader(show) {
  if (show) {
    elements.loader.classList.remove('hidden');
  } else {
    elements.loader.classList.add('hidden');
  }
}

export function updateControlVisibility(state) {
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

export function updateUIValues(state) {
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
  elements.backgroundColor.value = state.backgroundColor;

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

  updateControlVisibility(state);

  if (state.image) {
    elements.placeholder.classList.add('hidden');
    elements.navbar.classList.remove('hidden');
    elements.toolbar.classList.remove('hidden');
    elements.zoomControls.classList.remove('hidden');
    elements.canvasContainer.classList.remove('hidden');
    elements.backdropCanvas.classList.add('hidden');

    // Show sidebar (desktop) or enable drawer (mobile)
    // We use a class 'visible' or just remove 'hidden' if we added it.
    // Since we want to hide it initially, let's assume we add a logic to show it.
    // The sidebar doesn't have a 'hidden' class by default in HTML, but we want to hide it.
    // Let's control opacity or display.
    elements.sidebar.classList.remove('hidden'); // Ensure it's visible if we hid it
  } else {
    elements.placeholder.classList.remove('hidden');
    elements.navbar.classList.add('hidden');
    elements.toolbar.classList.add('hidden');
    elements.zoomControls.classList.add('hidden');
    elements.canvasContainer.classList.add('hidden');
    elements.backdropCanvas.classList.remove('hidden');

    // Hide sidebar
    elements.sidebar.classList.add('hidden');

    // Clear canvas
    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    elements.canvas.width = 0;
    elements.canvas.height = 0;
  }
}
