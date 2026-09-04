/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          glow: '#0284c7',
          cyan: '#0284c7',
          emerald: '#059669',
          amber: '#d97706',
          rose: '#e11d48',
          purple: '#7c3aed'
        }
      },
      boxShadow: {
        'card-3d': '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 25px -5px rgba(15, 23, 42, 0.04), 0 8px 10px -6px rgba(15, 23, 42, 0.03)',
        'card-3d-hover': '0 20px 30px -10px rgba(15, 23, 42, 0.08), 0 10px 15px -3px rgba(15, 23, 42, 0.04)',
        'elevated-btn': '0 4px 12px rgba(2, 132, 199, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
        'soft-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(2, 132, 199, 0.2), 0 0 10px rgba(2, 132, 199, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(2, 132, 199, 0.4), 0 0 25px rgba(2, 132, 199, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}

