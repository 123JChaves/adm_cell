"use client";

import React, { useState, useEffect } from "react";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import AlertMessage from "@/src/utils/Alert";
import { 
    Package, Plus, Search, ListFilter, Smartphone, 
    Edit, Trash2, Eye, Tag, X 
} from "lucide-react";
import Link from 'next/link';
import DeleteButton from "@/src/utils/DeleteButton";

interface ProdutoLista {
    id: number;
    nome: string;
    preco: number;
    quantidade: number;
    ativo: boolean;
    destaque: boolean;
    imagem: string | null;
    categoria: { nome: string };
    marca: { nome: string };
}

interface CategoriaFiltro {
    id: number;
    nome: string;
}

const ListagemProdutos = () => {
    const [listaDeProdutos, setListaDeProdutos] = useState<ProdutoLista[]>([]);
    const [listaDeCategorias, setListaDeCategorias] = useState<CategoriaFiltro[]>([]);
    const [termoDeBusca, setTermoDeBusca] = useState<string>("");
    const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
    const [mensagemDeErroGeral, setMensagemDeErroGeral] = useState<string | null>(null);
    const [mensagemDeSucessoGeral, setMensagemDeSucessoGeral] = useState<string | null>(null);
    const [estaCarregando, setEstaCarregando] = useState<boolean>(true);

    // Função movida para fora do useEffect para ser reutilizada pelo DeleteButton
    const buscarDados = async () => {
        setEstaCarregando(true);
        try {
            const [respostaProdutos, respostaCategorias] = await Promise.all([
                instancia.get<ProdutoLista[]>("/produtos"),
                instancia.get<CategoriaFiltro[]>("/categorias")
            ]);
            setListaDeProdutos(respostaProdutos.data);
            setListaDeCategorias(respostaCategorias.data);
        } catch {
            setMensagemDeErroGeral("Falha ao sincronizar dados com o servidor.");
        } finally {
            setEstaCarregando(false);
        }
    };

    useEffect(() => {
        buscarDados();
    }, []);

    const produtosFiltrados = listaDeProdutos.filter((produto) => {
        const coincideNome = produto.nome.toLowerCase().includes(termoDeBusca.toLowerCase());
        const coincideCategoria = categoriaSelecionada === "" || produto.categoria.nome === categoriaSelecionada;
        return coincideNome && coincideCategoria;
    });

    const formatarValorParaReal = (valor: number) => {
        const numeroValido = valor || 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numeroValido);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>

            {/* ALERTAS DE FEEDBACK VISUAL */}
            {mensagemDeErroGeral && (
                <AlertMessage 
                    type="error" 
                    message={mensagemDeErroGeral} 
                    onClose={() => setMensagemDeErroGeral(null)} 
                />
            )}
            {mensagemDeSucessoGeral && (
                <AlertMessage 
                    type="success" 
                    message={mensagemDeSucessoGeral} 
                    onClose={() => setMensagemDeSucessoGeral(null)} 
                />
            )}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-6xl mx-auto">
                        
                        {/* CABEÇALHO DA PÁGINA */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
                                        <Smartphone className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Produtos</h1>
                                </div>
                                <p className="text-slate-700 mt-2 font-medium">
                                    Gerencie seu inventário e estoque.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link 
                                    href="/produto/cadastro" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                                >
                                    <Plus className="w-4 h-4 text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
                                    Novo Produto
                                </Link>
                            </div>
                        </header>

                        {/* SEÇÃO DE FILTRAGEM E BUSCA */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Palavra-chave</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-5 h-5" />
                                        <input 
                                            type="text"
                                            placeholder="Buscar pelo nome do produto..."
                                            value={termoDeBusca}
                                            onChange={(eventoDeDigitacao) => setTermoDeBusca(eventoDeDigitacao.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800 placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Filtrar por Categoria</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 w-4 h-4" />
                                        <select 
                                            value={categoriaSelecionada}
                                            onChange={(eventoDeSelecao) => setCategoriaSelecionada(eventoDeSelecao.target.value)}
                                            className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-700 focus:ring-4 focus:ring-indigo-500/10 appearance-none transition-all font-black text-slate-800 cursor-pointer"
                                        >
                                            <option value="">Todas as categorias</option>
                                            {listaDeCategorias.map((categoriaItem) => (
                                                <option key={categoriaItem.id} value={categoriaItem.nome}>{categoriaItem.nome}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-700">
                                            <ListFilter className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(termoDeBusca || categoriaSelecionada) && (
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => { setTermoDeBusca(""); setCategoriaSelecionada(""); }} 
                                        className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <X className="w-3 h-3" /> Limpar Filtros
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* LISTAGEM EM FORMATO DE TABELA */}
                        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-6 text-xs font-black text-slate-600 uppercase tracking-widest">Produto</th>
                                        <th className="p-6 text-xs font-black text-slate-600 uppercase tracking-widest">Categoria</th>
                                        <th className="p-6 text-xs font-black text-slate-600 uppercase tracking-widest">Status / Destaque</th>
                                        <th className="p-6 text-xs font-black text-slate-600 uppercase tracking-widest">Estoque/Preço</th>
                                        <th className="p-6 text-xs font-black text-slate-600 uppercase tracking-widest text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estaCarregando ? (
                                        <tr><td colSpan={5} className="p-20 text-center text-slate-600 font-bold italic">Sincronizando produtos...</td></tr>
                                    ) : produtosFiltrados.length > 0 ? (
                                        produtosFiltrados.map((produtoIndividual) => (
                                            <tr key={produtoIndividual.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 min-w-[64px] bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200 shadow-sm relative group/miniatura">
                                                            {produtoIndividual.imagem ? (
                                                                <img 
                                                                    src={produtoIndividual.imagem} 
                                                                    alt={produtoIndividual.nome} 
                                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/miniatura:scale-110" 
                                                                    onError={(eventoDeErro) => { 
                                                                        eventoDeErro.currentTarget.src = "https://placeholder.com"; 
                                                                    }}
                                                                />
                                                            ) : (
                                                                <Package className="w-8 h-8 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm uppercase tracking-normal leading-tight">
                                                                {produtoIndividual.nome}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                                                                {produtoIndividual.marca?.nome}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="p-6">
                                                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[9px] font-black rounded-lg border border-indigo-200 uppercase">
                                                        {produtoIndividual.categoria.nome}
                                                    </span>
                                                </td>

                                                <td className="p-6">
                                                    <div className="flex flex-col gap-2 justify-center">
                                                        {/* STATUS ATIVO/INATIVO */}
                                                        {produtoIndividual.ativo ? (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-tighter">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                                Ativo
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-tighter">
                                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                                Inativo
                                                            </div>
                                                        )}

                                                        {/* DESTAQUE/NORMAL */}
                                                        {produtoIndividual.destaque ? (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-green-600 uppercase tracking-tighter">
                                                                <Tag className="w-3 h-3 text-green-600" />
                                                                Destaque
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 uppercase tracking-tighter opacity-40">
                                                                <Tag className="w-3 h-3 text-red-600" />
                                                                Normal
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="p-6">
                                                    <p className={`font-black text-xs ${produtoIndividual.quantidade <= 5 ? 'text-red-600' : 'text-slate-700'}`}>
                                                        {produtoIndividual.quantidade} un.
                                                    </p>
                                                    <p className="font-black text-slate-900 text-sm mt-0.5">
                                                        {formatarValorParaReal(produtoIndividual.preco)}
                                                    </p>
                                                </td>

                                                <td className="p-6">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link 
                                                            href={`/produto/${produtoIndividual.id}`} 
                                                            className="group/botaoAcao flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300"
                                                        >
                                                            <Eye className="w-5 h-5 transition-transform group-hover/botaoAcao:scale-110" />
                                                        </Link>
                                                        
                                                        <Link 
                                                            href={`/produto/${produtoIndividual.id}/edicao`} 
                                                            className="group/botaoAcao flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-300"
                                                        >
                                                            <Edit className="w-5 h-5 transition-transform group-hover/botaoAcao:scale-110" />
                                                        </Link>

                                                        <DeleteButton
                                                            id={String(produtoIndividual.id)}
                                                            router="produto"
                                                            onSuccess={buscarDados}
                                                            setError={setMensagemDeErroGeral}
                                                            setSuccess={setMensagemDeSucessoGeral}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center text-slate-700 font-black">
                                                Nenhum produto localizado com o termo "{termoDeBusca}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default ListagemProdutos;