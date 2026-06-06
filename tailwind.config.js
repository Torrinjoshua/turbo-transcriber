/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#fdf3ef',
          100: '#fae5d8',
          200: '#f5c9b0',
          300: '#eca47e',
          400: '#e17a4a',
          500: '#c1440e',
          600: '#a8390c',
          700: '#8c2f0a',
          800: '#732809',
          900: '#5e2207',
        },
        forest: {
          50: '#f0f9f4',
          100: '#d9f0e3',
          200: '#b6e0cb',
          300: '#85c9a8',
          400: '#4dab7e',
          500: '#2d8e61',
          600: '#1b4332',
          700: '#17392b',
          800: '#143024',
          900: '#11271e',
        },
        cream: '#fdf6e3',
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',
          600: '#b8860b',
        },
        ink: '#2d1b0e',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'kente-sm': `repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 8px,
          rgba(193,68,14,0.07) 8px,
          rgba(193,68,14,0.07) 9px
        ),
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 8px,
          rgba(27,67,50,0.07) 8px,
          rgba(27,67,50,0.07) 9px
        )`,
      },
      animation: {
        'flip-in': 'flipIn 0.35s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        flipIn: {
          '0%': { transform: 'rotateY(90deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
