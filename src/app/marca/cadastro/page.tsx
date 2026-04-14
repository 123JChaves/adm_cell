'use client'

import axios, { AxiosError } from 'axios';
import instancia from "@/src/service/api";
import React, { useState, useEffect } from 'react';
import AlertMessage from '@/src/utils/Alert';
import Menu from '@/src/components/Menu';
import Sidebar from '@/src/components/Sidebar';
import Footer from "@/src/components/Footer";
import { ArrowLeft, LayoutGrid, ListFilter, Save, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

interface IMarca {
    id: number;
    nome: string;
    ativo: boolean;
}

interface ApiError {
    message: string;
}

const CadastroMarca = () => {
    const [nome, setNome] = useState<string>("");
    const [estaAtivo, setEstaAtivo] = useState<boolean>(true);
    const [listaMarcasExistentes, setListaMarcasExistentes] = useState<IMarca[]>([]);
    
    const [errosValidacao, setErrosValidacao] = useState<Record<string, string>>({}); 
    const [mensagemErro, setMensagemErro] = useState<string | null>(null);         
    const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
    const [estaSubmetendo, setEstaSubmetendo] = useState<boolean>(false);

    useEffect(() => {
        instancia.get<IMarca[]>("/marcas")
            .then(respostaApi => setListaMarcasExistentes(respostaApi.data))
            .catch(() => setMensagemErro("Erro ao sincronizar lista de marcas."));
    }, []);

    const tratarMudancaNome = (valorDigitado: string): void => {
        setNome(valorDigitado);
        if (errosValidacao.nome) {
            setErrosValidacao(({ nome, ...outrosErros }) => outrosErros);
        }
    };

    const processarEnvioFormulario = async (eventoForm: React.FormEvent<HTMLFormElement>): Promise<void> => {
        eventoForm.preventDefault();
        setErrosValidacao({});   
        setMensagemErro(null); 
        setMensagemSucesso(null);

        const novosErros: Record<string, string> = {};

        if (!nome?.trim()) {
            novosErros.nome = "O nome da marca é obrigatório!";
        } else if (nome[0] !== nome[0].toUpperCase()) {
            novosErros.nome = "O nome deve começar com letra maiúscula!";
        }

        const marcaJaExiste = listaMarcasExistentes.some(
            (marca) => marca.nome.toLowerCase() === nome.toLowerCase()
        );

        if (marcaJaExiste) {
            novosErros.nome = "Esta marca já está cadastrada!";
        }

        if (Object.keys(novosErros).length > 0) {
            setErrosValidacao(novosErros);
            return;
        }

        setEstaSubmetendo(true);

        try {
            const respostaPost = await instancia.post("/marca", { 
                nome: nome, 
                ativo: estaAtivo 
            });
            
            setMensagemSucesso(respostaPost.data.message);
            setNome("");
            setEstaAtivo(true);
            
            const respostaAtualizada = await instancia.get<IMarca[]>("/marcas");
            setListaMarcasExistentes(respostaAtualizada.data);

        } catch (erroDesconhecido: unknown) {
            if (axios.isAxiosError(erroDesconhecido)) {
                const erroServidor = erroDesconhecido as AxiosError<ApiError>;
                setMensagemErro(erroServidor.response?.data?.message || "Erro ao cadastrar marca!");
            } else {
                setMensagemErro("Ocorreu um erro inesperado.");
            }
        } finally {
            setEstaSubmetendo(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Menu />
            <div className="flex flex-1"> 
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12">
                    <div className="max-w-5xl mx-auto">
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <header>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <ShieldCheck className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Nova Marca
                                    </h1>
                                </div>
                            </header>

                            <div className="flex items-center gap-3">
                                <Link href="/marca/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                                    <ListFilter className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                    Listar Marcas
                                </Link>
                                <Link href="/dashboard" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            <AlertMessage type="error" message={mensagemErro} />
                            <AlertMessage type="success" message={mensagemSucesso} />
                        </div>

                        <form onSubmit={processarEnvioFormulario} className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <LayoutGrid className="w-4 h-4 text-indigo-500" /> Nome da Marca
                                    </label>
                                    <input
                                        type="text"
                                        value={nome}
                                        placeholder="Ex: Samsung, Apple, Xiaomi..."
                                        onChange={(eventoInput) => tratarMudancaNome(eventoInput.target.value)}
                                        className={`w-full p-4 bg-slate-50 border ${errosValidacao.nome ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400`}
                                    />
                                    {errosValidacao.nome && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {errosValidacao.nome}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        Status da Marca
                                    </label>
                                    <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
                                        <button
                                            type="button"
                                            onClick={() => setEstaAtivo(true)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${estaAtivo ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Ativa
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEstaAtivo(false)}
                                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${!estaAtivo ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <XCircle className="w-4 h-4" /> Inativa
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8 mt-8 border-t border-slate-100">
                                <button 
                                    type="submit" 
                                    disabled={estaSubmetendo}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {estaSubmetendo ? "Processando..." : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Salvar Marca
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

export default CadastroMarca;