/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        // Per-pillar identity — used consistently in cards, grid and radar
        physical: '#2DD4BF',
        nutrition: '#FBBF24',
        cognitive: '#60A5FA',
        mental: '#FB7185',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.15), 0 8px 40px -12px rgba(45,212,191,0.25)',
      },
      keyframes: {
        'ring-draw': {
          from: { strokeDashoffset: 'var(--circumference)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(6px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'ring-draw': 'ring-draw 1.1s cubic-bezier(0.22,1,0.36,1) forwards',
        pop: 'pop 220ms ease-out',
        'fade-up': 'fade-up 320ms ease-out both',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    logs: false,
    darkTheme: 'protocol',
    themes: [
      {
        protocol: {
          primary: '#2DD4BF',
          'primary-content': '#04211D',
          secondary: '#FBBF24',
          'secondary-content': '#241900',
          accent: '#60A5FA',
          'accent-content': '#04121F',
          neutral: '#181B21',
          'neutral-content': '#C7CDD6',
          'base-100': '#0B0D10',
          'base-200': '#111318',
          'base-300': '#191C22',
          'base-content': '#E6E9EE',
          info: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#FB7185',
          '--rounded-box': '1.25rem',
          '--rounded-btn': '0.8rem',
          '--rounded-badge': '0.6rem',
          '--animation-btn': '0.2s',
          '--border-btn': '1px',
        },
      },
    ],
  },
};
