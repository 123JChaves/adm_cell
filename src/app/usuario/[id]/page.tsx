'use client'

import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import { User, Mail, IdCard, Calendar, ArrowLeft, Pencil, Loader2, Clock, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AxiosError } from "axios";

const DetalhesUsuario = () => {
    const params = useParams();
    const id = params?.id as string;
    const [usuario, setUsuario] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const buscar = async () => {
            if (!id) return;
            try {
                setLoading(true);
                setError(null);
                const { data } = await instancia.get(`/usuario/${id}`);
                setUsuario(data);
            } catch (err) {
                const axiosError = err as AxiosError<{ message: string }>;
                setError(axiosError.response?.data?.message || "Usuário não encontrado.");
            } finally {
                setLoading(false);
            }
        };
        buscar();
    }, [id]);

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
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <header>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <User className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Perfil do Usuário
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">
                                    Informações detalhadas do registro ID #{id}
                                </p>
                            </header>

                            <div className="flex items-center gap-3">
                                <Link href="/usuario/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                    <Users size={14} className="text-indigo-600" />
                                    Listagem
                                </Link>
                                
                                {/* Botão de Editar restaurado para o formato anterior */}
                                {!loading && usuario && (
                                    <Link href={`/usuario/${id}/edicao`} 
                                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                        <Pencil size={14} className="text-amber-500" /> Editar Perfil
                                    </Link>
                                )}

                                <Link href="/usuario/lista" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-6 h-6" />
                                </Link>
                            </div>
                        </div>
                        
                        <div className="mb-8">
                            {error && <AlertMessage type="error" message={error} />}
                        </div>

                        {loading ? (
                            <div className="bg-white border border-slate-200 rounded-[2rem] p-24 flex flex-col items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="text-slate-500 font-bold">Sincronizando dados...</p>
                            </div>
                        ) : usuario && (
                            <div className="bg-white border border-slate-200 shadow-sm rounded-[2rem] overflow-hidden border-t-4 border-t-indigo-600">
                                <div className="p-8 md:p-12 space-y-10">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Nome Completo
                                            </label>
                                            <p className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-lg">
                                                {usuario.nome}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <Mail className="w-4 h-4 text-indigo-500" /> Endereço de E-mail
                                            </label>
                                            <p className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-bold text-lg break-all">
                                                {usuario.email}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <IdCard className="w-4 h-4 text-indigo-500" /> CPF Registrado
                                            </label>
                                            <p className="p-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-600 font-bold text-lg">
                                                {usuario.cpf}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Administrador Responsável
                                            </label>
                                            <p className="p-4 bg-slate-100 border border-slate-100 rounded-2xl text-slate-600 font-bold text-lg">
                                                {usuario.admin?.nome || "Sistema / Geral"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full" />

                                    {/* Data de Cadastro e de Auditoria */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Data de Criação */}
                                        <div className="flex items-center gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data de Criação</span>
                                                <span className="text-sm font-bold text-slate-700 leading-tight">
                                                    {new Date(usuario.createDate).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            {/* Ícone posicionado logo após os dados com gap-2 */}
                                            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                                        </div>

                                        {/* Última Atualização */}
                                        <div className="flex items-center gap-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Última Atualização</span>
                                                <span className="text-sm font-bold text-slate-700 leading-tight">
                                                    {new Date(usuario.updateDate).toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            {/* Ícone posicionado logo após os dados com gap-2 */}
                                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DetalhesUsuario;
