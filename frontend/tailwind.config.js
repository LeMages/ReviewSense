/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        positive: 'hsl(var(--positive))',
        negative: 'hsl(var(--negative))',
        neutral: 'hsl(var(--neutral))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        display: ['"Geist"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        'mesh-drift-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(5%, -3%) scale(1.02)' },
          '66%': { transform: 'translate(-3%, 4%) scale(0.98)' },
        },
        'mesh-drift-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-4%, 2%) scale(1.01)' },
          '66%': { transform: 'translate(3%, -4%) scale(0.99)' },
        },
        'mesh-drift-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(2%, 3%) scale(1.015)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'mesh-drift-1': 'mesh-drift-1 30s ease-in-out infinite',
        'mesh-drift-2': 'mesh-drift-2 40s ease-in-out infinite',
        'mesh-drift-3': 'mesh-drift-3 25s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
