'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import instancia from "@/src/service/api";
import Menu from '@/src/components/Menu';
import Sidebar from '@/src/components/Sidebar';
import Footer from "@/src/components/Footer";
import { ArrowLeft, ShieldCheck, Package, Tag, CheckCircle2, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

interface IProdutoDaMarca {
    id: number;
    nome: string;
    preco: number;
    quantidade: number;
    imagem: string;
}

interface IMarcaDetalhada {
    id: number;
    nome: string;
    ativo: boolean;
    produtos: IProdutoDaMarca[];
}

const DetalheMarca = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDaMarca = parametrosDaRota.id;

    const [objetoMarca, setObjetoMarca] = useState<IMarcaDetalhada | null>(null);
    const [estaCarregando, setEstaCarregando] = useState<boolean>(true);

    useEffect(() => {
        const buscarDadosCompletos = async () => {
            try {
                const respostaApi = await instancia.get<IMarcaDetalhada>(`/marca/${identificadorDaMarca}`);
                setObjetoMarca(respostaApi.data);
            } catch (erro) {
                console.error("Erro ao buscar detalhes:", erro);
            } finally {
                setEstaCarregando(false);
            }
        };

        if (identificadorDaMarca) buscarDadosCompletos();
    }, [identificadorDaMarca]);

    if (estaCarregando) {
        return <div className="flex items-center justify-center h-screen font-black text-slate-400 uppercase italic animate-pulse">Carregando informações...</div>;
    }

    if (!objetoMarca) {
        return <div className="flex items-center justify-center h-screen font-black text-red-500 uppercase">Marca não encontrada.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* CABEÇALHO DA MARCA */}
                        <header className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-md">
                                    <ShieldCheck className="text-white w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{objetoMarca.nome}</h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        {objetoMarca.ativo ? 
                                            <span className="text-[10px] font-black text-green-600 uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Marca Ativa</span> : 
                                            <span className="text-[10px] font-black text-red-600 uppercase flex items-center gap-1"><XCircle className="w-3 h-3" /> Marca Inativa</span>
                                        }
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => navegadorDePaginas.back()} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><ArrowLeft className="w-7 h-7" /></button>
                        </header>

                        {/* LISTAGEM DE PRODUTOS DA MARCA */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 px-2">
                                <Package className="w-5 h-5 text-indigo-500" />
                                <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Produtos Vinculados ({objetoMarca.produtos?.length || 0})</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {objetoMarca.produtos && objetoMarca.produtos.length > 0 ? (
                                    objetoMarca.produtos.map((produto) => (
                                        <div key={produto.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all group">
                                            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-4 border border-slate-100 flex items-center justify-center">
                                                {produto.imagem ? (
                                                    <img src={`http://localhost:8081/uploads/${produto.imagem}`} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <Package className="w-10 h-10 text-slate-200" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Modelo</p>
                                                <h3 className="font-bold text-slate-900 uppercase text-sm truncate">{produto.nome}</h3>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="font-black text-slate-900">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                                    </span>
                                                    <Link href={`/produto/${produto.id}`} className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-[2rem] p-20 text-center">
                                        <p className="font-black text-slate-400 uppercase italic">Nenhum produto cadastrado para esta marca.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default DetalheMarca;