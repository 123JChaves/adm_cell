"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import AlertMessage from "@/src/utils/Alert";
import { Save, ArrowLeft, Smartphone, CheckCircle2, XCircle, Package, Plus, Minus } from "lucide-react";

const EditarDadosDoProdutoExistente = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDoProdutoNoBanco = parametrosDaRota.id;

    // ESTADOS PARA OS DADOS DO FORMULÁRIO
    const [nomeDoProdutoParaEdicao, setNomeDoProdutoParaEdicao] = useState<string>("");
    const [valorDeVendaComMascara, setValorDeVendaComMascara] = useState<string>("");
    const [quantidadeEmEstoqueParaEdicao, setQuantidadeEmEstoqueParaEdicao] = useState<string>("");
    
    // Novas variáveis para controle de movimentação
    const [quantidadeParaAdicionar, setQuantidadeParaAdicionar] = useState(0);
    const [operacaoEstoque, setOperacaoEstoque] = useState<"somar" | "subtrair">("somar");

    const [descricaoDetalhadaParaEdicao, setDescricaoDetalhadaParaEdicao] = useState<string>("");
    const [statusAtivoDoProduto, setStatusAtivoDoProduto] = useState<boolean>(true);
    const [produtoSeraExibidoComoDestaque, setProdutoSeraExibidoComoDestaque] = useState<boolean>(false);
    const [arquivoDeImagemParaAtualizacao, setArquivoDeImagemParaAtualizacao] = useState<File | null>(null);

    // ESTADOS DE CONTROLE DE INTERFACE
    const [mensagemDeErroDeProcessamento, setMensagemDeErroDeProcessamento] = useState<string | null>(null);
    const [mensagemDeSucessoDeProcessamento, setMensagemDeSucessoDeProcessamento] = useState<string | null>(null);
    const [estaCarregandoDadosDoServidor, setEstaCarregandoDadosDoServidor] = useState<boolean>(true);

    const formatarTextoParaMoedaBrasileira = (valorParaFormatar: string): string => {
        const apenasNumerosDigitados = valorParaFormatar.replace(/\D/g, "");
        if (!apenasNumerosDigitados) return "";
        const valorNumericoConvertido = Number(apenasNumerosDigitados) / 100;
        return valorNumericoConvertido.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    };

    useEffect(() => {
        const carregarInformacoesDoProdutoPeloIdentificador = async () => {
            try {
                const respostaDaRequisicao = await instancia.get(`/produto/${identificadorDoProdutoNoBanco}`);
                const dadosOriginaisDoProduto = respostaDaRequisicao.data;
                
                setNomeDoProdutoParaEdicao(dadosOriginaisDoProduto.nome);
                setQuantidadeEmEstoqueParaEdicao(dadosOriginaisDoProduto.quantidade.toString());
                setDescricaoDetalhadaParaEdicao(dadosOriginaisDoProduto.descricao || "");
                setStatusAtivoDoProduto(dadosOriginaisDoProduto.ativo);
                setProdutoSeraExibidoComoDestaque(dadosOriginaisDoProduto.destaque || false);

                const valorNumericoLimpo = (dadosOriginaisDoProduto.preco * 100).toFixed(0);
                setValorDeVendaComMascara(formatarTextoParaMoedaBrasileira(valorNumericoLimpo));

            } catch (erroDeComunicacao) {
                setMensagemDeErroDeProcessamento("Não foi possível recuperar os dados do produto para edição.");
            } finally {
                setEstaCarregandoDadosDoServidor(false);
            }
        };

        if (identificadorDoProdutoNoBanco) {
            carregarInformacoesDoProdutoPeloIdentificador();
        }
    }, [identificadorDoProdutoNoBanco]);

    const gerenciarMudancaNoCampoDePreco = (eventoDeDigitacao: React.ChangeEvent<HTMLInputElement>): void => {
        const valorFormatado = formatarTextoParaMoedaBrasileira(eventoDeDigitacao.target.value);
        setValorDeVendaComMascara(valorFormatado);
    };

    const enviarDadosAtualizadosParaOServidor = async (eventoDeEnvio: React.FormEvent) => {
        eventoDeEnvio.preventDefault();
        setMensagemDeErroDeProcessamento(null);

        // Lógica de cálculo: soma ou subtrai do valor original vindo do banco
        const estoqueBase = Number(quantidadeEmEstoqueParaEdicao);
        const valorMovimentacao = Number(quantidadeParaAdicionar);
        const estoqueFinalCalculado = operacaoEstoque === "somar" 
            ? estoqueBase + valorMovimentacao 
            : estoqueBase - valorMovimentacao;

        // Garante que o estoque não seja enviado como número negativo
        const estoqueSeguro = Math.max(0, estoqueFinalCalculado);

        const valorNumericoPuroParaBanco = Number(valorDeVendaComMascara.replace(/\D/g, "")) / 100;

        const formatadorDeDadosMultipart = new FormData();
        formatadorDeDadosMultipart.append("nome", nomeDoProdutoParaEdicao);
        formatadorDeDadosMultipart.append("preco", valorNumericoPuroParaBanco.toString());
        
        // Envia o resultado do cálculo
        formatadorDeDadosMultipart.append("quantidade", estoqueSeguro.toString());
        
        formatadorDeDadosMultipart.append("descricao", descricaoDetalhadaParaEdicao);
        formatadorDeDadosMultipart.append("ativo", String(statusAtivoDoProduto));
        formatadorDeDadosMultipart.append("destaque", String(produtoSeraExibidoComoDestaque));
        
        if (arquivoDeImagemParaAtualizacao) {
            formatadorDeDadosMultipart.append("imagem", arquivoDeImagemParaAtualizacao);
        }

        try {
            await instancia.put(`/produto/${identificadorDoProdutoNoBanco}`, formatadorDeDadosMultipart);
            setMensagemDeSucessoDeProcessamento("As informações do produto foram atualizadas com sucesso!");
            setTimeout(() => navegadorDePaginas.push("/produto/lista"), 2000);
        } catch (erroAoSalvar) {
            setMensagemDeErroDeProcessamento("Houve um erro técnico ao tentar salvar as alterações no servidor.");
        }
    };


        return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full">
                <Menu />
            </header>
            
            {mensagemDeErroDeProcessamento && (
                <AlertMessage type="error" message={mensagemDeErroDeProcessamento} 
                onClose={() => setMensagemDeErroDeProcessamento(null)} />
            )}
            {mensagemDeSucessoDeProcessamento && (
                <AlertMessage type="success" message={mensagemDeSucessoDeProcessamento} 
                onClose={() => setMensagemDeSucessoDeProcessamento(null)} />
            )}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-4xl mx-auto">
                        
                        <header className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
                                    <Smartphone className="text-white w-6 h-6" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Registro</h1>
                            </div>
                            <button onClick={() => navegadorDePaginas.back()} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors active:scale-90">
                                <ArrowLeft className="w-7 h-7" />
                            </button>
                        </header>

                        <form onSubmit={enviarDadosAtualizadosParaOServidor} className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Denominação do Produto</label>
                                    <input 
                                        type="text" value={nomeDoProdutoParaEdicao} 
                                        onChange={(eventoDeMudanca) => setNomeDoProdutoParaEdicao(eventoDeMudanca.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Valor de Venda</label>
                                    <input 
                                        type="text" value={valorDeVendaComMascara} 
                                        onChange={gerenciarMudancaNoCampoDePreco}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Campo 1: Estoque Atual (Apenas Leitura) */}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                                            Estoque Atual
                                        </label>
                                        <div className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-100 text-slate-500 font-bold flex items-center gap-2 cursor-not-allowed">
                                            <Package className="w-4 h-4" /> {quantidadeEmEstoqueParaEdicao} unidades
                                        </div>
                                    </div>

                                    {/* Campo 2: Movimentação (Soma/Subtração e Sem Zero à Esquerda) */}
                                    <div className="flex flex-col gap-2">
                                        <label className={`text-[10px] font-black uppercase ml-1 tracking-widest ${operacaoEstoque === 'somar' ? 'text-indigo-600' : 'text-red-600'}`}>
                                            {operacaoEstoque === 'somar' ? 'Somar Itens' : 'Subtrair Itens'}
                                        </label>
                                        <div className="flex gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setOperacaoEstoque(previa => previa === 'somar' ? 'subtrair' : 'somar')}
                                                className={`flex items-center justify-center w-12 rounded-xl border transition-all ${operacaoEstoque === 'somar' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-red-50 border-red-200 text-red-600'}`}
                                            >
                                                {operacaoEstoque === 'somar' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            </button>
                                            <input 
                                                type="number" 
                                                min="0"
                                                placeholder="0"
                                                value={quantidadeParaAdicionar === 0 ? "" : quantidadeParaAdicionar} 
                                                onChange={(eventoDeAdicao) => setQuantidadeParaAdicionar(eventoDeAdicao.target.value === "" ? 0 : Number(eventoDeAdicao.target.value))}
                                                className={`w-full p-4 rounded-2xl border outline-none font-bold transition-all focus:ring-4 ${operacaoEstoque === 'somar' ? 'border-indigo-200 focus:border-indigo-600 focus:ring-indigo-500/10 text-indigo-700' : 'border-red-200 focus:border-red-600 focus:ring-red-500/10 text-red-700'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Disponibilidade</label>
                                    <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                                        <button 
                                            type="button" onClick={() => setStatusAtivoDoProduto(true)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${statusAtivoDoProduto ? 'bg-white text-green-600 shadow-sm border border-green-50' : 'text-slate-500'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> ATIVO
                                        </button>
                                        <button 
                                            type="button" onClick={() => setStatusAtivoDoProduto(false)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!statusAtivoDoProduto ? 'bg-white text-red-600 shadow-sm border border-red-50' : 'text-slate-500'}`}
                                        >
                                            <XCircle className="w-4 h-4" /> INATIVO
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Destaque na Vitrine</label>
                                    <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                                        <button 
                                            type="button" onClick={() => setProdutoSeraExibidoComoDestaque(true)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${produtoSeraExibidoComoDestaque ? 'bg-white text-green-600 shadow-sm border border-green-50' : 'text-slate-500'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> SIM
                                        </button>
                                        <button 
                                            type="button" onClick={() => setProdutoSeraExibidoComoDestaque(false)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!produtoSeraExibidoComoDestaque ? 'bg-white text-red-600 shadow-sm border border-red-50' : 'text-slate-500'}`}
                                        >
                                            <XCircle className="w-4 h-4" /> NÃO
                                        </button>
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Substituir Imagem do Produto</label>
                                    <div className="relative group">
                                        <input 
                                            type="file" accept="image/*"
                                            onChange={(eventoDeArquivo) => setArquivoDeImagemParaAtualizacao(eventoDeArquivo.target.files ? eventoDeArquivo.target.files[0] : null)}
                                            className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                                        />
                                        <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Descrição Detalhada</label>
                                    <textarea 
                                        rows={5} value={descricaoDetalhadaParaEdicao}
                                        onChange={(eventoDeMudanca) => setDescricaoDetalhadaParaEdicao(eventoDeMudanca.target.value)}
                                        className="w-full p-6 rounded-[2rem] border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 transition-all font-medium text-slate-700 resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end">
                                <button type="submit" className="flex items-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 group">
                                    <Save className="w-5 h-5 transition-transform group-hover:scale-110" />
                                    Confirmar Alterações
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

export default EditarDadosDoProdutoExistente;