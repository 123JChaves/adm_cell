'use client'

import { Boxes, HelpCircle, Home, Settings, SmartphoneCharging, Van } from "lucide-react";
import Link from "next/link";

const Sidebar = () => {
    const menuItems = [
        {name: 'Home', href: "/", icon: <Home size={20}/>},
        {name: 'Produtos', href: "/produto/cadastro", icon: <SmartphoneCharging size={20}/>},
        {name: 'Categorias', href: "/categoria/cadastro", icon: <Boxes size={20}/>},
        {name: 'Fornecedores', href: "/fornecedor/lista", icon: <Van size={20} />},
        {name: 'Configurações', href: "/configuracoes", icon: <Settings size={20} />}
    ]
    return (
            <aside className="w-64 h-screen bg-gray-50 border-r border-gray-200 fixed left-0 top-0 pt-20 hidden md:block">
                <div className="flex flex-col h-full justify-between p-4">
                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-all duration-200 group"
                            >
                                <span className="text-gray-400 group-hover:text-purple-500">{item.icon}</span>
                                <span className="font-medium">{item.name}</span>        
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto border-t border-gray-200 pt-4">
                    <Link 
                        href="/contato/centralDeAjuda"
                        className="flex items-center space-x-3 p-3 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                        <HelpCircle size={20} />
                        <span>Suporte</span>
                    </Link>
                </div>
                </div>
            </aside>
    );
}

export default Sidebar;