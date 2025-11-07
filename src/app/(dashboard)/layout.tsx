// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabaseServerClient';
import Header from '../../components/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Se NÃO houver sessão, redireciona para o login
  if (!session) {
    redirect('/login');
  }

  // Se houver sessão, renderiza o layout e a página
  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main>{children}</main>
    </div>
  );
}