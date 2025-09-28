/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // True Dark Mode Palette
        dark: {
          50: '#18181b',
          100: '#27272a',
          200: '#3f3f46',
          300: '#52525b',
          400: '#71717a',
          500: '#a1a1aa',
          600: '#d4d4d8',
          700: '#e4e4e7',
          800: '#f4f4f5',
          900: '#fafafa',
          // True dark backgrounds
          bg: '#0a0a0a',
          card: '#1a1a1a',
          surface: '#262626',
          border: '#525252',
        },
        // Subtle neon accent colors
        neon: {
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          cyan: '#06b6d4',
          orange: '#f97316',
        }
      },
      backgroundImage: {
        'dark-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%)',
        'dark-card': 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)',
        'neon-gradient': 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #f472b6 100%)',
        'dark-nav': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
        'neon-md': '0 0 20px rgba(0, 212, 255, 0.4)',
        'neon-lg': '0 0 30px rgba(0, 212, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.4)',
        'neon-pink': '0 0 20px rgba(244, 114, 182, 0.4)',
        'dark-brutal': '0 8px 32px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}