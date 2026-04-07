'use client'

import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import DeleteButton from "@/src/utils/DeleteButton";
import { Eye, Plus, User, Mail, Fingerprint, Loader2, Pencil, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Admin {
    id: number;
    nome: string;
    cpf: string;
    email: string;
}

const ListaDeAdmin = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const recuperarAdmins = async () => {
        try {
            setLoading(true);
            const resposta = await instancia.get("/admin");
            setAdmins(resposta.data);
        } catch (erro) {
            setError("Erro ao carregar a lista de administradores!");
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = () => {
        recuperarAdmins();
    };

    useEffect(() => {
        const message = sessionStorage.getItem("successMessageAdmin");
        if (message) {
            setSuccess(message);
            sessionStorage.removeItem("successMessageAdmin");
        }
        recuperarAdmins();
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Menu />
            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all duration-300">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Header Section */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-slate-900 rounded-xl shadow-md shadow-slate-200">
                                        <ShieldCheck className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Lista de Admins
                                    </h1>
                                </div>
                                <p className="text-slate-500 mt-2 font-medium">
                                    Gerencie os perfis com acesso total ao sistema.
                                </p>
                            </div>

                            <Link href="/admin/cadastro" 
                                className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 group">
                                <Plus className="w-4 h-4 text-slate-900 group-hover:rotate-90 transition-transform duration-300" />
                                Novo Admin
                            </Link>
                        </header>

                        <div className="mb-8">
                            <AlertMessage type="error" message={error} />
                            <AlertMessage type="success" message={success} />
                        </div>

                        {loading ? (
                            <div className="flex flex-col py-32 items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
                                <Loader2 className="w-10 h-10 animate-spin text-slate-900 mb-4" />
                                <p className="font-bold text-slate-600 animate-pulse">Buscando administradores...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {admins.length > 0 ? (
                                    admins.map((admin) => (
                                        <div key={admin.id} 
                                            className="group bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/40 transition-all duration-300">
                                            
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="h-14 w-14 bg-gradient-to-tr from-slate-50 to-slate-100 rounded-2xl flex items-center justify-center text-slate-900 border border-slate-200 group-hover:scale-105 transition-transform duration-300">
                                                        <User className="w-7 h-7" />
                                                    </div>
                                                    <span className="absolute -top-2 -left-2 bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                                                        ADM {admin.id}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                                        {admin.nome}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                                                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                            <Mail className="w-3.5 h-3.5 text-indigo-400" />
                                                            {admin.email}
                                                        </span>
                                                        <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                            <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                                                            {admin.cpf}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-1 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                                                <Link 
                                                    href={`/admin/${admin.id}`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
                                                    title="Ver Detalhes"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:text-indigo-600 transition-colors" />
                                                    <span className="md:hidden lg:inline font-bold text-sm group-hover/btn:text-indigo-600 transition-colors">Detalhes</span>
                                                </Link>

                                                <Link 
                                                    href={`/admin/${admin.id}/edicao`} 
                                                    className="group/btn flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-amber-50 rounded-lg transition-all duration-300"
                                                    title="Editar Usuário"
                                                >
                                                    <Pencil className="w-4 h-4 group-hover/btn:text-amber-600 transition-colors" />
                                                    <span className="md:hidden lg:inline font-bold text-sm group-hover/btn:text-amber-600 transition-colors">Editar</span>
                                                </Link>

                                                <DeleteButton
                                                    id={String(admin.id)}
                                                    router="admin"
                                                    onSuccess={handleSuccess}
                                                    setError={setError}
                                                    setSuccess={setSuccess}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-[2rem]">
                                        <p className="text-slate-400 font-bold">Nenhum administrador encontrado no banco de dados.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ListaDeAdmin;
