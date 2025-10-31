const path = require('path');

const withOpacity = (variable) => {
  return ({ opacityValue }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variable}))`;
    }

    return `rgb(var(${variable}) / ${opacityValue})`;
  };
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src/**/*.{html,js,svelte,ts}')
  ],
  theme: {
    extend: {
      colors: {
        surface: withOpacity('--gn-color-surface'),
        'surface-elevated': withOpacity('--gn-color-surface-elevated'),
        'surface-inset': withOpacity('--gn-color-surface-inset'),
        overlay: withOpacity('--gn-color-overlay'),
        text: withOpacity('--gn-color-text'),
        'text-soft': withOpacity('--gn-color-text-soft'),
        border: withOpacity('--gn-color-border'),
        'border-strong': withOpacity('--gn-color-border-strong'),
        accent: withOpacity('--gn-color-accent'),
        'accent-strong': withOpacity('--gn-color-accent-strong'),
        'accent-soft': withOpacity('--gn-color-accent-soft'),
        'accent-contrast': withOpacity('--gn-color-accent-contrast'),
        success: withOpacity('--gn-color-success'),
        warning: withOpacity('--gn-color-warning'),
        critical: withOpacity('--gn-color-critical')
      },
      spacing: {
        '0': 'var(--gn-space-0)',
        '1': 'var(--gn-space-1)',
        '2': 'var(--gn-space-2)',
        '3': 'var(--gn-space-3)',
        '4': 'var(--gn-space-4)',
        '5': 'var(--gn-space-5)',
        '6': 'var(--gn-space-6)',
        '7': 'var(--gn-space-7)',
        '8': 'var(--gn-space-8)',
        '9': 'var(--gn-space-9)',
        '10': 'var(--gn-space-10)'
      },
      borderRadius: {
        sharp: 'var(--gn-radius-sharp)',
        soft: 'var(--gn-radius-soft)',
        medium: 'var(--gn-radius-medium)',
        rounded: 'var(--gn-radius-rounded)',
        pill: 'var(--gn-radius-pill)'
      },
      boxShadow: {
        window: 'var(--gn-shadow-window)',
        'window-active': 'var(--gn-shadow-window-active)',
        button: 'var(--gn-shadow-button)',
        menu: 'var(--gn-shadow-menu)',
        tooltip: 'var(--gn-shadow-tooltip)'
      },
      zIndex: {
        taskbar: 'var(--gn-z-taskbar)',
        window: 'var(--gn-z-window)',
        modal: 'var(--gn-z-modal)',
        popover: 'var(--gn-z-popover)',
        tooltip: 'var(--gn-z-tooltip)'
      },
      transitionDuration: {
        instant: 'var(--gn-motion-duration-instant)',
        fast: 'var(--gn-motion-duration-fast)',
        base: 'var(--gn-motion-duration-base)',
        slow: 'var(--gn-motion-duration-slow)'
      },
      transitionTimingFunction: {
        standard: 'var(--gn-motion-ease-standard)',
        snappy: 'var(--gn-motion-ease-snappy)',
        entrance: 'var(--gn-motion-ease-entrance)'
      }
    }
  },
  plugins: []
};
