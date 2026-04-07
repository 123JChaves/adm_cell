'use client'

import axios, { AxiosError } from 'axios';
import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import React, { useState } from 'react';
import Link from 'next/link';
import AlertMessage from '@/src/utils/Alert';
import { UserPlus, ArrowLeft, ShieldCheck, Mail, Fingerprint, Lock, Save, Users } from 'lucide-react';

// 1. Interfaces Estritas
interface ApiError {
    message: string;
}

const CadastroUsuario = () => {
    // Estados de Dados
    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [confirmarSenha, setConfirmarSenha] = useState<string>("");

    // Estados de Feedback
    const [erros, setErros] = useState<Record<string, string>>({}); 
    const [error, setError] = useState<string | null>(null);         
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Função para limpar erro do campo ao digitar
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

    const formatarCPF = (valor: string) => {
    // 1. Remove tudo que não é número e limita a 11 dígitos
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);

    // 2. Aplica a máscara progressivamente
    return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")       // 000.
        .replace(/(\d{3})(\d)/, "$1.$2")       // 000.000.
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // 000.000.000-00
};

    const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>): Promise<void> => {
        evento.preventDefault();
        setErros({});
        setError(null);
        setSuccess(null);

        const novosErros: Record<string, string> = {};

        
        if (!nome.trim()) novosErros.nome = "O nome é obrigatório";
        if (!email.trim()) novosErros.email = "O e-mail é obrigatório";
        if (!cpf.trim()) novosErros.cpf = "O CPF é obrigatório";
        
        const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
        if (!senha) {
            novosErros.senha = "A senha é obrigatória";
        } else if (!regexSenha.test(senha)) {
            novosErros.senha = "Senha fraca: use 6+ dígitos, maiúscula, minúscula, número e símbolo.";
        }

        if (senha !== confirmarSenha) {
            novosErros.confirmarSenha = "As senhas não coincidem";
        }

        if (Object.keys(novosErros).length > 0) {
            setErros(novosErros);
            setTimeout(() => setError("Preencha os campos obrigatórios corretamente."), 10);
            return;
        }

        setIsSubmitting(true);

        try {
            const resposta = await instancia.post('/usuario', { nome, email, cpf, senha });
            setSuccess(resposta.data.message || "Usuário cadastrado com sucesso!");
            
            setNome(""); setEmail(""); setCpf(""); setSenha(""); setConfirmarSenha("");
        } catch (erro) {
            if (axios.isAxiosError(erro)) {
                const axiosError = erro as AxiosError<ApiError>;
                setError(axiosError.response?.data?.message || "Erro no servidor!");
            } else {
                setError("Erro de conexão!");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

        return (
        /* h-screen e overflow-hidden travam a tela para o Menu/Sidebar ficarem fixos */
        <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
            
            {/* MENU: Fixado no topo */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
                <Menu />
            </div>

            <div className="flex flex-1 mt-16 h-full"> 
                
                {/* SIDEBAR: Fixada na lateral esquerda */}
                <aside className="fixed left-0 top-16 bottom-0 w-64 hidden md:block border-r border-slate-200 bg-white z-40">
                    <Sidebar />
                </aside>

                {/* CONTEÚDO PRINCIPAL: Área que recebe o scroll */}
                <main className="flex-1 md:ml-64 overflow-y-auto p-6 md:p-12 pb-24">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Header do Formulário */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <header>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <UserPlus className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Cadastro de Usuário
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">
                                    Registre novos acessos ao sistema.
                                </p>
                            </header>

                            <div className="flex items-center gap-3">
                                <Link href="/usuario/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                    <Users className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                    Listagem de Usuários
                                </Link>
                                <Link href="{`/usuario/{id}}`" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors" title="Voltar">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                        
                        {/* Mensagens de Alerta (Top) */}
                        <div className="mb-8">
                            {error && <AlertMessage type="error" message={error} />}
                            {success && <AlertMessage type="success" message={success} />}
                        </div>

                        {/* Formulário Principal */}
                        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12 space-y-8">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* NOME */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <ShieldCheck className="w-4 h-4 text-indigo-500" /> Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={nome}
                                        placeholder="Ex: João Silva"
                                        onChange={(evento) => handleInputChange("nome", evento.target.value, setNome)}
                                        className={`w-full p-4 bg-slate-50 border ${erros.nome ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                    />
                                    {erros.nome && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {erros.nome}
                                        </p>
                                    )}
                                </div>

                                {/* CPF */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <Fingerprint className="w-4 h-4 text-indigo-500" /> CPF
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={14} // Previne visualmente que digitem mais que o formato 000.000.000-00
                                        value={cpf}
                                        placeholder="000.000.000-00"
                                        onChange={(evento) => {
                                            const valorFormatado = formatarCPF(evento.target.value);
                                            
                                            handleInputChange("cpf", valorFormatado, setCpf);
                                        }}
                                        className={`w-full p-4 bg-slate-50 border ${erros.cpf ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                    />
                                    {erros.cpf && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {erros.cpf}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                    <Mail className="w-4 h-4 text-indigo-500" /> E-mail
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="usuario@email.com"
                                    onChange={(evento) => handleInputChange("email", evento.target.value, setEmail)}
                                    className={`w-full p-4 bg-slate-50 border ${erros.email ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                />
                                {erros.email && (
                                    <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                        {erros.email}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                                {/* SENHA */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <Lock className="w-4 h-4 text-indigo-500" /> Senha
                                    </label>
                                    <input
                                        type="password"
                                        value={senha}
                                        placeholder="••••••••"
                                        onChange={(evento) => handleInputChange("senha", evento.target.value, setSenha)}
                                        className={`w-full p-4 bg-slate-50 border ${erros.senha ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                    />
                                    {erros.senha && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {erros.senha}
                                        </p>
                                    )}
                                </div>

                                {/* CONFIRMAR SENHA */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2 ml-1">
                                        <Lock className="w-4 h-4 text-indigo-500" /> Confirmar
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmarSenha}
                                        placeholder="••••••••"
                                        onChange={(evento) => handleInputChange("confirmarSenha", evento.target.value, setConfirmarSenha)}
                                        className={`w-full p-4 bg-slate-50 border ${erros.confirmarSenha ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                    />
                                    {erros.confirmarSenha && (
                                        <p className="text-xs text-red-500 font-bold ml-1 animate-pulse">
                                            {erros.confirmarSenha}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Botão de Submissão */}
                            <div className="flex justify-end pt-6">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 group"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Salvando...</span>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
                                            Salvar Usuário
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default CadastroUsuario;
