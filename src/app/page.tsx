// src/app/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '../lib/supabaseServerClient';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }
}