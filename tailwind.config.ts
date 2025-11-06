// @ts-nocheck
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Habilita o dark mode
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Adicione o diretório src
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Define Poppins como a fonte padrão
      },
      colors: {
        'brand-dark': '#1a2e35',
        'brand-primary': '#0070f3',
        'brand-light': '#f9fafb',
        'dark-bg': '#111827', // Fundo principal do dark mode
        'dark-card': '#1F2937', // Fundo dos cards
        'dark-border': '#374151', // Cor da borda
        'accent-green': '#10B981', // Para receitas
        'accent-red': '#EF4444', // Para despesas
        'accent-blue': '#3B82F6', // Para saldo
      },
    },
  },
  plugins: [],
};

export default config;