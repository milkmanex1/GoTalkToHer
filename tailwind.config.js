/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary Accent (Pink)
        primary: '#FF4FA3',
        secondary: '#FF4FA3',
        accent: '#FF4FA3',
        pink: '#FF4FA3',
        pinkAccent: '#FF4FA3',
        
        // Dark Background
        background: '#0E0F12',
        dark: '#0E0F12',
        
        // Surface Layer (Cards, Panels)
        surface: '#1A1C20',
        darkSurface: '#1A1C20',
        
        // Text Colors
        text: '#FFFFFF', // High-emphasis
        textMedium: '#D0D0D0', // Medium-emphasis
        textSecondary: '#A0A0A0', // Low-emphasis
        
        // Borders / Lines
        border: '#2D2F34',
      },
    },
  },
  plugins: [],
}

