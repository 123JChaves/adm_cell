"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import { 
    Tag, ListFilter, Pencil, Package, 
    CheckCircle2, XCircle, ChevronRight, Smartphone 
} from "lucide-react";
import Link from "next/link";

interface InterfaceProdutoVinculado {
    id: number;
    nome: string;
    preco: string; // Vem como string no seu JSON
    imagem: string;
    quantidade: number;
    ativo: boolean;
}

interface InterfaceCategoriaDetalhada {
    id: number;
    nome: string;
    ativo: boolean;
    produtos: InterfaceProdutoVinculado[];
}

const VisualizarCategoriaComProdutos = () => {
    const parametrosDaRota = useParams();
    const identificadorDaCategoria = parametrosDaRota.id;

    const [objetoCategoria, setObjetoCategoria] = useState<InterfaceCategoriaDetalhada | null>(null);
    const [estaCarregandoInformacoes, setEstaCarregandoInformacoes] = useState<boolean>(true);

    useEffect(() => {
        const buscarDadosDaCategoriaNoServidor = async () => {
            if (!identificadorDaCategoria) return;

            try {
                const respostaDoServidor = await instancia.get(`/produtos/categoria/${identificadorDaCategoria}`);
                
                // AJUSTADO: Conforme seu novo JSON, os dados vêm direto em respostaDoServidor.data
                const dadosExtraidos = respostaDoServidor.data;
                setObjetoCategoria(dadosExtraidos);
            } catch (erroDeProcessamento) {
                console.error("Falha ao buscar detalhes da categoria:", erroDeProcessamento);
            } finally {
                setEstaCarregandoInformacoes(false);
            }
        };

        buscarDadosDaCategoriaNoServidor();
    }, [identificadorDaCategoria]);

    const formatarMoeda = (valor: string | number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor));
    };

    if (estaCarregandoInformacoes) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
                <p className="font-black uppercase italic text-slate-400 animate-pulse tracking-widest">Sincronizando Catálogo...</p>
            </div>
        );
    }

    if (!objetoCategoria) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
                <p className="font-black uppercase text-red-500 tracking-widest">Categoria não localizada.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* CABEÇALHO */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-xl shadow-indigo-100">
                                    <Tag className="text-white w-9 h-9" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
                                        {objetoCategoria.nome}
                                    </h1>
                                    <span className="text-[11px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg uppercase tracking-wider border border-indigo-100 mt-2 inline-block">
                                        {objetoCategoria.produtos?.length || 0} Produtos Encontrados
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link 
                                    href={`/categoria/${objetoCategoria.id}/edicao`}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all shadow-sm active:scale-95 group"
                                >
                                    <Pencil className="w-4 h-4" /> Editar
                                </Link>
                                <Link 
                                    href="/categoria/lista" 
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                                >
                                    <ListFilter className="w-4 h-4" /> Voltar
                                </Link>
                            </div>
                        </header>

                        {/* GRADE DE PRODUTOS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {objetoCategoria.produtos?.map((produto) => (
                                <div key={produto.id} className="group bg-white border border-slate-200 rounded-[2.5rem] p-4 hover:shadow-2xl hover:border-indigo-400 transition-all duration-500 flex flex-col relative">
                                    
                                    {/* INDICADOR DE STATUS DO PRODUTO */}
                                    {!produto.ativo && (
                                        <div className="absolute top-6 left-6 z-10 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase shadow-lg">
                                            Indisponível
                                        </div>
                                    )}

                                    {/* CONTAINER DA IMAGEM - AUMENTADO (p-2 em vez de p-6) */}
                                    <div className="aspect-square bg-white rounded-[2rem] mb-5 overflow-hidden border border-slate-100 flex items-center justify-center relative shadow-sm group-hover:border-indigo-100 transition-colors">
                                        <img 
                                            src={`http://localhost:8081/uploads/${produto.imagem}`} 
                                            alt={produto.nome} 
                                            className={`w-full h-full object-contain p-2 transition-all duration-700 group-hover:scale-110 ${!produto.ativo ? 'grayscale opacity-50' : ''}`} 
                                            onError={(e) => { 
                                                e.currentTarget.src = "https://placeholder.com"; 
                                            }}
                                        />
                                        
                                        <div className="absolute bottom-4 right-4 bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-indigo-500">
                                            <p className="text-[10px] font-black text-white uppercase tracking-tighter">
                                                Estoque: {produto.quantidade}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="px-2 flex-1 flex flex-col">
                                        <h3 className="font-black text-slate-800 uppercase text-[12px] tracking-tight leading-snug line-clamp-3 min-h-[3rem] group-hover:text-indigo-600 transition-colors">
                                            {produto.nome}
                                        </h3>
                                        
                                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço à vista</span>
                                                <p className="font-black text-indigo-600 text-lg tracking-tighter">
                                                    {formatarMoeda(produto.preco)}
                                                </p>
                                            </div>
                                            
                                            <Link 
                                                href={`/produto/${produto.id}`}
                                                className="p-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-100 active:scale-90"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarCategoriaComProdutos;
