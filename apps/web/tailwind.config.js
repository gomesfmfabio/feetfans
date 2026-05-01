/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed', // purple-600
          dark: '#6d28d9', // purple-700
          light: '#8b5cf6', // purple-500
        },
        secondary: {
          DEFAULT: '#ec4899', // pink-500
          dark: '#db2777', // pink-600
          light: '#f472b6', // pink-400
        },
      },
    },
  },
  plugins: [],
};
