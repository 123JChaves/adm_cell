'use client'

import { useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { Power, ChevronDown } from 'lucide-react';

const Menu = () => {
    const [admin, setAdmin] = useState(false);
    const [usuario, setUsuario] = useState(false);
    const [cliente, setCliente] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('userRole');
        localStorage.removeItem('users');
        router.push('/login');
    };

    return (
        <div className="bg-blue-700 text-white p-4 w-full relative z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                
                <div className="flex items-center">
                    <h2 className="text-xl font-bold mr-10">
                        <Link href="/home" className="hover:text-blue-200 transition-colors">
                            Adm Loja Cell
                        </Link>
                    </h2>
                    
                    <ul className="flex space-x-6 items-center">
                        {/* Dropdown Administrador */}
                        <li className="relative" onMouseEnter={() => setAdmin(true)} onMouseLeave={() => setAdmin(false)}>
                            <button className="flex items-center hover:text-blue-200 transition-colors py-2 font-medium">
                                Administrador
                                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${admin ? 'rotate-180' : ''}`} />
                            </button>
                            {admin && (
                                <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                    <Link href="/admin/cadastro" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Cadastrar</Link>
                                    <Link href="/admin/lista" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Listar</Link>
                                </div>
                            )}
                        </li>

                        {/* Dropdown Usuário */}
                        <li className="relative" onMouseEnter={() => setUsuario(true)} onMouseLeave={() => setUsuario(false)}>
                            <button className="flex items-center hover:text-blue-200 transition-colors py-2 font-medium">
                                Usuário
                                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${usuario ? 'rotate-180' : ''}`} />
                            </button>
                            {usuario && (
                                <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                    <Link href="/usuario/cadastro" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Cadastrar</Link>
                                    <Link href="/usuario/lista" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Listar</Link>
                                </div>
                            )}
                        </li>

                        {/* Dropdown Cliente */}
                        <li className="relative" onMouseEnter={() => setCliente(true)} onMouseLeave={() => setCliente(false)}>
                            <button className="flex items-center hover:text-blue-200 transition-colors py-2 font-medium">
                                Cliente
                                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${cliente ? 'rotate-180' : ''}`} />
                            </button>
                            {cliente && (
                                <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                    <Link href="/cliente/cadastro" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Cadastrar</Link>
                                    <Link href="/cliente/lista" className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-700">Listar</Link>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>

                {/* Botão de Logout Redondo e Vermelho */}
                <button 
                    onClick={handleLogout}
                    title="Sair do Sistema"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200 active:scale-90 border border-red-500"
                >
                    <Power className="w-5 h-5" />
                </button>

            </div>
        </div>
    );
};

export default Menu;