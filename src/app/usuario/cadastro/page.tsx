'use client'

import axios, { AxiosError } from 'axios';
import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";
import instancia from "@/src/service/api";
import React, { useState } from 'react';
import Link from 'next/link';
import AlertMessage from '@/src/utils/Alert';

const CadastroUsuario = () => {

    const [nome, setNome] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [cpf, setCpf] = useState<string>("");
    const [senha, setSenha] = useState<string>("");
    const [confirmarSenha, setConfirmarSenha] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const regexSenha = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{6,}$/;
        if(!regexSenha.test(senha)) {
            setError("A senha deve conter pelo menos 6 dígitos, sendo necessário ao menos: uma letra maiúscula, uma minúscula, um número e um caractere especial.");
            return;
        };

        if(senha !== confirmarSenha) {
            setError("As senhas não coincidem");
            return;
        }

        try {

            const resposta = await instancia.post('/usuario', {
                nome: nome,
                email: email,
                cpf: cpf,
                senha: senha
            });

            console.log(resposta.data);

            setSuccess(resposta.data.message);

            setNome("");
            setEmail("");
            setSenha("");
            setConfirmarSenha("");


        } catch (error) {

            if(axios.isAxiosError(error)) {
                setError(error.response?.data?.message || "Erro no servidor!");
            } else {
                setError("Erro de conexão!")
            }

        }

    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-200 text-black">
            <Menu />
            
            <div className="flex flex-1 relative"> 
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8">
                    <div className="max-w-2xl"> 
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Cadastro de Usuários
                        </h1>
                    </div>
                        
                    <AlertMessage type="error" message={error} />
                    <AlertMessage type="success" message={success} />

                    <form onSubmit={handleSubmit} className="mt-6 bg-white shadow-md rounded-lg p-6">
                        <div className="mb-4">
                            <label htmlFor="nome" className="block text-sm font-semibold">Nome: </label>
                            <input
                                type="text"
                                id="nome"
                                value={nome}
                                placeholder="Nome completo do usuário"
                                onChange={(event) => setNome(event.target.value)}
                                className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-semibold">Email: </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                placeholder="Digite o melhor email"
                                onChange={(event) => setEmail(event.target.value)}
                                className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="cpf" className="block text-sm font-semibold">Cpf: </label>
                            <input
                                type="text"
                                id="cpf"
                                value={cpf}
                                placeholder="Digite o seu CPF"
                                onChange={(event) => setCpf(event.target.value)}
                                className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="senha" className="block text-sm font-semibold">Senha: </label>
                            <input
                                type="password"
                                id="senha"
                                value={senha}
                                autoComplete="new-password"
                                placeholder="Mínimo 6 caracteres, letra, número e símbolo"
                                onChange={(event) => {
                                    setSenha(event.target.value);
                                    if(error) setError(null); // Limpa erro ao digitar
                                }}
                                className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="confirmarSenha" className="block text-sm font-semibold">Confirmar Senha:</label>
                            <input
                                type="password"
                                id="confirmarSenha"
                                value={confirmarSenha}
                                autoComplete="new-password"
                                placeholder="Repita sua senha"
                                onChange={(event) => {
                                    setConfirmarSenha(event.target.value);
                                    if(error) setError(null); // Limpa erro ao digitar
                                }}
                                className="border p-2 w-full mt-1 rounded-md border-blue-100 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:outline-none"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full md:w-auto px-3 p-1 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold transition-colors">
                            Cadastrar Usuário
                        </button>
                    </form>
                </main>
            </div>
        </div>
    )
}

export default CadastroUsuario;