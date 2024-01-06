/**
 * Converts a hexadecimal color code to an RGB object.
 *
 * @param {string} hex - The hexadecimal color code to convert.
 * @return {object|null} An object representing the RGB values {r, g, b} of the color.
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Converts RGB color values to a hexadecimal color string.
 *
 * @param {number} r - The red color value (0-255).
 * @param {number} g - The green color value (0-255).
 * @param {number} b - The blue color value (0-255).
 * @return {string} The hexadecimal color string representation.
 */
export function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Returns a boolean value indicating whether the system is in dark mode.
 *
 * @return {boolean} A boolean value indicating whether the system is in dark mode.
 */
export const getSystemIsDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
