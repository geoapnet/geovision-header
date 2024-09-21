/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  theme: {
    fontFamily: {
      'sans': ['"Noto Sans"', 'system-ui',],
      'serif': ['ui-serif', 'Georgia',],
      'mono': ['ui-monospace', 'SFMono-Regular',],
      'display': ['Oswald',],
      'body': ['"Open Sans"',],
    },
    extend: {
      colors: {
        primary: 'var(--geovision-header-primary)',
        secondary: 'var(--geovision-header-secondary)',
        'primary-light': 'var(--geovision-header-primary-light)',
        'secondary-light': 'var(--geovision-header-secondary-light)',
      },
    },
  },
  variants: {
    display: ['group-hover'],
  },
  plugins: [],
}
