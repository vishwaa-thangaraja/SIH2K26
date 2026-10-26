import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gov-navy': '#0B2545',
        'gov-blue': '#134074',
        'gov-gold': '#DDA74F',
        'gov-green': '#198754',
        'gov-gray': '#6C757D',
        'gov-amber': '#D97706',
        'gov-orange': '#EA580C',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
    },
  },
  plugins: [],
};
export default config;
