// @ts-nocheck
 // src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      {/* Ativa o Dark Mode */}
      <head>
        {/* Importa a fonte Poppins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Script do Widget Belvo (versão estável) */}
        <script src="https://cdn.belvo.io/belvo-widget-1-stable.js" async></script>
      </head>
      <body className={`${inter.className} bg-dark-bg text-gray-300`}>
        {children}
      </body>
    </html>
  );
}