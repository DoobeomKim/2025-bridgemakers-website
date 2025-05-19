/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Apple HIG 색상 시스템
        'apple-blue': '#007AFF',
        'apple-indigo': '#5856D6',
        'apple-purple': '#AF52DE',
        'apple-pink': '#FF2D55',
        'apple-red': '#FF3B30',
        'apple-orange': '#FF9500',
        'apple-yellow': '#FFCC00',
        'apple-green': '#34C759',
        'apple-teal': '#5AC8FA',
        'apple-gray': {
          1: '#8E8E93',
          2: '#AEAEB2',
          3: '#C7C7CC',
          4: '#D1D1D6',
          5: '#E5E5EA',
          6: '#F2F2F7',
        },
        'bm-dark': '#2D2D2D', // 브릿지메이커스 어두운 배경색
        'bm-accent': '#cba967', // 브릿지메이커스 포인트 색상
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'Inter', 'sans-serif'],
        'sf-pro-text': ['SF Pro Text', 'Inter', 'sans-serif'],
        'roboto': ['var(--font-roboto)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'apple': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'apple-md': '0 6px 16px -1px rgba(0, 0, 0, 0.1), 0 2px 8px -1px rgba(0, 0, 0, 0.06)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out forwards'
      }
    },
  },
  plugins: [],
} 