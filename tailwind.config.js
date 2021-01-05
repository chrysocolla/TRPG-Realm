const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: [
    './public/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Vollkorn', ...defaultTheme.fontFamily.serif],
      },
      gridTemplateRows: {
        '7': 'repeat(7, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
      },
      gridRow: {
       'span-7': 'span 7 / span 7',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
