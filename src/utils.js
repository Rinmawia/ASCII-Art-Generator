/**
 * Converts a hex color string to an RGB object.
 * @param {string} hex - The hex color string (e.g., "#ffffff").
 * @returns {{r: number, g: number, b: number}} RGB object.
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}
