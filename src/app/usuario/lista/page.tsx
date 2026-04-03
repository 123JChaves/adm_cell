'use client'

import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import DeleteButton from "@/src/utils/DeleteButton";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Usuario {
    id: number,
    nome: string,
    cpf: string,
    email: string
}

const ListaDeUsuario = () => {

    const [usuario, setUsuario] = useState<Usuario[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const recuperarUsuarios = async () => {
        try {
            setLoading(true);
            const resposta = await instancia.get("/usuarios");
            setUsuario(resposta.data);
        } catch(error) {
            setError("Erro ao carregar os usuários!")
        } finally {
            setLoading(false);
        };
    };

    const handleSuccess = () => {
        recuperarUsuarios()
    };

    useEffect(() => {
        const message = sessionStorage.getItem("successMessage");
        if(message) {
            setSuccess(message);
            sessionStorage.removeItem("successMessage");
        };
        recuperarUsuarios()
    },[]);
    

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Menu />
            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 md:ml-64 p-12 bg-white">
                    {/* Cabeçalho exatamente igual ao de Contato */}
                    <header className="max-w-2xl mb-12">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Usuários
                        </h1>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Gerencie os acessos, visualize detalhes ou edite as informações dos usuários cadastrados no sistema.
                        </p>
                        {/* Botão de cadastro integrado ao fluxo do cabeçalho */}
                        <Link href="/usuario/cadastro" 
                            className="inline-flex items-center justify-center bg-gray-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-600 transition-all shadow-sm">
                            + Cadastrar Novo Usuário
                        </Link>
                    </header>

                    <div className="max-w-xl space-y-4"> {/* Ajustado para max-w-xl para bater com o layout de contato */}
                        <AlertMessage type="error" message={error} />
                        <AlertMessage type="success" message={success} />

                        {loading ? (
                            <div className="flex py-10 items-center text-gray-400">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                                Buscando usuários...
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {usuario.map((usuario) => (
                                    <div key={usuario.id} className="group flex items-center justify-between border-b border-gray-100 pb-6 transition-all">
                                        <div className="flex items-center space-x-5">
                                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-purple-50 transition-colors">
                                                {/* Usando o ID estilizado como ícone */}
                                                <span className="text-gray-400 group-hover:text-purple-600 font-bold text-xs">ID {usuario.id}</span>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                                    {usuario.nome}
                                                </h3>
                                                <p className="text-sm text-gray-500">{usuario.email}</p>
                                            </div>
                                        </div>

                                        {/* Ações visíveis mas discretas para manter o estilo */}
                                        <div className="flex items-center space-x-3">
                                            <Link href={`/usuario/${usuario.id}`} className="p-2 text-gray-400 hover:text-blue-500 transition-colors" title="Visualizar">
                                                Visualizar
                                            </Link>
                                            <Link href={`/usuario/${usuario.id}/edit`} className="p-2 text-gray-400 hover:text-yellow-500 transition-colors" title="Editar">
                                                Editar
                                            </Link>
                                            <DeleteButton
                                                id={String(usuario.id)}
                                                router="usuario"
                                                onSuccess={handleSuccess}
                                                setError={setError}
                                                setSuccess={setSuccess}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );

}

export default ListaDeUsuario;