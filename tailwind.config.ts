import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'black': '#000000',
        'white': '#FFFFFF',
        'gray': {
          'light': '#F2F2F7',
          'medium': '#C7C7CC',
          'dark': '#8E8E93',
        },
        'gold': '#cba967',
        'gold-dark': '#b99a58',
        'blue': '#007AFF',
        'green': '#34C759',
        'purple': '#AF52DE',
      },
      fontSize: {
        'h1': '32px',
        'h2': '28px',
        'h3': '24px',
        'body': '16px',
        'body-sm': '14px',
        'caption': '12px',
      },
      borderRadius: {
        'standard': '8px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'lg': '0 6px 16px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config 