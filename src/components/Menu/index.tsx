'use client'

import { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Power, ChevronDown, LayoutDashboard, ShieldCheck, Users, UserCircle } from 'lucide-react';

const Menu = () => {
    const [dropdownAtivo, setDropdownAtivo] = useState<string | null>(null);
    const router = useRouter();

    const realizarLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userRole');
        localStorage.removeItem('users');
        router.push('/login');
    };

    const fecharDropdown = () => setDropdownAtivo(null);

    return (
        <nav className="bg-slate-900 text-white w-full relative z-50 shadow-lg border-b border-indigo-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-18 py-3">
                    
                    <div className="flex items-center gap-10">

                        <Link href="/home" className="flex items-center gap-3 group">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-500 transition-all">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-black tracking-tight text-xl uppercase">
                                Adm Loja Cell
                            </span>
                        </Link>
                        
                        <ul className="hidden md:flex items-center gap-1">

                            {[
                                { titulo: "Administrador", rota: "admin", icone: ShieldCheck },
                                { titulo: "Usuário", rota: "usuario", icone: Users },
                                { titulo: "Cliente", rota: "cliente", icone: UserCircle },
                            ].map((itemIndividual) => (
                                <li 
                                    key={itemIndividual.titulo}
                                    className="relative" 
                                    onMouseEnter={() => setDropdownAtivo(itemIndividual.titulo)} 
                                    onMouseLeave={fecharDropdown}
                                >
                                    <button 
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                            dropdownAtivo === itemIndividual.titulo 
                                            ? 'bg-white/10 text-indigo-400' 
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        <itemIndividual.icone className="w-4 h-4" />
                                        {itemIndividual.titulo}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${dropdownAtivo === itemIndividual.titulo ? 'rotate-180' : ''}`} />
                                    </button>
                                    

                                    {dropdownAtivo === itemIndividual.titulo && (
                                        /* A classe 'before' abaixo cria a área de conexão invisível */
                                        <div className="absolute left-0 mt-1 w-52 bg-white rounded-2xl shadow-2xl py-2 border border-slate-100 animate-in fade-in slide-in-from-top-2 before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:content-['']">
                                            <Link 
                                                href={`/${itemIndividual.rota}/cadastro`} 
                                                className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                onClick={fecharDropdown}
                                            >
                                                Cadastrar Novo
                                            </Link>
                                            <Link 
                                                href={`/${itemIndividual.rota}/lista`} 
                                                className="block px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                onClick={fecharDropdown}
                                            >
                                                Listar Registros
                                            </Link>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-[1px] bg-slate-700 hidden sm:block"></div>
                        <button 
                            onClick={realizarLogout}
                            title="Encerrar Sessão"
                            className="group flex items-center justify-center w-11 h-11 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 transition-all duration-300 active:scale-90"
                        >
                            <Power className="w-5 h-5" />
                        </button>
                    </div>

                </div>
            </div>
        </nav>
    );

};

export default Menu;