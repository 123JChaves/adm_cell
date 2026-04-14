'use client'

import axios, { AxiosError } from 'axios';
import instancia from "@/src/service/api";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AlertMessage from '@/src/utils/Alert';
import Menu from '@/src/components/Menu';
import Sidebar from '@/src/components/Sidebar';
import Footer from "@/src/components/Footer";
import { ArrowLeft, LayoutGrid, Save, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface IMarca {
    id: number;
    nome: string;
    ativo: boolean;
}

interface ApiError {
    message: string;
}

const EdicaoMarca = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDaMarca = parametrosDaRota.id;

    const [nome, setNome] = useState<string>("");
    const [estaAtivo, setEstaAtivo] = useState<boolean>(true);
    
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({}); 
    const [mensagemErro, setMensagemErro] = useState<string | null>(null);         
    const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
    const [estaCarregando, setEstaCarregando] = useState<boolean>(true);
    const [estaSubmetendo, setEstaSubmetendo] = useState<boolean>(false);

    useEffect(() => {
        const buscarDadosDaMarca = async () => {
            try {
                const respostaApi = await instancia.get<IMarca>(`/marca/${identificadorDaMarca}`);
                setNome(respostaApi.data.nome);
                setEstaAtivo(respostaApi.data.ativo);
            } catch {
                setMensagemErro("Não foi possível localizar os dados da marca.");
            } finally {
                setEstaCarregando(false);
            }
        };

        if (identificadorDaMarca) {
            buscarDadosDaMarca();
        }
    }, [identificadorDaMarca]);

    const processarAtualizacaoMarca = async (eventoForm: React.FormEvent<HTMLFormElement>): Promise<void> => {
        eventoForm.preventDefault();
        
        setErrosValidacao({});   
        setMensagemErro(null); 
        setMensagemSucesso(null);

        const nomeLimpo = nome.trim();

        if (!nomeLimpo) {
            setErrosValidacao({ nome: "O nome da marca é obrigatório!" });
            setMensagemErro("O nome da marca é obrigatório!");
            return;
        }

        // CORREÇÃO: Valida apenas o primeiro caractere [0]
        if (nomeLimpo[0] !== nomeLimpo[0].toUpperCase()) {
            setErrosValidacao({ nome: "O nome deve começar com letra maiúscula!" });
            setMensagemErro("O nome deve começar com letra maiúscula!");
            console.log("Valor que falhou na validação:", nomeLimpo);
            return;
        }

        setEstaSubmetendo(true);

        try {
            const respostaPut = await instancia.put(`/marca/${identificadorDaMarca}`, { 
                nome: nomeLimpo, 
                ativo: estaAtivo 
            });
            
            setMensagemSucesso(respostaPut.data.message || "Marca atualizada com sucesso!");
            
            setTimeout(() => {
                navegadorDePaginas.push("/marca/lista");
            }, 2000);

        } catch (erroDesconhecido: unknown) {
            if (axios.isAxiosError(erroDesconhecido)) {
                const erroServidor = erroDesconhecido as AxiosError<ApiError>;
                setMensagemErro(erroServidor.response?.data?.message || "Erro ao atualizar marca!");
            } else {
                setMensagemErro("Ocorreu um erro inesperado.");
            }
        } finally {
            setEstaSubmetendo(false);
        }
    };

    if (estaCarregando) {
        return (
            <div className="flex items-center justify-center h-screen font-black text-slate-400 uppercase italic animate-pulse">
                Sincronizando informações da marca...
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            {mensagemErro && <AlertMessage type="error" message={mensagemErro} onClose={() => setMensagemErro(null)} />}
            {mensagemSucesso && <AlertMessage type="success" message={mensagemSucesso} onClose={() => setMensagemSucesso(null)} />}

            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1"> 
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12">
                    <div className="max-w-5xl mx-auto">
                        
                        <div className="flex items-center justify-between mb-10">
                            <header>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md">
                                        <ShieldCheck className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                                        Editar Marca
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium uppercase text-xs tracking-widest">
                                    ID Interno: #{identificadorDaMarca}
                                </p>
                            </header>

                            <button 
                                onClick={() => navegadorDePaginas.back()}
                                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" /> Voltar
                            </button>
                        </div>

                        <form onSubmit={processarAtualizacaoMarca} className="bg-white border border-slate-200 shadow-sm rounded-[2.5rem] p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-800 flex items-center gap-2 ml-1 uppercase tracking-widest">
                                        <LayoutGrid className="w-4 h-4 text-indigo-500" /> Nome da Marca
                                    </label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(evento) => setNome(evento.target.value)}
                                        className={`w-full p-4 bg-slate-50 border ${errosValidacao.nome ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800`}
                                    />
                                    {errosValidacao.nome && <p className="text-xs text-red-500 font-bold ml-1">{errosValidacao.nome}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-black text-slate-800 flex items-center gap-2 ml-1 uppercase tracking-widest">
                                        Status da Marca
                                    </label>
                                    <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                                        <button
                                            type="button"
                                            onClick={() => setEstaAtivo(true)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${estaAtivo ? 'bg-white text-green-600 shadow-sm border border-green-50' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> ATIVA
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEstaAtivo(false)}
                                            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!estaAtivo ? 'bg-white text-red-600 shadow-sm border border-red-50' : 'text-slate-500 hover:bg-white/50'}`}
                                        >
                                            <XCircle className="w-4 h-4" /> INATIVA
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 mt-12 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={estaSubmetendo}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-12 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {estaSubmetendo ? "Gravando..." : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Confirmar Alterações
                                        </>
                                    )}
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

export default EdicaoMarca;