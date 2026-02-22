/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ADR game theme colors
        'adr-dark': '#1a1a2e',
        'adr-darker': '#16213e',
        'adr-accent': '#e94560',
        'adr-gold': '#f0a500',
        'adr-blue': '#0f3460',
        'adr-green': '#4ecca3',
        'adr-red': '#e94560',
        'adr-purple': '#7b2d8e',
      },
    },
  },
  plugins: [],
};
