'use client'

import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import { useEffect, useState } from "react";

const Home = () => {

    const [nomeUsuario, setNomeUsuario] = useState<string>("");

    useEffect(() => {
        const usuarioStored = localStorage.getItem('users');
        if (usuarioStored) {
            const usuario = JSON.parse(usuarioStored);
            setNomeUsuario(usuario.nome)
        }
    },[]);

    return (
    <div className="flex flex-col h-screen bg-gray-200 text-black">
        <Menu />
        <div className="p-8">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-8">
                <h1 className="text-2xl font-bold">Bem-vindo, {nomeUsuario || "Carregando..."}!</h1>
                <p className="mt-2 text-gray-600">Você está no painel de controle</p>
            </main>
        </div>
    </div>
    );
}

export default Home;