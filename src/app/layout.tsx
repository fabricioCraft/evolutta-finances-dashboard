// src/app/layout.tsx
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <script src="https://cdn.belvo.io/belvo-widget-1-stable.js" async></script>
      </head>
      <body className="bg-dark-bg text-gray-300">
        {children}
      </body>
    </html>
  );
}