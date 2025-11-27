import { elements, toggleLoader, updateUIValues, updateControlVisibility } from './ui.js';
import { state, initHistory, commitState, undo, redo, resetApp } from './state.js';
import { render } from './renderer.js';
import { initViewportListeners, fitCanvasToScreen, updateViewport } from './viewport.js';

// Initialize
initHistory();
initViewportListeners(state);

// Event Listeners
elements.cancelBtn.addEventListener('click', resetApp);
elements.imageInput.addEventListener('change', handleImageUpload);
elements.placeholder.addEventListener('click', () => elements.imageInput.click());

// Mobile Drawer - ensure closed by default on mobile
if (window.innerWidth <= 768) {
  elements.sidebar.classList.remove('open');
  console.log('Mobile detected, drawer closed by default');
}

elements.btnAdjustment.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = elements.sidebar.classList.toggle('open');
  console.log('Drawer toggled, now open:', isOpen);
});

// Close button for drawer
const drawerClose = document.getElementById('drawerClose');
if (drawerClose) {
  drawerClose.addEventListener('click', () => {
    elements.sidebar.classList.remove('open');
    console.log('Drawer closed via close button');
  });
}

// Close drawer when clicking/touching outside
function closeDrawerOnOutsideClick(e) {
  if (window.innerWidth <= 768 && elements.sidebar.classList.contains('open')) {
    // Check if click is outside sidebar and not on the adjustment button
    const clickedInsideSidebar = elements.sidebar.contains(e.target);
    const clickedAdjustmentButton = elements.btnAdjustment.contains(e.target);

    if (!clickedInsideSidebar && !clickedAdjustmentButton) {
      elements.sidebar.classList.remove('open');
    }
  }
}

// Listen for both mouse and touch events
document.addEventListener('click', closeDrawerOnOutsideClick);
document.addEventListener('touchend', closeDrawerOnOutsideClick, { passive: true });

// Tabs
function switchTab(tabName) {
  if (tabName === 'adjustments') {
    elements.tabBtnAdjustments.classList.add('active');
    elements.tabBtnTransform.classList.remove('active');
    elements.tabAdjustments.classList.remove('hidden');
    elements.tabTransform.classList.add('hidden');
  } else {
    elements.tabBtnAdjustments.classList.remove('active');
    elements.tabBtnTransform.classList.add('active');
    elements.tabAdjustments.classList.add('hidden');
    elements.tabTransform.classList.remove('hidden');
  }
}

elements.tabBtnAdjustments.addEventListener('click', () => switchTab('adjustments'));
elements.tabBtnTransform.addEventListener('click', () => switchTab('transform'));

elements.resolution.addEventListener('input', updateSettings);
elements.contrast.addEventListener('input', updateSettings);
elements.brightness.addEventListener('input', updateSettings);
elements.scale.addEventListener('input', updateSettings);
elements.rotation.addEventListener('input', updateSettings);
elements.offsetX.addEventListener('input', updateSettings);
elements.offsetY.addEventListener('input', updateSettings);
elements.highlightColor.addEventListener('input', updateSettings);
elements.shadowColor.addEventListener('input', updateSettings);
elements.backgroundColor.addEventListener('input', updateSettings);

const controls = [
  elements.resolution, elements.contrast, elements.brightness,
  elements.scale, elements.rotation, elements.offsetX, elements.offsetY,
  elements.colorMode, elements.invert, elements.aspectRatio,
  elements.customTint, elements.highlightColor, elements.shadowColor,
  elements.backgroundColor
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

elements.btnExport.addEventListener('click', (e) => {
  e.stopPropagation();
  elements.exportMenu.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!elements.btnExport.contains(e.target) && !elements.exportMenu.contains(e.target)) {
    elements.exportMenu.classList.add('hidden');
  }
});

elements.exportPng.addEventListener('click', () => {
  exportImage('png');
  elements.exportMenu.classList.add('hidden');
});

elements.exportJpeg.addEventListener('click', () => {
  exportImage('jpeg');
  elements.exportMenu.classList.add('hidden');
});

// Toolbar Tools
const tools = ['toolCursor', 'toolHand'];
tools.forEach(toolId => {
  elements[toolId].addEventListener('click', () => {
    // Update state
    const toolName = toolId.replace('tool', '').toLowerCase();
    state.activeTool = toolName;

    // Update UI
    tools.forEach(t => elements[t].classList.remove('active'));
    elements[toolId].classList.add('active');

    // Update cursor style based on tool
    updateCursorStyle();
  });
});

// Zoom Controls
elements.zoomIn.addEventListener('click', () => {
  if (!state.image) return;
  const newScale = state.viewScale + 0.1;
  if (newScale <= 5) {
    state.viewScale = newScale;
    updateViewport(state);
  }
});

elements.zoomOut.addEventListener('click', () => {
  if (!state.image) return;
  const newScale = state.viewScale - 0.1;
  if (newScale >= 0.1) {
    state.viewScale = newScale;
    updateViewport(state);
  }
});

// Filename Editing - single click
elements.filenameText.addEventListener('click', () => {
  elements.filenameText.contentEditable = true;
  elements.filenameText.focus();

  // Select all text for easy replacement
  const range = document.createRange();
  range.selectNodeContents(elements.filenameText);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  elements.filenameDisplay.classList.add('editing');
});

elements.filenameText.addEventListener('blur', () => {
  elements.filenameText.contentEditable = false;
  elements.filenameDisplay.classList.remove('editing');
});

elements.filenameText.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    elements.filenameText.blur();
  }
});

elements.btnUndo.addEventListener('click', undo);
elements.btnRedo.addEventListener('click', redo);

function updateCursorStyle() {
  if (state.activeTool === 'hand') {
    elements.canvasContainer.style.cursor = 'grab';
  } else {
    elements.canvasContainer.style.cursor = 'default';
  }
}

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
  toggleLoader(true);

  // Set default filename
  const date = new Date().toISOString().split('T')[0];
  if (elements.filenameText) {
    elements.filenameText.textContent = `Untitled-${date}`;
  }

  setTimeout(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.image = img;

        // Update UI to show we have an image
        updateUIValues(state);

        render(state, elements.canvas, elements.ctx);
        fitCanvasToScreen(state);
        commitState();

        toggleLoader(false);
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
      if (type === 'color') {
        state[id] = value;
      } else if (type === 'range' || type === 'number') {
        state[id] = parseFloat(value);
      } else {
        state[id] = value;
      }

      // Update display value immediately
      const display = document.getElementById(`${id}Value`);
      if (display) {
        if (id === 'rotation') display.textContent = `${value}°`;
        else display.textContent = value;
      }
    }

    // Check for Aspect Ratio change to trigger fit
    if (id === 'aspectRatio') {
      setTimeout(() => fitCanvasToScreen(state), 0);
    }
  }

  updateControlVisibility(state);
  if (state.image) render(state, elements.canvas, elements.ctx);
}

function exportImage(format) {
  if (!state.image) return;
  const link = document.createElement('a');
  // Use current filename
  const filename = elements.filenameText.textContent.trim() || 'ascii-art';
  link.download = `${filename}.${format}`;
  link.href = elements.canvas.toDataURL(`image/${format}`);
  link.click();
}
