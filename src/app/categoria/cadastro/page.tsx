'use client'

import axios, { AxiosError } from 'axios';
import instancia from "@/src/service/api";
import React, { useState, useEffect } from 'react';
import AlertMessage from '@/src/utils/Alert';
import Menu from '@/src/components/Menu';
import Sidebar from '@/src/components/Sidebar';
import Footer from "@/src/components/Footer";
import { ArrowLeft, LayoutGrid, ListFilter, Save, Tag } from 'lucide-react';
import Link from 'next/link';

// Interfaces Estritas
interface ICategoria {
    id: number;
    nome: string;
}

interface ApiError {
    message: string;
}

const CadastroCategoria = () => {
    // Estados de dados
    const [nome, setNome] = useState<string>("");
    const [dbCategorias, setDbCategorias] = useState<ICategoria[]>([]);
    
    // Estados de Feedback
    const [erros, setErros] = useState<Record<string, string>>({}); 
    const [error, setError] = useState<string | null>(null);         
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Sincronização inicial
    useEffect(() => {
        instancia.get<ICategoria[]>("/categorias")
            .then(resposta => setDbCategorias(resposta.data))
            .catch(() => setError("Erro ao sincronizar lista de categorias."));
    }, []);

    // Limpa erro específico ao digitar
    const handleInput = (texto: string): void => {
        setNome(texto);
        if (erros.nome) {
            setErros(({ nome, ...resto }) => resto);
        }
    };

    // Submissão do Formulário
    const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>): Promise<void> => {
        evento.preventDefault();
        setErros({});   
        setError(null); 
        setSuccess(null);

        const novosErros: Record<string, string> = {};

        // Validação Front-end
        if (!nome?.trim()) {
            novosErros.nome = "O nome da categoria é obrigatório!";
        } else if (nome[0] !== nome[0].toUpperCase()) {
            novosErros.nome = "O nome da categoria deve começar com letra maiúscula!";
        }

        const duplicado = dbCategorias.some(categoria => categoria.nome.toLowerCase() === nome.toLowerCase());
        if (duplicado) {
            novosErros.nome = "Categoria já cadastrada!";
        }

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            return;
        }

        setIsSubmitting(true);

        try {
            const resposta = await instancia.post("/categoria", { nome });
            setSuccess(resposta.data.message || "Nova categoria cadastrada com sucesso");
            setNome("");
            
            // Atualiza lista local após cadastro
            const atualizada = await instancia.get<ICategoria[]>("/categorias");
            setDbCategorias(atualizada.data);

        } catch (erro: unknown) {
            if (axios.isAxiosError(erro)) {
                const axiosError = erro as AxiosError<ApiError>;
                setError(axiosError.response?.data?.message || "Erro interno ao cadastrar!");
            } else {
                setError("Erro inesperado ao conectar com o servidor.");
            }
        } finally {
            setIsSubmitting(false);
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
                                        <Tag className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Nova Categoria
                                    </h1>
                                </div>
                            </header>

                            <div className="flex items-center gap-3">
                                <Link href="/categoria/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                                    <ListFilter className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                    Listar Categorias
                                </Link>
                                <Link href="/dashboard" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            {error && <AlertMessage type="error" message={error} />}
                            {success && <AlertMessage type="success" message={success} />}
                        </div>

                        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <LayoutGrid className="w-4 h-4 text-indigo-500" /> Nome da Categoria
                                    </label>
                                    <input
                                        type="text"
                                        value={nome}
                                        placeholder="Digite aqui o nome da categoria!"
                                        onChange={(evento: React.ChangeEvent<HTMLInputElement>) => handleInput(evento.target.value)}
                                        className={`w-full p-4 bg-slate-50 border ${erros.nome ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400`}
                                    />
                                    
                                    {erros.nome && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {erros.nome}
                                        </p>
                                    )}

                                    <p className="text-[11px] text-slate-400 ml-1">
                                        * O nome deve obrigatoriamente iniciar com letra maiúscula.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-slate-50">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Salvando..." : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Salvar Categoria
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default CadastroCategoria;