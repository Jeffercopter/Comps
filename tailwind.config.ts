import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        phos: 'rgb(var(--phos) / <alpha-value>)',
        'phos-dim': 'rgb(var(--phos-dim) / <alpha-value>)',
        'phos-hot': 'rgb(var(--phos-hot) / <alpha-value>)',
        warn: 'rgb(var(--warn) / <alpha-value>)',
        crit: 'rgb(var(--crit) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        edge: 'rgb(var(--edge) / <alpha-value>)',
      },
      animation: {
        blink: 'blink 1.05s step-end infinite',
        flicker: 'flicker 4s linear infinite',
        sweep: 'sweep 7s linear infinite',
      },
      keyframes: {
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
        flicker: {
          '0%,100%': { opacity: '0.98' },
          '3%': { opacity: '0.86' },
          '6%': { opacity: '1' },
          '52%': { opacity: '0.94' },
          '54%': { opacity: '1' },
        },
        sweep: { '0%': { transform: 'translateY(-12%)' }, '100%': { transform: 'translateY(112%)' } },
      },
    },
  },
  plugins: [],
}

export default config
