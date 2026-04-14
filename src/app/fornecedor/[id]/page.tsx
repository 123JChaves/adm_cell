"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import { 
    Users, ArrowLeft, Building2, MapPinned, 
    Fingerprint, Package, Eye, CheckCircle2, XCircle 
} from "lucide-react";
import Link from "next/link";

interface InterfaceProdutoSimplificado {
    id: number;
    nome: string;
    preco: number;
    imagem: string | null;
}

interface InterfaceEnderecoDetalhado {
    id: number;
    nome: string;
    numero: number;
    bairro: {
        nome: string;
        cidade: {
            nome: string;
            estado: {
                nome: string;
                pais: { nome: string }
            }
        }
    };
}

interface InterfaceFornecedorDetalhado {
    id: number;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    ativo: boolean;
    enderecos: InterfaceEnderecoDetalhado[]; // Definido como Array conforme a entidade
    produtos: InterfaceProdutoSimplificado[];
}

const VisualizarFornecedor = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDoFornecedor = parametrosDaRota.id;

    const [objetoFornecedor, setObjetoFornecedor] = useState<InterfaceFornecedorDetalhado | null>(null);
    const [estaCarregandoInformacoes, setEstaCarregandoInformacoes] = useState<boolean>(true);

    useEffect(() => {
        const buscarFichaDoFornecedor = async () => {
            try {
                const resposta = await instancia.get(`/fornecedor/${identificadorDoFornecedor}/produtos`);
                setObjetoFornecedor(resposta.data);
            } catch (erro) {
                console.error("Falha ao carregar fornecedor:", erro);
            } finally {
                setEstaCarregandoInformacoes(false);
            }
        };

        if (identificadorDoFornecedor) buscarFichaDoFornecedor();
    }, [identificadorDoFornecedor]);

    if (estaCarregandoInformacoes) {
        return <div className="flex items-center justify-center h-screen font-black uppercase italic text-slate-400 animate-pulse">Carregando Ficha...</div>;
    }

    if (!objetoFornecedor) {
        return <div className="flex items-center justify-center h-screen font-black text-red-500 uppercase">Fornecedor não localizado.</div>;
    }

    // Atalho para o primeiro endereço para limpar o JSX
    const enderecoPrincipal = objetoFornecedor.enderecos?.[0];

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* CABEÇALHO */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-lg shadow-indigo-100">
                                    <Users className="text-white w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">
                                        {objetoFornecedor.nomeFantasia}
                                    </h1>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                                        {objetoFornecedor.ativo ? (
                                            <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Parceiro Ativo</span>
                                        ) : (
                                            <span className="text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" /> Parceiro Inativo</span>
                                        )}
                                        • CNPJ: {objetoFornecedor.cnpj}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navegadorDePaginas.back()} 
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* COLUNA LATERAL: DADOS CORPORATIVOS */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
                                    <h2 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Dados Cadastrais
                                    </h2>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Razão Social</label>
                                            <p className="font-bold text-slate-800 uppercase text-sm leading-tight">{objetoFornecedor.razaoSocial}</p>
                                        </div>
                                        <div className="pt-4 border-t border-slate-50">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sede / Localização</label>
                                            <div className="flex gap-3">
                                                <MapPinned className="w-5 h-5 text-indigo-500 shrink-0" />
                                                <div className="text-xs font-bold text-slate-600 leading-relaxed uppercase">
                                                    {enderecoPrincipal ? (
                                                        <>
                                                            <p>{enderecoPrincipal.nome}, {enderecoPrincipal.numero}</p>
                                                            <p>{enderecoPrincipal.bairro?.nome}</p>
                                                            <p>{enderecoPrincipal.bairro?.cidade?.nome} - {enderecoPrincipal.bairro?.cidade?.estado?.nome}</p>
                                                            <p>{enderecoPrincipal.bairro?.cidade?.estado?.pais?.nome}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-slate-400 italic">Endereço não cadastrado</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUNA PRINCIPAL: PRODUTOS */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        <Package className="w-5 h-5 text-indigo-500" /> 
                                        Produtos Fornecidos ({objetoFornecedor.produtos?.length || 0})
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {objetoFornecedor.produtos && objetoFornecedor.produtos.length > 0 ? (
                                        objetoFornecedor.produtos.map((produto) => (
                                            <div key={produto.id} className="bg-white border border-slate-200 rounded-[2rem] p-5 flex items-center gap-4 hover:border-indigo-200 transition-all group shadow-sm">
                                                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0 flex items-center justify-center">
                                                    {produto.imagem ? (
                                                        <img 
                                                            src={`http://localhost:8081/uploads/${produto.imagem}`} 
                                                            alt={produto.nome}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                        />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-slate-200" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900 uppercase text-xs truncate mb-1">{produto.nome}</h3>
                                                    <p className="font-black text-indigo-600 text-sm">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco)}
                                                    </p>
                                                </div>
                                                <Link 
                                                    href={`/produto/${produto.id}`} 
                                                    className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                                            <p className="font-black text-slate-400 uppercase italic text-xs tracking-widest">Nenhum produto vinculado a este parceiro.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default VisualizarFornecedor;