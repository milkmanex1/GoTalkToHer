// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const theme = {
  // Brand primary
  primary: "#FF4FA3",

  // Background & surfaces
  background: "#0E0E0E",
  surface: "#1A1A1A",

  // Text colors
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",

  // Borders
  border: "#2D2F34",

  // Other optional semantic colors
  success: "#00D27A",
  error: "#FF3B3B",
  warning: "#FFB800",

  // Helper functions for rgba variations
  primaryRgba: (alpha) => hexToRgba("#FF4FA3", alpha),
  textSecondaryRgba: (alpha) => hexToRgba("#A0A0A0", alpha),
  successRgba: (alpha) => hexToRgba("#00D27A", alpha),
  backgroundRgba: (alpha) => hexToRgba("#0E0E0E", alpha),
};
