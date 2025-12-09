/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Matrix Dark Theme
        matrix: {
          black: '#000000',
          dark: '#0a0a0a',
          darker: '#050505',
          gray: '#1a1a1a',
          'gray-light': '#2a2a2a',
          white: '#ffffff',
          accent: '#a855f7', // Purple
          'accent-dark': '#9333ea',
          'accent-light': '#c084fc',
          blue: '#0ea5e9',
          'blue-dark': '#0284c7',
          red: '#ef4444',
          'red-dark': '#dc2626',
          yellow: '#f59e0b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-matrix': 'linear-gradient(180deg, #000000 0%, #0a0a0a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(0, 255, 65, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
      },
      boxShadow: {
        'matrix': '0 0 20px rgba(0, 255, 65, 0.2)',
        'matrix-lg': '0 0 40px rgba(0, 255, 65, 0.3)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 30px rgba(168, 85, 247, 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}