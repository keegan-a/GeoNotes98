const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        desk: {
          base: '#f8f4e3',
          ink: '#1f1b2c'
        },
        accent: {
          soft: '#9ccfd8',
          pop: '#d182b0'
        },
        chrome: {
          light: '#fefcf7',
          dark: '#3d3a5a'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', ...defaultTheme.fontFamily.sans],
        display: ['"DM Serif Display"', ...defaultTheme.fontFamily.serif],
        mono: ['"Fira Code"', ...defaultTheme.fontFamily.mono]
      },
      boxShadow: {
        window: '0 0 0 1px rgba(61,58,90,0.4), 4px 4px 0 rgba(61,58,90,0.18)'
      },
      animation: {
        drift: 'drift 14s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite'
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-0.5deg)' },
          '50%': { transform: 'translate(4px, -3px) rotate(0.5deg)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(156, 207, 216, 0.0)' },
          '50%': { boxShadow: '0 0 12px rgba(156, 207, 216, 0.35)' }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
