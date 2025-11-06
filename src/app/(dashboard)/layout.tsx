// src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../../lib/supabaseServerClient';
import Header from '../../components/Header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <main>{children}</main>
    </div>
  );
}