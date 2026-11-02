/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#060709',
        obsidian: '#0A0C10',
        graphite: '#0F131A',
        frost: '#F1F5F9',
        borderGlass: '#1A1F2C',
        mint: {
          DEFAULT: '#00FFA3',
          glow: 'rgba(0, 255, 163, 0.35)',
          subtle: 'rgba(0, 255, 163, 0.12)',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          glow: 'rgba(0, 229, 255, 0.35)',
          subtle: 'rgba(0, 229, 255, 0.12)',
        },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        sans: ['Space Grotesk', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '24px',
      },
    },
  },
  plugins: [],
};
