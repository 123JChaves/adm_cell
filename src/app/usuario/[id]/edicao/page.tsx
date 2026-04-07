'use client'

import axios, { AxiosError } from 'axios';
import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AlertMessage from '@/src/utils/Alert';
import { Pencil, ArrowLeft, ShieldCheck, Mail, Fingerprint, Lock, Save, Loader2, Users, User } from 'lucide-react';

interface ApiError {
    message: string;
}

const EdicaoUsuario = () => {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;

    // Estados de Dados
    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [senha, setSenha] = useState<string>(""); // Opcional na edição

    // Estados de Feedback
    const [loading, setLoading] = useState<boolean>(true);
    const [erros, setErros] = useState<Record<string, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Buscar dados do usuário ao carregar
    useEffect(() => {
        const carregarUsuario = async () => {
            try {
                setLoading(true);
                const resposta = await instancia.get(`/usuario/${id}`);
                const { nome, email, cpf } = resposta.data;
                setNome(nome);
                setEmail(email);
                setCpf(cpf);
            } catch (err) {
                setError("Erro ao carregar dados do usuário.");
            } finally {
                setLoading(false);
            }
        };

        if (id) carregarUsuario();
    }, [id]);

    const handleInputChange = (campo: string, valor: string, setter: (val: string) => void) => {
        setter(valor);
        if (erros[campo]) {
            setErros(prev => {
                const novo = { ...prev };
                delete novo[campo];
                return novo;
            });
        }
    };

    const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>): Promise<void> => {
        evento.preventDefault();
        setErros({});
        setError(null);
        setIsSubmitting(true);

        try {
            // Na edição, enviamos apenas o que mudou ou os dados obrigatórios
            await instancia.put(`/usuario/${id}`, { nome, email, cpf, senha: senha || undefined });
            setSuccess("Usuário atualizado com sucesso!");
            
            // Redireciona após 2 segundos
            setTimeout(() => router.push(`/usuario/${id}`), 2000);
        } catch (erro) {
            if (axios.isAxiosError(erro)) {
                const axiosError = erro as AxiosError<ApiError>;
                setError(axiosError.response?.data?.message || "Erro ao atualizar!");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
                <Menu />
            </div>

            <div className="flex flex-1 mt-16 h-full"> 
                <aside className="fixed left-0 top-16 bottom-0 w-64 hidden md:block border-r border-slate-200 bg-white z-40">
                    <Sidebar />
                </aside>

                <main className="flex-1 md:ml-64 overflow-y-auto p-6 md:p-12 pb-24 text-slate-900">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Header atualizado com botões de Listagem e Detalhes */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <header>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-500 rounded-xl shadow-md shadow-amber-100">
                                        <Pencil className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Editar Usuário
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium italic">
                                    Alterando registro ID #{id}
                                </p>
                            </header>

                            <div className="flex items-center gap-3">
                                {/* Botão para Listagem */}
                                <Link href="/usuario/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                    <Users className="w-4 h-4 text-indigo-600" />
                                    Listagem
                                </Link>

                                {/* Botão para Visualização (Detalhes) */}
                                <Link href={`/usuario/${id}`} 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                    <User className="w-4 h-4 text-emerald-600" />
                                    Visualizar Perfil
                                </Link>

                                <Link href={`/usuario/${id}`} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            {error && <AlertMessage type="error" message={error} />}
                            {success && <AlertMessage type="success" message={success} />}
                        </div>

                        {loading ? (
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-20 flex flex-col items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="text-slate-500 font-bold">Buscando dados...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                            <ShieldCheck className="w-4 h-4 text-indigo-500" /> Nome Completo
                                        </label>
                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(evento) => handleInputChange("nome", evento.target.value, setNome)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                            <Mail className="w-4 h-4 text-indigo-500" /> E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(evento) => handleInputChange("email", evento.target.value, setEmail)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                            <Fingerprint className="w-4 h-4 text-indigo-500" /> CPF
                                        </label>
                                        <input
                                            type="text"
                                            value={cpf}
                                            disabled
                                            className="w-full p-4 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed opacity-70 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                            <Lock className="w-4 h-4 text-amber-500" /> Nova Senha (Opcional)
                                        </label>
                                        <input
                                            type="password"
                                            value={senha}
                                            placeholder="Deixe em branco para manter a atual"
                                            onChange={(evento) => setSenha(evento.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                        Salvar Alterações
                                    </button>
                                    
                                    <Link href={`/usuario/${id}`} className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center">
                                        Cancelar
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EdicaoUsuario;