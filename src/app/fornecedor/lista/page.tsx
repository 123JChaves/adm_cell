"use client";

import React, { useState, useEffect } from "react";
import instancia from "@/src/service/api";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import AlertMessage from "@/src/utils/Alert";
import DeleteButton from "@/src/utils/DeleteButton";
import { 
    Users, Plus, Search, Building2, MapPinned, 
    Pencil, Eye, FileText, Fingerprint, X 
} from "lucide-react";
import Link from 'next/link';

interface IFornecedor {
    id: number;
    nomeFantasia: string;
    razaoSocial: string;
    cnpj: string;
    enderecos?: {
        nome: string;
        numero: number;
        bairro: {
            nome: string;
            cidade: {
                nome: string;
                estado: { nome: string }
            }
        }
    }[];
}

const ListaDeFornecedores = () => {
    const [listaDeFornecedores, setListaDeFornecedores] = useState<IFornecedor[]>([]);
    const [termoDeBusca, setTermoDeBusca] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [estaCarregando, setEstaCarregando] = useState<boolean>(true);

    const buscarFornecedores = async () => {
        setEstaCarregando(true);
        try {
            const resposta = await instancia.get<IFornecedor[]>("/fornecedores");
            setListaDeFornecedores(resposta.data);
        } catch {
            setError("Não foi possível carregar a lista de fornecedores.");
        } finally {
            setEstaCarregando(false);
        }
    };

    useEffect(() => {
        buscarFornecedores();
    }, []);

    const handleSuccess = () => {
        buscarFornecedores();
    };

    const fornecedoresFiltrados = listaDeFornecedores.filter((fornecedor) =>
        fornecedor.nomeFantasia.toLowerCase().includes(termoDeBusca.toLowerCase()) ||
        fornecedor.razaoSocial.toLowerCase().includes(termoDeBusca.toLowerCase()) ||
        fornecedor.cnpj.includes(termoDeBusca)
    );

    const formatarCNPJ = (v: string) => {
        return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Menu />
            
            {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
            {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-6xl mx-auto">
                        
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <Users className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fornecedores</h1>
                                </div>
                                <p className="text-slate-500 font-medium mt-2 ml-1 text-sm">Gestão de parceiros e contratos logísticos.</p>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <Link href="/fornecedor/cadastro" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                    <Plus className="w-4 h-4 text-indigo-600 group-hover:rotate-90 transition-transform duration-300" />
                                    Novo Fornecedor
                                </Link>
                            </div>
                        </header>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="text"
                                    placeholder="Buscar por nome fantasia, razão social ou CNPJ..."
                                    value={termoDeBusca}
                                    onChange={(e) => setTermoDeBusca(e.target.value)}
                                    className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-slate-600"
                                />
                                {termoDeBusca && (
                                    <button onClick={() => setTermoDeBusca("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {estaCarregando ? (
                            <div className="text-center py-24 italic text-slate-400 font-medium">Sincronizando fornecedores...</div>
                        ) : (
                            <div className="space-y-4">
                                {fornecedoresFiltrados.length > 0 ? (
                                    fornecedoresFiltrados.map((fornecedor) => (
                                        <div key={fornecedor.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-white border border-slate-200 rounded-[2rem] hover:shadow-md transition-all group">
                                            
                                            {/* SEÇÃO ESQUERDA: DADOS DA EMPRESA */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-tight truncate">{fornecedor.nomeFantasia}</h3>
                                                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1 mt-1 truncate">
                                                        <FileText className="w-3 h-3" /> {fornecedor.razaoSocial}
                                                    </p>
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md mt-2 border border-indigo-100/50 uppercase">
                                                        <Fingerprint className="w-3 h-3" /> {formatarCNPJ(fornecedor.cnpj)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* SEÇÃO CENTRAL: LOCALIZAÇÃO ALINHADA À ESQUERDA */}
                                            <div className="flex flex-1 items-start gap-2 md:border-l md:border-slate-100 md:pl-6 text-left">
                                                <MapPinned className="w-4 h-4 text-slate-300 mt-1 shrink-0" />
                                                <div className="text-[11px] leading-tight">
                                                    <p className="font-black text-slate-700 uppercase tracking-tighter">
                                                        {fornecedor.enderecos?.[0]?.bairro?.cidade?.nome || "Cidade não informada"}
                                                    </p>
                                                    <p className="text-slate-400 font-bold mt-0.5">
                                                        {fornecedor.enderecos?.[0]?.nome ? 
                                                            `${fornecedor.enderecos[0].nome}, ${fornecedor.enderecos[0].numero}` : 
                                                            "Endereço não cadastrado"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* SEÇÃO DIREITA: AÇÕES */}
                                            <div className="flex items-center justify-end gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 shrink-0">
                                                <Link 
                                                    href={`/fornecedor/${fornecedor.id}`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:text-indigo-600 transition-colors" />
                                                    <span className="font-bold text-sm group-hover/btn:text-indigo-600 transition-colors hidden lg:inline">Detalhes</span>
                                                </Link>
                                                
                                                <Link 
                                                    href={`/fornecedor/${fornecedor.id}/edicao`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-amber-50 rounded-lg transition-all duration-300"
                                                    title="Editar Fornecedor"
                                                >
                                                    <Pencil className="w-4 h-4 group-hover/btn:text-amber-600 transition-colors" />
                                                    <span className="font-bold text-sm group-hover/btn:text-amber-600 transition-colors hidden lg:inline">Editar</span>
                                                </Link>

                                                <div className="w-[1px] h-6 bg-slate-100 mx-1 hidden md:block" />

                                                <DeleteButton
                                                    id={String(fornecedor.id)}
                                                    router="fornecedor"
                                                    onSuccess={handleSuccess}
                                                    setError={setError}
                                                    setSuccess={setSuccess}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-slate-200">
                                        <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500 font-bold">Nenhum fornecedor encontrado para sua busca.</p>
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

export default ListaDeFornecedores;