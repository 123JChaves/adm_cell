'use client'

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import instancia from "@/src/service/api"; 
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";

interface AdminDados {
    id: number;
    nome: string;
    email: string;
    cpf: string;
}

const PerfilAdmin = () => {
    const params = useParams();
    const [admin, setAdmin] = useState<AdminDados | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const buscarAdmin = async () => {
            const idValido = params?.id && !isNaN(Number(params.id));
            
            if (!idValido) return;

            try {
                const resposta = await instancia.get<AdminDados>(`/admin/${params.id}`);
                setAdmin(resposta.data);
            } catch (erro) {
                console.error("Erro ao buscar admin:", erro);
            } finally {
                setCarregando(false);
            }
        };

        buscarAdmin();
    }, [params.id]); // O efeito roda novamente assim que o Next.js identificar o ID na URL

    // Enquanto não tem ID ou está carregando, mostra o feedback
    if (carregando) return (
        <div className="flex justify-center items-center h-screen bg-gray-200 text-black">
            <p className="font-bold animate-pulse">Carregando dados do perfil...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-200 text-black">
            <Menu />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                    <h1 className="text-2xl font-bold mb-6 tracking-tight">Detalhes do Administrador</h1>
                    
                    {admin ? (
                        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500 font-medium">ID</span>
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-2 rounded">#{admin.id}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 font-medium text-sm">Nome Completo</span>
                                <span className="text-lg font-semibold">{admin.nome}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 font-medium text-sm">E-mail</span>
                                <span className="text-lg font-semibold">{admin.email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 font-medium text-sm">CPF</span>
                                <span className="text-lg font-semibold">{admin.cpf}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                            Administrador não encontrado ou ID inválido.
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default PerfilAdmin;
