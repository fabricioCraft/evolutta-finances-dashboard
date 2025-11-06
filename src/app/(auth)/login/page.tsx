// src/app/(auth)/login/page.tsx 
'use client'; 
import { useState } from 'react'; 
import { useRouter } from 'next/navigation'; 
import Link from 'next/link'; 
import { supabase } from '../../../lib/supabaseClient'; 
import { motion } from 'framer-motion'; 
import Image from 'next/image'; 

export default function LoginPage() { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [error, setError] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false); 
  const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    setLoading(true); 
    setError(null); 
    try { 
      const { error } = await supabase.auth.signInWithPassword({ email, password }); 
      if (error) throw error; 
      router.push('/dashboard'); 
      router.refresh(); 
    } catch (error: any) { 
      setError(error.message || 'Ocorreu um erro ao tentar fazer login.'); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const logoPath = '/logo.png'; // Garanta que a logo está em /public/logo.png 

  return ( 
    <div className="relative flex min-h-screen font-sans overflow-hidden"> 
      {/* BACKGROUND TECNOLÓGICO COM GRADIENTES SUAVES */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_30%_at_10%_10%,rgba(59,130,246,0.15),transparent),radial-gradient(30%_40%_at_90%_10%,rgba(26,46,53,0.35),transparent)]" />
      {/* PAINEL DA MARCA (ESQUERDA) */} 
      <div className="hidden lg:flex relative flex-col items-center justify-center w-1/2 p-12 text-white shadow-2xl overflow-hidden"> 
        {/* Fundo degradê com tons da marca + brilho sutil */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-dark-blue via-[#0f172a] to-[#0b1220]" />
        {/* Toques neon e shapes tech com motion */}
        <motion.div 
          aria-hidden 
          className="absolute -z-10 blur-xl opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2 }}
          style={{
            background:
              'radial-gradient(30% 30% at 20% 20%, rgba(59,130,246,0.35), transparent),' +
              'radial-gradient(25% 25% at 80% 20%, rgba(59,130,246,0.25), transparent),' +
              'radial-gradient(20% 20% at 50% 80%, rgba(26,46,53,0.45), transparent)'
          }}
        >
          <div className="h-[120vh] w-[120vw]" />
        </motion.div>
        {/* Grid tech leve */}
        <div className="absolute inset-0 -z-10 opacity-[0.12]"
             style={{ backgroundImage: 'linear-gradient(#3b82f633 1px, transparent 1px), linear-gradient(90deg, #3b82f633 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8 }} 
          className="text-center" 
        > 
          {/* Moldura neon sutil ao redor da logo */}
          <div className="relative inline-block">
            <motion.div 
              className="absolute -inset-4 rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1.2 }}
              style={{
                boxShadow: '0 0 40px 6px rgba(59,130,246,0.55), inset 0 0 20px rgba(59,130,246,0.35)'
              }}
            />
            <Image 
              src={logoPath} 
              alt="Evolutta IA Logo" 
              width={220} 
              height={80} 
              sizes="(min-width: 1024px) 220px, 160px" 
              priority 
              className="relative z-10 rounded-xl" 
            /> 
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-gray-300 tracking-tight"> 
            O Dashboard Financeiro Inteligente 
          </h1> 
          {/* Linha acentuada com efeito neon */}
          <motion.div 
            className="mt-6 h-px w-2/3 bg-gradient-to-r from-transparent via-brand-primary to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </motion.div> 
      </div> 

      {/* PAINEL DO FORMULÁRIO (DIREITA) */} 
      <div className="flex items-center justify-center w-full lg:w-1/2 bg-dark-bg"> 
        <motion.div 
          initial={{ opacity: 0, x: 50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8, delay: 0.2 }} 
          className="w-full max-w-sm p-8 rounded-2xl shadow-2xl bg-dark-card/70 ring-1 ring-dark-border/50 backdrop-blur-lg" 
        > 
          <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Acesse sua Conta</h2> 
          <form onSubmit={handleLogin} className="space-y-6"> 
            <div> 
              <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label> 
              <input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 mt-1 bg-dark-card border border-dark-border rounded-lg shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition" 
              /> 
            </div> 
            <div> 
              <label htmlFor="password" className="block text-sm font-medium text-gray-400">Senha</label> 
              <input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="w-full px-4 py-3 mt-1 bg-dark-card border border-dark-border rounded-lg shadow-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary transition" 
              /> 
            </div> 
            {error && <p className="text-sm text-red-500">{error}</p>} 
            <div> 
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full px-4 py-3 font-semibold text-white bg-brand-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg focus:ring-brand-primary disabled:bg-gray-500 transition-all duration-300 transform hover:scale-105 active:scale-98" 
              > 
                {loading ? 'Entrando...' : 'Entrar'} 
              </button> 
            </div> 
          </form> 
          <p className="mt-8 text-sm text-center text-gray-400"> 
            Não tem uma conta?{' '} 
            <Link href="/register" className="font-medium text-brand-primary hover:underline"> 
              Crie uma aqui 
            </Link> 
          </p> 
        </motion.div> 
      </div> 
    </div> 
  ); 
}