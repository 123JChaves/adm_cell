'use client'

import { useState } from 'react';
import Link from 'next/link';

const Menu = () => {

    const [admin, setAdmin] = useState(false);
    const [usuario, setUsuario] = useState(false);
    const [cliente, setCliente] = useState(false);

    return (
        <div className="bg-blue-700 text-white p-4 w-full relative z-50 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center">
                <h2 className="text-xl font-bold">
                    <Link href="/">Adm Loja Cell</Link>
                </h2>
                <ul className="flex space-x-8 ml-10 items-center">
                    <li
                        className = "relative"
                        onMouseEnter = {() => setAdmin(true)}
                        onMouseLeave = {() => setAdmin(false)}
                        >
                        <button className = "flex items-center hover:text-gray-300 focus-outline-one transition-colors py-2">
                            Administrador
                            <svg className = {`ml-4 w-4 h-4 transition-transform ${admin ? 'rotate-180' : ''}`} fill = "none" stroke = "currentColor" viewBox = "0 0 24 24">
                                <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {admin && (
                            <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                <Link href="/admin/cadastro" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Cadastrar
                                </Link>
                                <Link href="/admin/lista" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Listar
                                </Link>
                            </div>
                        )}
                        </li>
                    <li
                        className = "relative"
                        onMouseEnter = {() => setUsuario(true)}
                        onMouseLeave = {() => setUsuario(false)}
                        >
                        <button className = "flex items-center hover:text-gray-300 focus-outline-one transition-colors py-2">
                            Usuário
                            <svg className = {`ml-4 w-4 h-4 transition-transform ${usuario ? 'rotate-180' : ''}`} fill = "none" stroke = "currentColor" viewBox = "0 0 24 24">
                                <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {usuario && (
                            <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                <Link href="/usuario/cadastro" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Cadastrar
                                </Link>
                                <Link href="/usuario/lista" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Listar
                                </Link>
                            </div>
                        )}
                        </li>
                        <li
                        className = "relative"
                        onMouseEnter = {() => setCliente(true)}
                        onMouseLeave = {() => setCliente(false)}
                        >
                        <button className = "flex items-center hover:text-gray-300 focus-outline-one transition-colors py-2">
                            Cliente
                            <svg className = {`ml-4 w-4 h-4 transition-transform ${cliente ? 'rotate-180' : ''}`} fill = "none" stroke = "currentColor" viewBox = "0 0 24 24">
                                <path strokeLinecap = "round" strokeLinejoin = "round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {cliente && (
                            <div className="absolute left-0 mt-0 w-48 bg-white text-black rounded-md shadow-xl py-2 border border-gray-200">
                                <Link href="/cliente/cadastro" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Cadastrar
                                </Link>
                                <Link href="/cliente/lista" className="block px-4 py-2 hover:bg-blue-100 hover:text-blue-500 transition-colors">
                                        Listar
                                </Link>
                            </div>
                        )}
                        </li>
                </ul>
            </div>
        </div>
    )

}

export default Menu;