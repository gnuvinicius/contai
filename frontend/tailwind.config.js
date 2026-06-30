/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1320px',
      },
    },
    extend: {
      colors: {
        border: '#D9E1EC',
        input: '#D9E1EC',
        ring: '#93A7BD',
        background: '#F4F8FC',
        foreground: '#0F172A',
        primary: {
          DEFAULT: '#0A66C2',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EAF2FB',
          foreground: '#123A61',
        },
        muted: {
          DEFAULT: '#EEF3F9',
          foreground: '#51657A',
        },
        accent: {
          DEFAULT: '#DCE9F8',
          foreground: '#143454',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
        },
      },
      borderRadius: {
        lg: '0.9rem',
        md: '0.7rem',
        sm: '0.5rem',
      },
      boxShadow: {
        soft: '0 10px 30px -15px rgba(13, 42, 79, 0.22)',
      },
      fontFamily: {
        sans: ['Manrope', 'Nunito Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.45s ease-out',
      },
    },
  },
  plugins: [],
}
