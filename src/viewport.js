import { elements } from './ui.js';

export function updateViewport(state) {
  elements.canvas.style.transform = `translate(${state.viewPanX}px, ${state.viewPanY}px) scale(${state.viewScale})`;
}

export function fitCanvasToScreen(state) {
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

  updateViewport(state);
}

export function initViewportListeners(state) {
  elements.canvasContainer.addEventListener('wheel', (e) => {
    if (!state.image) return;
    e.preventDefault();

    // Check for Cmd/Ctrl key for zooming
    if (e.metaKey || e.ctrlKey) {
      // Pinch zoom often comes with ctrlKey on some browsers/OS
      // Reduce sensitivity for pinch zoom (which usually has smaller deltas but fires rapidly)
      // Standard mouse wheel usually has larger deltas (e.g., 100)

      // Heuristic: smaller deltaY usually means trackpad/pinch
      const isTrackpad = Math.abs(e.deltaY) < 50;
      const zoomIntensity = isTrackpad ? 0.01 : 0.1;

      const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
      const newScale = state.viewScale + delta;

      // Limit zoom
      if (newScale > 0.1 && newScale < 5) {
        state.viewScale = newScale;
        updateViewport(state);
      }
    } else {
      // Normal scroll = Pan
      state.viewPanX -= e.deltaX;
      state.viewPanY -= e.deltaY;
      updateViewport(state);
    }
  }, { passive: false });

  elements.canvasContainer.addEventListener('mousedown', (e) => {
    if (!state.image) return;

    // Zoom Tool Click
    if (state.activeTool === 'zoom') {
      const zoomFactor = e.altKey ? -0.5 : 0.5; // Alt+Click to zoom out
      const newScale = state.viewScale + zoomFactor;
      if (newScale > 0.1 && newScale < 5) {
        state.viewScale = newScale;
        updateViewport(state);
      }
      return;
    }

    // Pan Logic (Hand tool OR Spacebar)
    const isHandTool = state.activeTool === 'hand';
    const isSpacePressed = e.code === 'Space' || e.key === ' '; // Note: keydown handles space, we need to track it or check modifier if possible. 
    // Actually, spacebar usually prevents default and we track keydown state. 
    // Let's rely on a global 'isSpaceDown' tracker or just check if we are in "pan mode".
    // Since we don't have a global key tracker in this file, let's add one or rely on the tool state.
    // But wait, the user said "Panning is enabled by Space + Mouse drag".

    // Let's check for Space key state. We can add a listener to window to track it.

    if (isHandTool || state.isSpaceDown) {
      state.isDragging = true;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      elements.canvasContainer.style.cursor = 'grabbing';
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.repeat && !e.target.matches('input, textarea')) {
      state.isSpaceDown = true;
      if (state.activeTool !== 'hand') {
        elements.canvasContainer.style.cursor = 'grab';
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      state.isSpaceDown = false;
      if (!state.isDragging) {
        // Restore cursor based on tool
        if (state.activeTool === 'hand') elements.canvasContainer.style.cursor = 'grab';
        else if (state.activeTool === 'zoom') elements.canvasContainer.style.cursor = 'zoom-in';
        else elements.canvasContainer.style.cursor = 'default';
      }
    }
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

    updateViewport(state);
  });

  window.addEventListener('mouseup', () => {
    state.isDragging = false;
    if (state.activeTool === 'hand' || state.isSpaceDown) {
      elements.canvasContainer.style.cursor = 'grab';
    } else if (state.activeTool === 'zoom') {
      elements.canvasContainer.style.cursor = 'zoom-in';
    } else {
      elements.canvasContainer.style.cursor = 'default';
    }
  });
}
