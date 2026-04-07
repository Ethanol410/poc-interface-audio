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
          // Background system — city night dark
          bg: '#08081e',
          'bg-end': '#0c0c28',
          // Panel system
          card: '#0e0e2c',
          border: '#1a1a48',
          // Semantic (used across all BC screens)
          primary: '#00c8ff',
          secondary: '#84cc16',
          accent: '#ff5533',
          violet: '#a855f7',
          pink: '#ff40a0',
          bubble: '#12123a',
          success: '#00e87a',
          warning: '#ffbb00',
          // Neon accents (workspace)
          neon: '#f0e500',
          'neon-cyan': '#00e5ff',
          'neon-green': '#3dff85',
          'neon-pink': '#ff3fa4',
          'neon-purple': '#a855f7',
          text: '#c8c8ff',
          dim: '#44447a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        bangers: ['Bangers', 'cursive'],
        nunito: ['Nunito', 'sans-serif'],
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
