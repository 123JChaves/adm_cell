'use client'

import { 
    Boxes, 
    HelpCircle, 
    Home, 
    Settings, 
    SmartphoneCharging, 
    Factory, 
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BarraLateral = () => {
    const caminhoAtual = usePathname();

    const itensDoMenu = [
        { nome: 'Dashboard', rota: "/home", icone: Home },
        { nome: 'Produtos', rota: "/produto/cadastro", icone: SmartphoneCharging },
        { nome: 'Categorias', rota: "/categoria/cadastro", icone: Boxes },
        { nome: 'Marcas', rota: "/marca/cadastro", icone: Factory },
        { nome: 'Fornecedores', rota: "/fornecedor/cadastro", icone: Users },
        { nome: 'Configurações', rota: "/configuracoes", icone: Settings }
    ];

    return (
        <aside className="w-64 h-screen bg-slate-900 border-r border-white/5 fixed left-0 top-0 pt-24 hidden md:block z-40 shadow-2xl">
            <div className="flex flex-col h-full justify-between p-4">
                <nav className="space-y-1.5">
                    {itensDoMenu.map((itemIndividual) => {
                        const estaAtivo = caminhoAtual === itemIndividual.rota;
                        
                        return (
                            <Link
                                key={itemIndividual.nome}
                                href={itemIndividual.rota}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group relative ${
                                    estaAtivo 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <itemIndividual.icone 
                                    size={20} 
                                    className={`${estaAtivo ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`} 
                                />
                                <span>{itemIndividual.nome}</span>

                                {estaAtivo && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-200 shadow-[0_0_8px_rgba(199,210,254,0.8)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-white/10 pt-4 mb-10">
                    <Link 
                        href="/suporte"
                        className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-400 hover:bg-white/5 rounded-xl transition-all font-bold text-sm group"
                    >
                        <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>Centro de Suporte</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}

export default BarraLateral;