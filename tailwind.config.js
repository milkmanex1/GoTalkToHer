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
        primary: '#FF3E84',
        secondary: '#FF4FA3',
        accent: '#FF3E84',
        background: '#0F0F12',
        surface: '#111',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        pink: '#FF3E84',
        pinkAccent: '#FF4FA3',
        dark: '#0F0F12',
        darkSurface: '#111',
      },
    },
  },
  plugins: [],
}

