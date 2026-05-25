/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#2563EB',
        'brand-light': '#EFF6FF',
        'sticker-missing': '#FEF9C3',
        'sticker-have': '#DBEAFE',
        'sticker-swap': '#DCFCE7',
      }
    }
  },
  plugins: []
}
