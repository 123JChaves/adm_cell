"use client";

import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import instancia from '@/src/service/api';
import AlertMessage from '@/src/utils/Alert';

interface ApiError {
    message: string;
}

const Login = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipo, setTipo] = useState<'usuario' | 'admin'>('usuario'); 
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const router = useRouter();

    const handleLogin = async (evento: React.FormEvent) => {
        evento.preventDefault();
        setErro('');

        if (!email || !senha) {
            setErro("E-mail e senha são obrigatórios!");
            return;
        }

        setCarregando(true);

        try {
            const response = await instancia.post(`/login/${tipo}`, { email, senha });
            const data = response.data;

            Cookies.set('token', data.token, { expires: 1/3 });
            Cookies.set('userRole', tipo, { expires: 1/3 });

            const usuarioDados = tipo === 'admin' ? data.admin : data.usuario;
            localStorage.setItem('users', JSON.stringify(usuarioDados));

            router.push('/home');
            
        } catch (erroCapturado) {
            if (axios.isAxiosError(erroCapturado)) {
                const axiosError = erroCapturado as AxiosError<ApiError>;
                const mensagem = axiosError.response?.data?.message || 'Falha ao autenticar';
                setErro(mensagem);
            } else {
                setErro("Erro de conexão com o servidor.");
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="flex flex-col justify-center items-center h-screen bg-gray-100 text-black">
            
            {erro !== '' && (
                <AlertMessage 
                    type="error" 
                    message={erro} 
                    onClose={() => setErro('')} 
                />
            )}

            {/* Adicionado 'noValidate' para desativar os balões padrão do navegador */}
            <form 
                onSubmit={handleLogin} 
                noValidate
                className="flex flex-col gap-4 w-full max-w-sm bg-white p-8 shadow-lg rounded-xl border border-gray-200"
            >
                <h2 className="text-2xl font-bold mb-2 text-center text-blue-800">Acesso ao Sistema</h2>
                
                <div className="flex bg-gray-200 p-1 rounded-md mb-4">
                    <button
                        type="button"
                        onClick={() => { setTipo('usuario'); setErro(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${tipo === 'usuario' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Usuário
                    </button>
                    <button
                        type="button"
                        onClick={() => { setTipo('admin'); setErro(''); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${tipo === 'admin' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Admin
                    </button>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">E-mail:</label>
                    <input
                        type="email"
                        placeholder="Ex: seu@email.com"
                        value={email}
                        onChange={(evento) => setEmail(evento.target.value)} 
                        className="border p-2 rounded-md border-gray-300 focus:border-blue-500 outline-none transition-all"
                    />
                </div>
                
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1">Senha:</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(evento) => setSenha(evento.target.value)} 
                        className="border p-2 rounded-md border-gray-300 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                {erro && (
                    <div className="bg-red-50 p-2 rounded border border-red-200 text-center">
                        <span className="text-red-500 text-xs font-bold uppercase">{erro}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={carregando} 
                    className={`mt-4 p-3 rounded-md font-bold text-white transition-all shadow-md ${
                        tipo === 'admin' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'
                    } disabled:bg-gray-400`}
                >
                    {carregando ? 'Autenticando...' : `Entrar como ${tipo === 'admin' ? 'Administrador' : 'Usuário'}`}
                </button>
            </form>
        </main>
    );
}

export default Login;