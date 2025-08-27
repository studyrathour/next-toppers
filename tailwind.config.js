/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222, 47%, 11%)', // Dark Slate Blue
        surface: 'hsl(222, 47%, 16%)', // Slightly lighter slate blue
        primary: 'hsl(210, 90%, 60%)', // Bright Blue for accents
        secondary: 'hsl(222, 47%, 25%)',
        'text-primary': 'hsl(210, 40%, 98%)', // Almost white
        'text-secondary': 'hsl(210, 40%, 85%)', // Light gray
        'text-tertiary': 'hsl(210, 40%, 65%)',
        danger: 'hsl(0, 72%, 51%)',
      },
      boxShadow: {
        'glow-primary': '0 0 15px 0px hsla(210, 90%, 60%, 0.5)',
      }
    },
  },
  plugins: [],
};
