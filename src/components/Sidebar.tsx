'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Landmark, Settings } from 'lucide-react';
import Image from 'next/image';
import LogoutButton from '@/components/LogoutButton';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Contas', icon: Landmark },
  // { href: '/settings', label: 'Configurações', icon: Settings }, // Para o futuro
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-dark-card border-r border-dark-border p-6 flex flex-col">
      <div className="flex items-center mb-10">
        <Image src="/logo.png" alt="Evolutta Logo" width={32} height={32} />
        <span className="ml-3 text-xl font-bold text-white">Evolutta</span>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-brand-primary text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className="mr-3" />
                  <span className="font-semibold">{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-6 border-t border-dark-border">
        <LogoutButton />
      </div>
    </aside>
  );
}