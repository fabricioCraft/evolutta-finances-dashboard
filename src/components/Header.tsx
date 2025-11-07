// src/components/Header.tsx 
import Link from 'next/link'; 
import Image from 'next/image'; 
import LogoutButton from './LogoutButton'; 
import { PlusCircle } from 'lucide-react'; 

export default function Header() { 
  return ( 
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-50"> 
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center"> 
        <Link href="/dashboard"> 
          <div className="flex items-center cursor-pointer"> 
            <Image src="/logo.png" alt="Evolutta Logo" width={32} height={32} /> 
            <span className="ml-3 text-xl font-bold text-white">Evolutta Dashboard</span> 
          </div> 
        </Link> 
        <div className="flex items-center space-x-4"> 
          <button className="flex items-center px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all"> 
            <PlusCircle size={18} className="mr-2" /> 
            Adicionar Transação 
          </button> 
          <LogoutButton /> 
        </div> 
      </nav> 
    </header> 
  ); 
}