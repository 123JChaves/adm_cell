"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import AlertMessage from "@/src/utils/Alert";
import { Save, ArrowLeft, Tag, CheckCircle2, XCircle, LayoutGrid, ListFilter } from "lucide-react";
import Link from "next/link";

const EditarCategoriaExistente = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    
    // Forçamos a captura do identificador de forma segura
    const identificadorDaCategoriaNoBanco = parametrosDaRota?.id;

    const [nomeDaCategoriaParaEdicao, setNomeDaCategoriaParaEdicao] = useState<string>("");
    const [statusAtivoDaCategoria, setStatusAtivoDaCategoria] = useState<boolean>(true);

    const [mensagemDeErroDeProcessamento, setMensagemDeErroDeProcessamento] = useState<string | null>(null);
    const [mensagemDeSucessoDeProcessamento, setMensagemDeSucessoDeProcessamento] = useState<string | null>(null);
    const [estaCarregandoDadosDoServidor, setEstaCarregandoDadosDoServidor] = useState<boolean>(true);

    useEffect(() => {
        const carregarInformacoesDaCategoria = async () => {
            if (!identificadorDaCategoriaNoBanco) return;

            try {
                const respostaDaRequisicao = await instancia.get(`/categoria/${identificadorDaCategoriaNoBanco}`);
                
                const dadosDoServidor = respostaDaRequisicao.data;
                
                if (dadosDoServidor && dadosDoServidor.categoria) {
                    setNomeDaCategoriaParaEdicao(dadosDoServidor.categoria.nome);
                    setStatusAtivoDaCategoria(dadosDoServidor.categoria.ativo);
                }
            } catch (erroDeComunicacao) {
                setMensagemDeErroDeProcessamento("Falha ao localizar o nome da categoria no servidor.");
            } finally {
                setEstaCarregandoDadosDoServidor(false);
            }
        };

        carregarInformacoesDaCategoria();
    }, [identificadorDaCategoriaNoBanco]); // Monitora o ID para disparar quando ele surgir

    const enviarDadosAtualizadosParaOServidor = async (eventoDeSubmissao: React.FormEvent) => {
        eventoDeSubmissao.preventDefault();
        setMensagemDeErroDeProcessamento(null);
        setMensagemDeSucessoDeProcessamento(null);
        
        const nomeParaValidar = nomeDaCategoriaParaEdicao.trim();
        if (nomeParaValidar[0] !== nomeParaValidar[0].toUpperCase()) {
            setMensagemDeErroDeProcessamento("O nome da categoria deve obrigatoriamente iniciar com letra maiúscula.");
            return;
        }

        try {
            const cargaUtilDeAtualizacao = {
                nome: nomeParaValidar,
                ativo: !!statusAtivoDaCategoria // A dupla exclamação força a conversão para boolean puro
            };

            const respostaDoServidor = await instancia.put(
                `/categoria/${identificadorDaCategoriaNoBanco}`, 
                cargaUtilDeAtualizacao
            );
            if (respostaDoServidor.status === 200 || respostaDoServidor.status === 204) {
                setMensagemDeSucessoDeProcessamento("As informações da categoria foram atualizadas com sucesso!");
                
                setTimeout(() => {
                    navegadorDePaginas.push("/categoria/lista");
                }, 1500);
            }

        } catch (erroDeComunicacao) {
            const mensagemVindaDoServidor = (erroDeComunicacao as any).response?.data?.message;
            setMensagemDeErroDeProcessamento(mensagemVindaDoServidor || "Ocorreu uma falha técnica ao tentar salvar as alterações no servidor.");
        }
    };

    // Enquanto o identificador ou os dados não chegam, mostramos o estado de carregamento
    if (estaCarregandoDadosDoServidor && identificadorDaCategoriaNoBanco) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
                <p className="font-black text-slate-400 uppercase italic animate-pulse">
                    Buscando nome atual...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            
            {mensagemDeErroDeProcessamento && <AlertMessage type="error" message={mensagemDeErroDeProcessamento} onClose={() => setMensagemDeErroDeProcessamento(null)} />}
            {mensagemDeSucessoDeProcessamento && <AlertMessage type="success" message={mensagemDeSucessoDeProcessamento} onClose={() => setMensagemDeSucessoDeProcessamento(null)} />}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-4xl mx-auto">
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <Tag className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Editar Registro
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">
                                    Atualize as informações da categoria selecionada.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link href="/categoria/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                                    <ListFilter className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                    Listar Categorias
                                </Link>
                            </div>
                        </header>

                        <form onSubmit={enviarDadosAtualizadosParaOServidor} className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-sm space-y-10">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1 flex items-center gap-2">
                                        <LayoutGrid className="w-4 h-4 text-indigo-500" /> Nome da Categoria
                                    </label>
                                    <input 
                                        type="text" 
                                        value={nomeDaCategoriaParaEdicao} 
                                        onChange={(evento) => setNomeDaCategoriaParaEdicao(evento.target.value)}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black text-slate-700 uppercase ml-1">Status</label>
                                    <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                                        <button 
                                            type="button" 
                                            onClick={() => setStatusAtivoDaCategoria(true)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${statusAtivoDaCategoria ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> ATIVA
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => setStatusAtivoDaCategoria(false)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!statusAtivoDaCategoria ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                                        >
                                            <XCircle className="w-4 h-4" /> INATIVA
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100 flex justify-end">
                                <button type="submit" className="flex items-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                                    <Save className="w-5 h-5" /> Salvar Nome
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

export default EditarCategoriaExistente;