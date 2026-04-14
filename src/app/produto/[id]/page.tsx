"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import { 
    Smartphone, ListFilter, Pencil, Tag, Factory, 
    Layers, DollarSign, AlignLeft, CheckCircle2, XCircle 
} from "lucide-react";
import Link from "next/link";

interface InterfaceProdutoDetalhado {
    id: number;
    nome: string;
    preco: number;
    quantidade: number;
    descricao: string;
    imagem: string;
    ativo: boolean;
    destaque: boolean;
    categoria: { nome: string };
    marca: { nome: string };
}

const VisualizarProdutoPorIdentificador = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDoProduto = parametrosDaRota.id;

    const [objetoProduto, setObjetoProduto] = useState<InterfaceProdutoDetalhado | null>(null);
    const [estaCarregandoInformacoes, setEstaCarregandoInformacoes] = useState<boolean>(true);

    useEffect(() => {
        const buscarDadosDoProdutoNoServidor = async () => {
            try {
                const respostaDoServidor = await instancia.get(`/produto/${identificadorDoProduto}`);
                setObjetoProduto(respostaDoServidor.data);
            } catch (erroDeProcessamento) {
                console.error("Falha ao buscar detalhes do produto:", erroDeProcessamento);
            } finally {
                setEstaCarregandoInformacoes(false);
            }
        };

        if (identificadorDoProduto) {
            buscarDadosDoProdutoNoServidor();
        }
    }, [identificadorDoProduto]);

    if (estaCarregandoInformacoes) {
        return <div className="flex justify-center items-center h-screen font-black uppercase italic text-slate-500">Sincronizando Dados...</div>;
    }

    if (!objetoProduto) {
        return <div className="flex justify-center items-center h-screen font-black uppercase text-red-500">Registro não localizado.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-4xl mx-auto">
                        
                        {/* CABEÇALHO DA PÁGINA */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-md">
                                    <Smartphone className="text-white w-7 h-7" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                    Ficha Técnica
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* BOTÃO DE EDIÇÃO - RETORNADO AO MODELO MINIMALISTA */}
                                <Link 
                                    href={`/produto/${objetoProduto.id}/edicao`}
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all shadow-sm active:scale-95 group"
                                >
                                    <Pencil className="w-4 h-4" /> Editar Item
                                </Link>

                                {/* BOTÃO PARA VOLTAR À LISTAGEM - HARMONIZADO COM HOVER */}
                                <Link 
                                    href="/produto/lista" 
                                    className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                                >
                                    <ListFilter className="w-4 h-4 text-indigo-600" /> Ver Todos
                                </Link>
                            </div>
                        </header>

                        <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                
                                {/* COLUNA DA IMAGEM E STATUS (ESTILO VIVO) */}
                                <div className="space-y-6">
                                    <div className="aspect-square bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden flex items-center justify-center shadow-inner group">
                                        <img 
                                            src={objetoProduto.imagem} 
                                            alt={objetoProduto.nome} 
                                            className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-3">
                                        {objetoProduto.ativo ? (
                                            <span className="flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 rounded-xl font-black uppercase text-[10px] border border-green-200 tracking-widest shadow-sm">
                                                <CheckCircle2 className="w-4 h-4" /> Item Ativo
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-700 rounded-xl font-black uppercase text-[10px] border border-red-200 tracking-widest shadow-sm">
                                                <XCircle className="w-4 h-4" /> Item Inativo
                                            </span>
                                        )}

                                        {objetoProduto.destaque ? (
                                            <span className="flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 rounded-xl font-black uppercase text-[10px] border border-green-200 tracking-widest shadow-sm">
                                                <Tag className="w-4 h-4" /> Em Destaque
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-700 rounded-xl font-black uppercase text-[10px] border border-red-200 tracking-widest opacity-50 shadow-sm">
                                                <Tag className="w-4 h-4" /> Normal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* COLUNA DAS INFORMAÇÕES TEXTUAIS */}
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1 block">Nome do Modelo</label>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight">{objetoProduto.nome}</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Tag className="w-3 h-3 text-indigo-500" /> Categoria</label>
                                            <p className="font-black text-slate-800 text-sm uppercase">{objetoProduto.categoria.nome}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Factory className="w-3 h-3 text-indigo-500" /> Marca</label>
                                            <p className="font-black text-slate-800 text-sm uppercase">{objetoProduto.marca.nome}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><Layers className="w-3 h-3 text-indigo-500" /> Estoque</label>
                                            <p className={`font-black text-sm uppercase ${objetoProduto.quantidade <= 5 ? 'text-red-600' : 'text-slate-800'}`}>
                                                {objetoProduto.quantidade} Unidades
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><DollarSign className="w-3 h-3 text-indigo-500" /> Preço</label>
                                            <p className="font-black text-indigo-600 text-lg uppercase">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(objetoProduto.preco)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-6 border-t border-slate-50">
                                        <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest"><AlignLeft className="w-3 h-3 text-indigo-500" /> Descrição Técnica</label>
                                        <p className="text-slate-600 text-sm leading-relaxed font-medium">
                                            {objetoProduto.descricao || "Nenhuma descrição detalhada informada."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-between items-center px-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ID Interno: #{objetoProduto.id}</span>
                            <button 
                                onClick={() => navegadorDePaginas.back()}
                                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                            >
                                Voltar para a página anterior
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarProdutoPorIdentificador;