"use client";

import axios, { AxiosError } from 'axios';
import instanciaAxios from "@/src/service/api";
import React, { useState, useEffect, FormEvent } from "react";
import MenuNavegacao from "@/src/components/Menu";
import BarraLateral from "@/src/components/Sidebar";
import RodapePagina from "@/src/components/Footer";
import { 
    Package, Save, Tag, Layers, DollarSign, AlignLeft, 
    Factory, Smartphone, Users, X,
    Image as IconeImagem, ListFilter, CheckCircle2, XCircle 
} from "lucide-react";
import LinkNavegacao from 'next/link';
import AlertMessage from '@/src/utils/Alert';

interface CategoriaDoProduto { id: number; nome: string; }
interface MarcaDoProduto { id: number; nome: string; }
interface FornecedorDoProduto { id: number; nomeFantasia: string; }

const CadastroDeProduto = () => {
    // ESTADOS PARA CONTROLE DE CARREGAMENTO E FEEDBACK
    const [estaProcessandoDados, setEstaProcessandoDados] = useState<boolean>(false);
    const [dicionarioDeErrosDeValidacao, setDicionarioDeErrosDeValidacao] = useState<Record<string, string>>({});
    const [mensagemDeErroDoServidor, setMensagemDeErroDoServidor] = useState<string | null>(null);
    const [mensagemDeSucessoDoServidor, setMensagemDeSucessoDoServidor] = useState<string | null>(null);

    // ESTADOS PARA ARMAZENAMENTO DOS DADOS DO FORMULÁRIO
    const [nomeDoProdutoParaCadastro, setNomeDoProdutoParaCadastro] = useState<string>("");
    const [precoDeVendaFormatado, setPrecoDeVendaFormatado] = useState<string>("");
    const [quantidadeInicialEmEstoque, setQuantidadeInicialEmEstoque] = useState<string>("");
    const [descricaoDetalhadaDoProduto, setDescricaoDetalhadaDoProduto] = useState<string>("");
    const [produtoSeraExibidoComoAtivo, setProdutoSeraExibidoComoAtivo] = useState<boolean>(true);
    const [produtoSeraExibidoComoDestaque, setProdutoSeraExibidoComoDestaque] = useState<boolean>(false);
    const [identificadorDaCategoriaSelecionada, setIdentificadorDaCategoriaSelecionada] = useState<string>("");
    const [identificadorDaMarcaSelecionada, setIdentificadorDaMarcaSelecionada] = useState<string>("");
    const [listaDeIdentificadoresDosFornecedores, setListaDeIdentificadoresDosFornecedores] = useState<string[]>([]);
    const [arquivoDaImagemSelecionada, setArquivoDaImagemSelecionada] = useState<File | null>(null);

    // ESTADOS PARA AS LISTAS DE DADOS EXTERNOS
    const [listaDeCategoriasCadastradas, setListaDeCategoriasCadastradas] = useState<CategoriaDoProduto[]>([]);
    const [listaDeMarcasCadastradas, setListaDeMarcasCadastradas] = useState<MarcaDoProduto[]>([]);
    const [listaDeFornecedoresCadastrados, setListaDeFornecedoresCadastrados] = useState<FornecedorDoProduto[]>([]);

    useEffect(() => {
        const buscarDadosNecessariosParaOFormulario = async () => {
            try {
                const [respostaDasCategorias, respostaDasMarcas, respostaDosFornecedores] = await Promise.all([
                    instanciaAxios.get("/categorias"),
                    instanciaAxios.get("/marcas"),
                    instanciaAxios.get("/fornecedores")
                ]);
                setListaDeCategoriasCadastradas(respostaDasCategorias.data);
                setListaDeMarcasCadastradas(respostaDasMarcas.data);
                setListaDeFornecedoresCadastrados(respostaDosFornecedores.data);
            } catch {
                setMensagemDeErroDoServidor("Não foi possível carregar os dados de apoio do servidor.");
            }
        };
        buscarDadosNecessariosParaOFormulario();
    }, []);

    const adicionarNovoFornecedorAoVinculo = (identificadorDoFornecedor: string) => {
        if (identificadorDoFornecedor && !listaDeIdentificadoresDosFornecedores.includes(identificadorDoFornecedor)) {
            setListaDeIdentificadoresDosFornecedores([...listaDeIdentificadoresDosFornecedores, identificadorDoFornecedor]);
        }
    };

    const removerFornecedorDoVinculoExistente = (identificadorParaRemover: string) => {
        setListaDeIdentificadoresDosFornecedores(listaAtual => 
            listaAtual.filter(identificador => identificador !== identificadorParaRemover)
        );
    };

    const formatarValorParaMoedaBrasileira = (valorDigitado: string) => {
        const somenteNumeros = valorDigitado.replace(/\D/g, "");
        if (!somenteNumeros) return "";
        return (Number(somenteNumeros) / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    const validarEEnviarFormularioDeCadastro = async (eventoDeSubmissao: FormEvent<HTMLFormElement>) => {
        eventoDeSubmissao.preventDefault();
        setDicionarioDeErrosDeValidacao({});
        setMensagemDeErroDoServidor(null);

        const errosEncontradosNaValidacao: Record<string, string> = {};
        if (!nomeDoProdutoParaCadastro.trim()) errosEncontradosNaValidacao.nome = "O nome é obrigatório.";
        if (!precoDeVendaFormatado || precoDeVendaFormatado === "R$ 0,00") errosEncontradosNaValidacao.preco = "O preço é obrigatório.";
        if (!quantidadeInicialEmEstoque) errosEncontradosNaValidacao.quantidade = "O estoque é obrigatório.";
        if (!identificadorDaCategoriaSelecionada) errosEncontradosNaValidacao.categoria = "Selecione uma categoria.";
        if (!identificadorDaMarcaSelecionada) errosEncontradosNaValidacao.marca = "Selecione uma marca.";
        if (listaDeIdentificadoresDosFornecedores.length === 0) errosEncontradosNaValidacao.fornecedores = "Vincule um fornecedor.";

        if (Object.keys(errosEncontradosNaValidacao).length > 0) {
            setDicionarioDeErrosDeValidacao(errosEncontradosNaValidacao);
            setMensagemDeErroDoServidor("Preencha os campos destacados.");
            return;
        }

        setEstaProcessandoDados(true);
        const precoNumericoParaBanco = precoDeVendaFormatado.replace("R$", "").replace(/\./g, "").replace(",", ".").trim();

        const formatadorDeDadosParaEnvio = new FormData();
        formatadorDeDadosParaEnvio.append("nome", nomeDoProdutoParaCadastro);
        formatadorDeDadosParaEnvio.append("preco", precoNumericoParaBanco);
        formatadorDeDadosParaEnvio.append("quantidade", quantidadeInicialEmEstoque);
        formatadorDeDadosParaEnvio.append("descricao", descricaoDetalhadaDoProduto);
        formatadorDeDadosParaEnvio.append("ativo", String(produtoSeraExibidoComoAtivo));
        formatadorDeDadosParaEnvio.append("destaque", String(produtoSeraExibidoComoDestaque));
        formatadorDeDadosParaEnvio.append("categoriaId", identificadorDaCategoriaSelecionada);
        formatadorDeDadosParaEnvio.append("marcaId", identificadorDaMarcaSelecionada);
        formatadorDeDadosParaEnvio.append("fornecedores", JSON.stringify(listaDeIdentificadoresDosFornecedores));
        
        if (arquivoDaImagemSelecionada) formatadorDeDadosParaEnvio.append("imagem", arquivoDaImagemSelecionada);

        try {
            const resposta = await instanciaAxios.post("/produto", formatadorDeDadosParaEnvio);
            setMensagemDeSucessoDoServidor(resposta.data.message || "Produto cadastrado com sucesso!");
            setTimeout(() => window.location.href = "/produto/lista", 2500);
        } catch (erro: any) {
            setMensagemDeErroDoServidor(erro.response?.data?.message || "Erro ao salvar produto.");
        } finally {
            setEstaProcessandoDados(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><MenuNavegacao /></header>

            {mensagemDeErroDoServidor && <AlertMessage type="error" message={mensagemDeErroDoServidor} onClose={() => setMensagemDeErroDoServidor(null)} />}
            {mensagemDeSucessoDoServidor && <AlertMessage type="success" message={mensagemDeSucessoDoServidor} onClose={() => setMensagemDeSucessoDoServidor(null)} />}

            <div className="flex flex-1">
                <BarraLateral />
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
                                <p className="text-slate-500 mt-2 font-medium">Cadastre itens novos no catálogo de vendas</p>
                            </div>
                            <LinkNavegacao href="/produto/lista" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 shadow-sm transition-all group">
                                <ListFilter className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" /> Listar Produtos
                            </LinkNavegacao>
                        </header>

                        <form onSubmit={validarEEnviarFormularioDeCadastro} className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200 p-8 md:p-12 rounded-[2rem] shadow-sm">
                            
                            {/* NOME */}
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Tag className="w-4 h-4 text-indigo-600" /> Nome do Produto
                                </label>
                                <input 
                                    type="text" value={nomeDoProdutoParaCadastro} 
                                    onChange={(campo) => setNomeDoProdutoParaCadastro(campo.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioDeErrosDeValidacao.nome ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600"}`}
                                    placeholder="Ex: iPhone 15 Pro Max"
                                />
                                {dicionarioDeErrosDeValidacao.nome && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioDeErrosDeValidacao.nome}</span>}
                            </div>

                            {/* PREÇO */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <DollarSign className="w-4 h-4 text-indigo-600" /> Preço de Venda
                                </label>
                                <input 
                                    type="text" value={precoDeVendaFormatado} 
                                    onChange={(campo) => setPrecoDeVendaFormatado(formatarValorParaMoedaBrasileira(campo.target.value))}
                                    placeholder="R$ 0,00"
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioDeErrosDeValidacao.preco ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600"}`}
                                />
                            </div>

                            {/* ESTOQUE */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Layers className="w-4 h-4 text-indigo-600" /> Estoque Inicial
                                </label>
                                <input 
                                    type="number" min="0" value={quantidadeInicialEmEstoque} 
                                    onChange={(campo) => setQuantidadeInicialEmEstoque(campo.target.value)}
                                    className={`w-full p-4 rounded-2xl border outline-none transition-all ${dicionarioDeErrosDeValidacao.quantidade ? "border-red-500 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-indigo-600"}`}
                                />
                            </div>

                            {/* CATEGORIA */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Smartphone className="w-4 h-4 text-indigo-600" /> Categoria
                                </label>
                                <select 
                                    value={identificadorDaCategoriaSelecionada} 
                                    onChange={(campo) => setIdentificadorDaCategoriaSelecionada(campo.target.value)}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600"
                                >
                                    {listaDeCategoriasCadastradas.map(categoria => (
                                        <option key={categoria.id} value={categoria.id}>
                                            {categoria.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* MARCA */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Factory className="w-4 h-4 text-indigo-600" /> Marca Fabricante
                                </label>
                                <select 
                                    value={identificadorDaMarcaSelecionada} 
                                    onChange={(campo) => setIdentificadorDaMarcaSelecionada(campo.target.value)}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600"
                                >
                                    <option value="">Selecione...</option>
                                    {listaDeMarcasCadastradas.map(marca => <option key={marca.id} value={marca.id}>{marca.nome}</option>)}
                                </select>
                            </div>

                            {/* STATUS ATIVO/INATIVO (CORES SEMÂNTICAS) */}
                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Status de Exibição do Produto
                                </label>
                                <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setProdutoSeraExibidoComoAtivo(true)}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${produtoSeraExibidoComoAtivo ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Ativo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProdutoSeraExibidoComoAtivo(false)}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${!produtoSeraExibidoComoAtivo ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <XCircle className="w-4 h-4" /> Inativo
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-3">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Tag className="w-4 h-4 text-indigo-600" /> Produto em Destaque na Vitrine?
                                </label>
                                <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setProdutoSeraExibidoComoDestaque(true)}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${produtoSeraExibidoComoDestaque ? 'bg-white text-green-600 shadow-sm border border-green-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Sim, destacar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setProdutoSeraExibidoComoDestaque(false)}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${!produtoSeraExibidoComoDestaque ? 'bg-white text-red-600 shadow-sm border border-red-100' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <XCircle className="w-4 h-4" /> Não destacar
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <IconeImagem className="w-4 h-4 text-indigo-600" /> Imagem do Produto
                                </label>
                                <input 
                                    type="file" accept="image/*"
                                    onChange={(campo) => setArquivoDaImagemSelecionada(campo.target.files ? campo.target.files[0] : null)}
                                    className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-2xl file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-bold cursor-pointer"
                                />
                            </div>

                            {/* FORNECEDORES */}
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <Users className="w-4 h-4 text-indigo-600" /> Vínculo com Fornecedores
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {listaDeIdentificadoresDosFornecedores.map(identificadorRecebido => {
                                        // Buscamos o objeto completo usando o .id da interface
                                        const fornecedorEncontrado = listaDeFornecedoresCadastrados.find(
                                            (fornecedor) => fornecedor.id === Number(identificadorRecebido)
                                        );
                                        return (
                                            <span 
                                                key={identificadorRecebido} 
                                                className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold border border-indigo-100 animate-in fade-in zoom-in duration-300"
                                            >
                                                {fornecedorEncontrado?.nomeFantasia}
                                                <X 
                                                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                                    onClick={() => removerFornecedorDoVinculoExistente(identificadorRecebido)} 
                                                />
                                            </span>
                                        );
                                    })}
                                </div>
                                <select 
                                    onChange={(campo) => { 
                                        adicionarNovoFornecedorAoVinculo(campo.target.value); 
                                        campo.target.value = ""; 
                                    }}
                                    className={`w-full p-4 rounded-2xl border outline-none bg-slate-50 transition-all ${
                                        dicionarioDeErrosDeValidacao.fornecedores 
                                        ? "border-red-500 bg-red-50" 
                                        : "border-slate-200 focus:border-indigo-600"
                                    }`}
                                >
                                    <option value="">Adicionar fornecedor...</option>
                                    {listaDeFornecedoresCadastrados.map((fornecedor) => (
                                        <option key={fornecedor.id} value={fornecedor.id}>
                                            {fornecedor.nomeFantasia}
                                        </option>
                                    ))}
                                </select>
                                {dicionarioDeErrosDeValidacao.fornecedores && (
                                    <span className="text-red-500 text-xs font-bold ml-1">
                                        {dicionarioDeErrosDeValidacao.fornecedores}
                                    </span>
                                )}
                            </div>

                            {/* DESCRIÇÃO */}
                            <div className="md:col-span-2 flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2 uppercase tracking-wide">
                                    <AlignLeft className="w-4 h-4 text-indigo-600" /> Descrição Detalhada
                                </label>
                                <textarea 
                                    rows={4} value={descricaoDetalhadaDoProduto}
                                    onChange={(campo) => setDescricaoDetalhadaDoProduto(campo.target.value)}
                                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 resize-none"
                                    placeholder="Características técnicas, diferenciais..."
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end pt-8 border-t border-slate-50 mt-4">
                                <button 
                                    type="submit" disabled={estaProcessandoDados}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {estaProcessandoDados ? "Processando..." : <><Save className="w-5 h-5" /> Salvar Produto</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            <RodapePagina />
        </div>
    );
};
export default CadastroDeProduto;