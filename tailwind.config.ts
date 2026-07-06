import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: '#D4AF37',
          navy: '#0D1B2A',
          graphite: '#1B1F23',
          silver: '#A7A9AC',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Michroma', 'Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
