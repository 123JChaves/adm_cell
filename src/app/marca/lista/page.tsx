'use client'

import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import DeleteButton from "@/src/utils/DeleteButton";
import { 
    ShieldCheck, 
    Plus, 
    ListFilter, 
    LayoutGrid, 
    Eye, 
    Pencil, 
    Loader2, 
    Search, 
    CheckCircle2, 
    XCircle 
} from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

// Interface baseada na sua entidade TypeORM
interface IMarca {
    id: number;
    nome: string;
    ativo: boolean;
}

const ListaDeMarcas = () => {
    
    const [listaDeMarcas, setListaDeMarcas] = useState<IMarca[]>([]);
    const [mensagemDeErro, setMensagemDeErro] = useState<string | null>(null);
    const [mensagemDeSucesso, setMensagemDeSucesso] = useState<string | null>(null);
    const [estaCarregando, setEstaCarregando] = useState<boolean>(true);

    
    const buscarMarcasNoServidor = async () => {
        try {
            setEstaCarregando(true);
            const respostaServidor = await instancia.get<IMarca[]>("/marcas");
            setListaDeMarcas(respostaServidor.data);
        } catch (erroConexao) {
            setMensagemDeErro("Erro ao carregar a lista de marcas!");
        } finally {
            setEstaCarregando(false);
        }
    };

    
    const tratarSucessoAposExclusao = () => {
        setMensagemDeSucesso("Marca removida com sucesso!");
        buscarMarcasNoServidor();
    };

    
    useEffect(() => {
        const mensagemPendentesession = sessionStorage.getItem("successMessage");
        if (mensagemPendentesession) {
            setMensagemDeSucesso(mensagemPendentesession);
            sessionStorage.removeItem("successMessage");
        }
        buscarMarcasNoServidor();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all duration-300">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Cabeçalho da Listagem */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <ShieldCheck className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Marcas
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">
                                    Gerencie as fabricantes e marcas do seu catálogo.
                                </p>
                            </div>

                            <Link href="/marca/cadastro" 
                                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                <Plus className="w-4 h-4 text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
                                Nova Marca
                            </Link>
                        </header>

                        <div className="mb-8">
                            {mensagemDeErro && <AlertMessage type="error" message={mensagemDeErro} />}
                            {mensagemDeSucesso && <AlertMessage type="success" message={mensagemDeSucesso} />}
                        </div>

                        {estaCarregando ? (
                            <div className="flex flex-col py-32 items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                                <p className="font-bold text-slate-600 animate-pulse">Buscando marcas...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {listaDeMarcas.length > 0 ? (
                                    listaDeMarcas.map((marca) => (
                                        <div key={marca.id} 
                                            className="group bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300">
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="h-14 w-14 bg-gradient-to-tr from-slate-50 to-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-105 transition-transform duration-300">
                                                        <ShieldCheck className="w-7 h-7" />
                                                    </div>
                                                    <span className="absolute -top-2 -left-2 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                                                        ID {marca.id}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                                            {marca.nome}
                                                        </h3>
                                                        {marca.ativo ? (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-md border border-green-100">
                                                                <CheckCircle2 className="w-3 h-3" /> ATIVA
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-400 text-[10px] font-black rounded-md border border-slate-100">
                                                                <XCircle className="w-3 h-3" /> INATIVA
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                                                        <LayoutGrid className="w-3.5 h-3.5" />
                                                        Registro de fabricante
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Ações da Marca */}
                                            <div className="flex items-center justify-end gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                                <Link 
                                                    href={`/marca/${marca.id}`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:text-indigo-600 transition-colors" />
                                                    <span className="md:hidden lg:inline font-bold text-sm group-hover/btn:text-indigo-600 transition-colors">Detalhes</span>
                                                </Link>

                                                <Link 
                                                    href={`/marca/${marca.id}/edicao`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-amber-50 rounded-lg transition-all duration-300"
                                                    title="Editar Marca"
                                                >
                                                    <Pencil className="w-4 h-4 group-hover/btn:text-amber-600 transition-colors" />
                                                    <span className="md:hidden lg:inline font-bold text-sm group-hover/btn:text-amber-600 transition-colors">Editar</span>
                                                </Link>

                                                <div className="w-[1px] h-6 bg-slate-100 mx-1 hidden md:block" />

                                                <DeleteButton
                                                    id={String(marca.id)}
                                                    router="/marca"
                                                    onSuccess={tratarSucessoAposExclusao}
                                                    setError={setMensagemDeErro}
                                                    setSuccess={setMensagemDeSucesso}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
                                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">Nenhuma marca encontrada no catálogo.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ListaDeMarcas;
