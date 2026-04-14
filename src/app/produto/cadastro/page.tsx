'use client'

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import { 
    Package, Save, Tag, Layers, DollarSign, AlignLeft, 
    ArrowLeft, Factory, Smartphone, Users, X,
    Image as IconeImagem, ListFilter 
} from "lucide-react";
import Link from 'next/link';

// Interfaces estritas para sincronia com o Banco de Dados
interface CategoriaProduto { id: number; nome: string; }
interface MarcaProduto { id: number; nome: string; }
interface FornecedorProduto { id: number; nomeFantasia: string; }

const CadastroProduto = () => {
    // Estados de Controle de Interface
    const [estaCarregando, setEstaCarregando] = useState<boolean>(false);
    const [dicionarioErrosDosCampos, setDicionarioErrosDosCampos] = useState<Record<string, string>>({});
    const [mensagemDeErroGeral, setMensagemDeErroGeral] = useState<string | null>(null);

    // Estados dos Dados do Produto
    const [nomeDoProduto, setNomeDoProduto] = useState<string>("");
    const [precoDeVendaDoProduto, setPrecoDeVendaDoProduto] = useState<string>("");
    const [quantidadeEmEstoque, setQuantidadeEmEstoque] = useState<string>("");
    const [descricaoDetalhadaDoProduto, setDescricaoDetalhadaDoProduto] = useState<string>("");
    const [identificadorDaCategoriaSelecionada, setIdentificadorDaCategoriaSelecionada] = useState<string>("");
    const [identificadorDaMarcaSelecionada, setIdentificadorDaMarcaSelecionada] = useState<string>("");
    const [listaDeIdentificadoresDosFornecedores, setListaDeIdentificadoresDosFornecedores] = useState<string[]>([]);
    const [arquivoDeImagemDoProduto, setArquivoDeImagemDoProduto] = useState<File | null>(null);

    // Estados para Listas de Apoio
    const [listaDeCategoriasDisponiveis, setListaDeCategoriasDisponiveis] = useState<CategoriaProduto[]>([]);
    const [listaDeMarcasDisponiveis, setListaDeMarcasDisponiveis] = useState<MarcaProduto[]>([]);
    const [listaDeFornecedoresDisponiveis, setListaDeFornecedoresDisponiveis] = useState<FornecedorProduto[]>([]);

    useEffect(() => {
        const buscarDadosDeApoioNoServidor = async () => {
            try {
                const [respostaCategorias, respostaMarcas, respostaFornecedores] = await Promise.all([
                    instancia.get<CategoriaProduto[]>("/categorias"),
                    instancia.get<MarcaProduto[]>("/marcas"),
                    instancia.get<FornecedorProduto[]>("/fornecedores")
                ]);
                setListaDeCategoriasDisponiveis(respostaCategorias.data);
                setListaDeMarcasDisponiveis(respostaMarcas.data);
                setListaDeFornecedoresDisponiveis(respostaFornecedores.data);
            } catch (erroDeConexao) {
                setMensagemDeErroGeral("Falha ao carregar as listas de apoio do servidor.");
            }
        };
        buscarDadosDeApoioNoServidor();
    }, []);

    // FUNÇÕES DE MANIPULAÇÃO DE FORNECEDORES (Resolvendo ReferenceError)
    const adicionarFornecedor = (identificador: string) => {
        if (identificador && !listaDeIdentificadoresDosFornecedores.includes(identificador)) {
            setListaDeIdentificadoresDosFornecedores([...listaDeIdentificadoresDosFornecedores, identificador]);
            if (dicionarioErrosDosCampos.fornecedores) {
                setDicionarioErrosDosCampos(prev => ({ ...prev, fornecedores: "" }));
            }
        }
    };

    const removerFornecedor = (identificador: string) => {
        setListaDeIdentificadoresDosFornecedores(prev => 
            prev.filter(item => item !== identificador)
        );
    };

    const processarSubmissaoDoFormulario = async (eventoDeEnvio: FormEvent<HTMLFormElement>) => {
        eventoDeEnvio.preventDefault();
        setDicionarioErrosDosCampos({});
        setMensagemDeErroGeral(null);

        const novosErrosDetectados: Record<string, string> = {};
        if (!nomeDoProduto.trim()) novosErrosDetectados.nome = "O nome do produto é obrigatório.";
        if (!precoDeVendaDoProduto) novosErrosDetectados.preco = "O preço de venda é obrigatório.";
        if (!quantidadeEmEstoque) novosErrosDetectados.quantidade = "A quantidade em estoque é obrigatória.";
        if (!identificadorDaCategoriaSelecionada) novosErrosDetectados.categoria = "Selecione uma categoria.";
        if (!identificadorDaMarcaSelecionada) novosErrosDetectados.marca = "Selecione uma marca.";
        if (listaDeIdentificadoresDosFornecedores.length === 0) novosErrosDetectados.fornecedores = "Vincule ao menos um fornecedor.";

        if (Object.keys(novosErrosDetectados).length > 0) {
            setDicionarioErrosDosCampos(novosErrosDetectados);
            return;
        }

        setEstaCarregando(true);
        const formatadorDeDadosParaEnvio = new FormData();
        formatadorDeDadosParaEnvio.append("nome", nomeDoProduto);
        formatadorDeDadosParaEnvio.append("preco", precoDeVendaDoProduto);
        formatadorDeDadosParaEnvio.append("quantidade", quantidadeEmEstoque);
        formatadorDeDadosParaEnvio.append("descricao", descricaoDetalhadaDoProduto);
        formatadorDeDadosParaEnvio.append("categoriaId", identificadorDaCategoriaSelecionada);
        formatadorDeDadosParaEnvio.append("marcaId", identificadorDaMarcaSelecionada);
        formatadorDeDadosParaEnvio.append("fornecedores", JSON.stringify(listaDeIdentificadoresDosFornecedores));
        
        if (arquivoDeImagemDoProduto) formatadorDeDadosParaEnvio.append("imagem", arquivoDeImagemDoProduto);

        try {
            await instancia.post("/produto", formatadorDeDadosParaEnvio);
            window.location.href = "/produto/lista";
        } catch (erroDoServidor: any) {
            setMensagemDeErroGeral(erroDoServidor.response?.data?.message || "Ocorreu um erro ao salvar o produto.");
        } finally {
            setEstaCarregando(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-5xl mx-auto">
                        
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
                                        <Package className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Novo Produto</h1>
                                </div>
                                <p className="text-slate-500 font-medium mt-2 ml-1">Gestão de inventário e novos itens.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/produto/lista" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                                    <ListFilter className="w-4 h-4 text-indigo-600" /> Listar Produtos
                                </Link>
                                <Link href="/dashboard" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </div>
                        </header>

                        {mensagemDeErroGeral && <div className="mb-6"><AlertMessage type="error" message={mensagemDeErroGeral} /></div>}

                        <form onSubmit={processarSubmissaoDoFormulario} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                            
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Tag className="w-4 h-4 text-indigo-600" /> Nome do Produto
                                </label>
                                <input 
                                    type="text" value={nomeDoProduto} 
                                    onChange={(evento) => setNomeDoProduto(evento.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioErrosDosCampos.nome ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"}`}
                                    placeholder="Ex: iPhone 15 Pro Max"
                                />
                                {dicionarioErrosDosCampos.nome && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.nome}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <DollarSign className="w-4 h-4 text-indigo-600" /> Preço de Venda
                                </label>
                                <input 
                                    type="number" step="0.01" value={precoDeVendaDoProduto} 
                                    onChange={(evento) => setPrecoDeVendaDoProduto(evento.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioErrosDosCampos.preco ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"}`}
                                />
                                {dicionarioErrosDosCampos.preco && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.preco}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Layers className="w-4 h-4 text-indigo-600" /> Estoque Inicial
                                </label>
                                <input 
                                    type="number" value={quantidadeEmEstoque} 
                                    onChange={(evento) => setQuantidadeEmEstoque(evento.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioErrosDosCampos.quantidade ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10"}`}
                                />
                                {dicionarioErrosDosCampos.quantidade && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.quantidade}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Smartphone className="w-4 h-4 text-indigo-600" /> Categoria
                                </label>
                                <select 
                                    value={identificadorDaCategoriaSelecionada} 
                                    onChange={(evento) => setIdentificadorDaCategoriaSelecionada(evento.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioErrosDosCampos.categoria ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600"}`}
                                >
                                    <option value="">Selecione a categoria...</option>
                                    {listaDeCategoriasDisponiveis.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
                                </select>
                                {dicionarioErrosDosCampos.categoria && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.categoria}</span>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Factory className="w-4 h-4 text-indigo-600" /> Marca Fabricante
                                </label>
                                <select 
                                    value={identificadorDaMarcaSelecionada} 
                                    onChange={(evento) => setIdentificadorDaMarcaSelecionada(evento.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioErrosDosCampos.marca ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600"}`}
                                >
                                    <option value="">Selecione a marca...</option>
                                    {listaDeMarcasDisponiveis.map((marca) => <option key={marca.id} value={marca.id}>{marca.nome}</option>)}
                                </select>
                                {dicionarioErrosDosCampos.marca && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.marca}</span>}
                            </div>

                            {/* SEÇÃO MODERNA DE FORNECEDORES */}
                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Users className="w-4 h-4 text-indigo-600" /> Fornecedores Vinculados
                                </label>

                                <div className={`flex flex-wrap gap-2 p-4 min-h-[64px] rounded-2xl border transition-all ${dicionarioErrosDosCampos.fornecedores ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                                    {listaDeIdentificadoresDosFornecedores.length === 0 && (
                                        <span className="text-slate-400 text-sm italic">Nenhum fornecedor vinculado...</span>
                                    )}
                                    {listaDeIdentificadoresDosFornecedores.map((id) => {
                                        const fornecedor = listaDeFornecedoresDisponiveis.find(f => f.id.toString() === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-xl shadow-sm animate-in fade-in zoom-in duration-200">
                                                <span className="text-xs font-bold uppercase tracking-wider">{fornecedor?.nomeFantasia}</span>
                                                <button type="button" onClick={() => removerFornecedor(id)} className="hover:bg-indigo-500 rounded-lg p-0.5 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                <select 
                                    value="" 
                                    onChange={(evento) => adicionarFornecedor(evento.target.value)}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-white outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-bold text-slate-600"
                                >
                                    <option value="">+ Clique para adicionar fornecedores</option>
                                    {listaDeFornecedoresDisponiveis
                                        .filter(fornecedor => !listaDeIdentificadoresDosFornecedores.includes(fornecedor.id.toString()))
                                        .map((fornecedor) => <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nomeFantasia}</option>)
                                    }
                                </select>
                                {dicionarioErrosDosCampos.fornecedores && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.fornecedores}</span>}
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <IconeImagem className="w-4 h-4 text-indigo-600" /> Imagem do Produto
                                </label>
                                <input type="file" accept="image/*" onChange={(evento) => setArquivoDeImagemDoProduto(evento.target.files?.item(0) || null)} className="w-full p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <AlignLeft className="w-4 h-4 text-indigo-600" /> Descrição Detalhada
                                </label>
                                <textarea rows={4} value={descricaoDetalhadaDoProduto} onChange={(evento) => setDescricaoDetalhadaDoProduto(evento.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 resize-none" placeholder="Características técnicas, especificações, etc..." />
                            </div>

                            <div className="md:col-span-2 flex justify-end pt-6 border-t border-slate-50">
                                <button type="submit" disabled={estaCarregando} className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    {estaCarregando ? "Processando..." : <><Save className="w-5 h-5" /> Finalizar Cadastro</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default CadastroProduto;