/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F5F0E8',
        parchment: '#EDE5D0',
        aged: '#D9CDB4',
        tan: '#B8A98A',
        umber: '#7A6A52',
        espresso: '#3D2E1E',
        bark: '#2A1E12',
        rust: '#8B4A2F',
        gold: '#C4943A',
        sage: '#5A6B50',
        'dusty-rose': '#9B6B6B',
        mist: '#8A9BA8',
      },
      fontFamily: {
        sans: ['Jost', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
