// tailwind.config.ts 
import type { Config } from 'tailwindcss'; 

const config: Config = { 
  darkMode: 'class', 
  content: [ 
    './pages/**/*.{js,ts,jsx,tsx,mdx}', 
    './components/**/*.{js,ts,jsx,tsx,mdx}', 
    './app/**/*.{js,ts,jsx,tsx,mdx}', 
    './src/**/*.{js,ts,jsx,tsx,mdx}', 
  ], 
  theme: { 
    extend: { 
      fontFamily: { 
        sans: ['Poppins', 'sans-serif'], 
      }, 
      colors: { 
        'brand-dark-blue': '#1a2e35', // Cor principal da logo 
        'brand-primary': '#3b82f6',   // Um azul vibrante para botões e destaques 
        'dark-bg': '#111827',         // Fundo da página (contraste sutil) 
        'dark-card': '#1F2937',        // Fundo para inputs e painéis 
        'dark-border': '#374151',      // Cor da borda 
      }, 
    }, 
  }, 
  plugins: [], 
}; 
export default config;