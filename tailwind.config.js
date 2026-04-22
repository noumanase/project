/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Add your design tokens here.
      // Keep colours as CSS variables so they work with dark mode.
      colors: {
        brand: {
          50:  'var(--brand-50)',
          100: 'var(--brand-100)',
          500: 'var(--brand-500)',
          600: 'var(--brand-600)',
          900: 'var(--brand-900)',
        },
      },
    },
  },
  plugins: [],
}
