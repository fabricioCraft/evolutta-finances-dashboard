// src/app/(auth)/register/page.tsx 
'use client'; 
import { useState } from 'react'; 
import Link from 'next/link'; 
import { supabase } from '../../../lib/supabaseClient'; 
import { motion } from 'framer-motion'; 
import Image from 'next/image'; 

export default function RegisterPage() { 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [error, setError] = useState<string | null>(null); 
  const [success, setSuccess] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false); 

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault(); 
    if (password !== confirmPassword) { 
      setError('As senhas não coincidem.'); 
      return; 
    } 
    setLoading(true); 
    setError(null); 
    setSuccess(null); 
    try { 
      const { error } = await supabase.auth.signUp({ email, password }); 
      if (error) throw error; 
      setSuccess('Conta criada! Verifique seu e-mail para ativar sua conta.'); 
    } catch (error: any) { 
      setError(error.message || 'Ocorreu um erro ao criar a conta.'); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  const logoPath = '/logo.png'; 

  return ( 
    <div className="flex min-h-screen bg-dark-bg"> 
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-dark-card p-12 text-white"> 
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}> 
          <Image src={logoPath} alt="Evolutta IA Logo" width={300} height={100} /> 
          <h1 className="mt-6 text-2xl font-semibold text-center text-gray-300">Junte-se à Evolutta e tome o controle das suas finanças.</h1> 
        </motion.div> 
      </div> 
      <div className="flex items-center justify-center w-full lg:w-1/2"> 
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full max-w-sm p-8"> 
          <h2 className="text-3xl font-bold text-white mb-8">Crie Sua Conta</h2> 
          {success ? ( 
            <div className="p-4 text-center bg-green-900/50 text-green-300 rounded-md"> 
              <p>{success}</p> 
              <Link href="/login" className="mt-4 inline-block font-bold text-brand-primary hover:underline">Voltar para o Login</Link> 
            </div> 
          ) : ( 
            <form onSubmit={handleSignUp} className="space-y-6"> 
              <div> 
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label> 
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 mt-1 bg-dark-card border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition" /> 
              </div> 
              <div> 
                <label htmlFor="password"className="block text-sm font-medium text-gray-400">Senha</label> 
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 mt-1 bg-dark-card border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition" /> 
              </div> 
              <div> 
                <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-400">Confirmar Senha</label> 
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 mt-1 bg-dark-card border border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary transition" /> 
              </div> 
              {error && <p className="text-sm text-red-500">{error}</p>} 
              <div> 
                <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-brand-primary rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-500 transition-transform transform hover:scale-105"> 
                  {loading ? 'Criando...' : 'Criar Conta'} 
                </button> 
              </div> 
            </form> 
          )} 
          {!success && ( 
            <p className="mt-6 text-sm text-center text-gray-400"> 
              Já tem uma conta?{' '} 
              <Link href="/login" className="font-medium text-brand-primary hover:underline">Faça login</Link> 
            </p> 
          )} 
        </motion.div> 
      </div> 
    </div> 
  ); 
}