/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#009951',
        'primary-hover': '#007b3a',
        background: '#B1D8B6',
        card: '#CFF7D3',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};