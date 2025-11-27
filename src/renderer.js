import { hexToRgb } from './utils.js';

function getTargetDimensions(state, imgWidth, imgHeight) {
  if (state.aspectRatio === 'auto') {
    return { width: imgWidth, height: imgHeight, ratio: imgWidth / imgHeight };
  }
  const [w, h] = state.aspectRatio.split(':').map(Number);
  const targetRatio = w / h;
  let targetWidth = imgWidth;
  let targetHeight = imgWidth / targetRatio;
  return { width: targetWidth, height: targetHeight, ratio: targetRatio };
}

export function render(state, canvas, ctx) {
  if (!state.image) return;

  try {
    const { width: imgWidth, height: imgHeight } = state.image;
    const { ratio: targetRatio } = getTargetDimensions(state, imgWidth, imgHeight);

    const cols = state.resolution;
    const fontAspectRatio = 0.6;
    const rows = Math.floor(cols / targetRatio * fontAspectRatio);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = cols;
    offCanvas.height = rows;
    const offCtx = offCanvas.getContext('2d');

    offCtx.fillStyle = state.backgroundColor || '#000000';
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

    canvas.width = cols * charWidth * scale;
    canvas.height = rows * charHeight * scale;

    ctx.scale(scale, scale);

    ctx.fillStyle = state.backgroundColor || '#000000';
    ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

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
  } catch (error) {
    console.error('Render error:', error);
  }
}
