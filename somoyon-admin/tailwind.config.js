export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1D0061',
          light: '#6251A7',
          soft: '#CBBEFF',
          cream: '#FFF3CF',
          accent: '#D9342E',
          gold: '#F8DE22',
        },
      },
      fontFamily: {
        bn: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
