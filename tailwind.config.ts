import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0FB9B1',
          hover: '#0A8F8B',
          foreground: '#FAFAFA',
        },
        accent: {
          DEFAULT: '#F79621',
          foreground: '#1D1D1D',
        },
        snow: '#FAFAFA',
        carbon: '#1D1D1D',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
