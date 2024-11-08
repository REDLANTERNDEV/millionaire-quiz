/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#000344',
        'custom-purple': '#DD00FF',
      },
    },
  },
  plugins: [],
};
