/** @type {import('tailwindcss').Config} */
// Design tokens live as CSS variables in src/styles/index.css and are surfaced
// to Tailwind here. Re-skin the whole app by editing the :root block in that
// file — everything (colors, fitment-status hues, cost glyphs) keys off these.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--color-surface-2) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--color-ink-muted) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        'brand-ink': 'rgb(var(--color-brand-ink) / <alpha-value>)',
        // Fitment status palette (mirrors FitStatus union in lib/fitment.ts)
        'fit-direct': 'rgb(var(--color-fit-direct) / <alpha-value>)',
        'fit-spacer': 'rgb(var(--color-fit-spacer) / <alpha-value>)',
        'fit-mod': 'rgb(var(--color-fit-mod) / <alpha-value>)',
        'fit-check': 'rgb(var(--color-fit-check) / <alpha-value>)',
        'fit-incompatible': 'rgb(var(--color-fit-incompatible) / <alpha-value>)',
        'fit-unknown': 'rgb(var(--color-fit-unknown) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: 'var(--radius-card)',
      },
    },
  },
  plugins: [],
};
