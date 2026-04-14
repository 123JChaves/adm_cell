'use client'

import Link from 'next/link';
import { Globe, MessageCircle, Share2, LayoutDashboard } from 'lucide-react';

const Footer = () => {
    const anoAtualCalendario = new Date().getFullYear();

    const linksDeRedesSociais = [
        { IconeRepresentativo: Globe, enderecoRedirecionamento: "#", rotuloAcessibilidade: "Website Oficial" },
        { IconeRepresentativo: MessageCircle, enderecoRedirecionamento: "#", rotuloAcessibilidade: "Canal de Comunicação" },
        { IconeRepresentativo: Share2, enderecoRedirecionamento: "#", rotuloAcessibilidade: "Compartilhar Plataforma" }
    ];

    return (
        // Reduzi py-8 para py-3 (altura bem menor) e mt-auto para garantir posição no rodapé
        <footer className="bg-slate-900 border-t border-white/5 py-3 md:ml-64 mt-auto transition-all">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Identidade Visual - Mantida conforme original */}
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-900/40">
                            <LayoutDashboard className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-black tracking-tight text-sm uppercase">
                            Adm Loja Cell
                        </span>
                    </div>

                    {/* Navegação - Links mais compactos e sem quebra excessiva */}
                    <div className="flex items-center gap-5">
                        <Link href="/suporte" className="text-slate-400 hover:text-indigo-400 text-[10px] font-bold transition-colors uppercase tracking-tight">Suporte</Link>
                        <Link href="/termos" className="text-slate-400 hover:text-indigo-400 text-[10px] font-bold transition-colors uppercase tracking-tight">Termos</Link>
                        <Link href="/privacidade" className="text-slate-400 hover:text-indigo-400 text-[10px] font-bold transition-colors uppercase tracking-tight">Privacidade</Link>
                    </div>

                    {/* Redes Sociais - Botões menores para economizar altura */}
                    <div className="flex items-center gap-2">
                        {linksDeRedesSociais.map((itemRedeSocial, indiceDoMapeamento) => (
                            <Link 
                                key={indiceDoMapeamento}
                                href={itemRedeSocial.enderecoRedirecionamento} 
                                title={itemRedeSocial.rotuloAcessibilidade}
                                className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:bg-indigo-600 hover:text-white transition-all"
                            >
                                <itemRedeSocial.IconeRepresentativo size={14} />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bloco de Propriedade - Margem mt-8 reduzida para mt-3 */}
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-col md:flex-row justify-center items-center gap-2">
                    <p className="text-slate-500 text-[9px] font-bold tracking-widest uppercase">
                        © {anoAtualCalendario} <span className="text-slate-300">Adm Loja Cell</span>
                    </p>
                    <span className="hidden md:block text-slate-700">•</span>
                    <p className="text-slate-600 text-[9px] uppercase tracking-tighter">
                        Gestão de Inventário
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;