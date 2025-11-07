// src/components/Header.tsx 
import Link from 'next/link'; 
import Image from 'next/image'; 
import LogoutButton from './LogoutButton'; 

export default function Header() { 
  return ( 
    <header className="bg-dark-card border-b border-dark-border"> 
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center"> 
        <Link href="/dashboard"> 
          <div className="flex items-center cursor-pointer"> 
            <Image src="/logo.png" alt="Evolutta Logo" width={32} height={32} /> 
            <span className="ml-3 text-xl font-bold text-white"> 
              Evolutta Dashboard 
            </span> 
          </div> 
        </Link> 
        <div> 
          <LogoutButton /> 
        </div> 
      </nav> 
    </header> 
  ); 
}