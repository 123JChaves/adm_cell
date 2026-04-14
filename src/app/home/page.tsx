'use client'

import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Home = () => {
    const [nomeUsuario, setNomeUsuario] = useState<string>("");
    const router = useRouter();

    useEffect(() => {
        // 1. Verifica se o token existe (Segurança extra caso o middleware falhe)
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // 2. Recupera os dados que foram salvos na LoginPage no momento do login
        const usuarioStored = localStorage.getItem('users');
        
        if (usuarioStored) {
            try {
                const usuario = JSON.parse(usuarioStored);
                // Define o nome vindo do localStorage para a tela carregar instantaneamente
                setNomeUsuario(usuario.nome);
            } catch (error) {
                console.error("Erro ao ler dados do usuário", error);
                setNomeUsuario("Usuário");
            }
        }
    }, [router]);

    return (
        <div className="flex flex-col h-screen bg-gray-200 text-black">
            <Menu />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8 overflow-y-auto">
                    {/* Se o nome não existir no localStorage, ele mostra 'Bem-vindo!' */}
                    <h1 className="text-2xl font-bold">
                        Bem-vindo, {nomeUsuario || "!"}
                    </h1>
                    <p className="mt-2 text-gray-600">Você está no painel de controle</p>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default Home;