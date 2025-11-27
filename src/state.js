import { showToast, updateUIValues } from './ui.js';
import { render } from './renderer.js';
import { elements } from './ui.js';
import { fitCanvasToScreen, updateViewport } from './viewport.js';

const defaultState = {
  image: null,
  resolution: 128,
  contrast: 1.0,
  brightness: 1.0,
  colorMode: false,
  customTint: false,
  highlightColor: "#ffffff",
  shadowColor: "#000000",
  backgroundColor: "#000000",
  invert: false,
  aspectRatio: 'auto',
  scale: 1.0,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  asciiChars: " .:-=+*#%@",
  // Viewport State
  viewScale: 1,
  viewPanX: 0,
  viewPanY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseX: 0,
  lastMouseY: 0,
  activeTool: 'cursor', // cursor, hand, zoom
  isSpaceDown: false,
};

export let state = { ...defaultState };

const history = {
  undoStack: [],
  redoStack: [],
  lastCommittedState: null
};

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
    backgroundColor: s.backgroundColor,
    invert: s.invert,
    aspectRatio: s.aspectRatio,
    scale: s.scale,
    rotation: s.rotation,
    offsetX: s.offsetX,
    offsetY: s.offsetY,
    asciiChars: s.asciiChars
  };
}

export function initHistory() {
  history.lastCommittedState = cloneState(state);
}

export function commitState() {
  history.undoStack.push(history.lastCommittedState);
  history.redoStack = [];
  history.lastCommittedState = cloneState(state);
  if (history.undoStack.length > 50) history.undoStack.shift();
}

export function undo() {
  if (history.undoStack.length === 0) return;
  history.redoStack.push(history.lastCommittedState);
  const prevState = history.undoStack.pop();

  const changes = getChanges(history.lastCommittedState, prevState);

  applyState(prevState);
  history.lastCommittedState = prevState;

  if (changes.length > 0) {
    showToast(`Undo: ${changes.join(', ')}`);
  } else {
    showToast('Undo');
  }
}

export function redo() {
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

export function resetApp() {
  Object.assign(state, cloneState(defaultState));
  state.image = null;

  // Reset Viewport
  state.viewScale = 1;
  state.viewPanX = 0;
  state.viewPanY = 0;
  updateViewport(state);

  history.undoStack = [];
  history.redoStack = [];
  history.lastCommittedState = cloneState(state);

  applyState(state);
  showToast('Reset');
}

function applyState(newState) {
  Object.assign(state, cloneState(newState));
  updateUIValues(state);
  render(state, elements.canvas, elements.ctx);
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
  if (oldState.backgroundColor !== newState.backgroundColor) changes.push('Background');
  if (oldState.invert !== newState.invert) changes.push('Invert');
  if (oldState.aspectRatio !== newState.aspectRatio) changes.push('Aspect Ratio');
  if (oldState.scale !== newState.scale) changes.push('Scale');
  if (oldState.rotation !== newState.rotation) changes.push('Rotation');
  if (oldState.offsetX !== newState.offsetX || oldState.offsetY !== newState.offsetY) changes.push('Position');
  if (oldState.image !== newState.image) changes.push('Image');
  return changes;
}
