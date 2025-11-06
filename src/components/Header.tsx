// src/components/Header.tsx
export default function Header() {
  return (
    <header className="w-full bg-dark-card border-b border-dark-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-accent-blue" />
          <h1 className="text-gray-200 font-semibold">Evolutta Finances</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm text-gray-400">
          <a href="/dashboard" className="hover:text-gray-200">Dashboard</a>
          <a href="/login" className="hover:text-gray-200">Sair</a>
        </nav>
      </div>
    </header>
  );
}