/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forensics: {
          bg: '#0a0e27',
          'bg-light': '#141a3a',
          cyan: '#00d4ff',
          'cyan-dark': '#0099cc',
          green: '#00ff88',
          red: '#ff3366',
          orange: '#ff9933',
        },
        braincity: {
          // Background system — organic paper
          bg: '#FFF9EC',
          'bg-end': '#FFF0D4',
          // Panel system
          card: '#FFFFFF',
          border: '#073B4C', // dark petroleum blue for borders
          // Semantic (used across all BC screens)
          primary: '#118AB2', // vivid blue
          secondary: '#06D6A0', // vivid teal
          accent: '#EF476F', // bright coral
          violet: '#9D4EDD',
          pink: '#FF70A6',
          bubble: '#FFFFFF',
          success: '#06D6A0',
          warning: '#FFD166',
          // Specific Toy Accents
          mustard: '#FFD166',
          teal: '#06D6A0',
          coral: '#EF476F',
          blue: '#118AB2',
          neon: '#FFD166',
          'neon-cyan': '#00B4D8',
          'neon-green': '#06D6A0',
          'neon-pink': '#FF70A6',
          'neon-purple': '#9D4EDD',
          text: '#073B4C',
          dim: '#4b5563',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        bangers: ['Bangers', 'cursive'],
        nunito: ['Nunito', 'sans-serif'],
        fredoka: ['Fredoka', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        scanline: 'scanline 8s linear infinite',
        'neon-flicker': 'neonFlicker 3s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.6' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.4' },
          '97%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
