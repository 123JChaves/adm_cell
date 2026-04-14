'use client';

import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import instancia from '@/src/service/api';
import AlertMessage from '@/src/utils/Alert';
import { LayoutDashboard, Lock, Mail } from 'lucide-react'; // Ícones para combinar

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
                setErro(axiosError.response?.data?.message || 'Falha ao autenticar');
            } else {
                setErro("Erro de conexão com o servidor.");
            }
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="flex flex-col justify-center items-center min-h-screen bg-slate-950 text-slate-200 p-4">
            
            {erro !== '' && (
                <AlertMessage type="error" message={erro} onClose={() => setErro('')} />
            )}

            <div className="w-full max-w-md">
                {/* Header do Login similar ao Icone do Footer */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-900/20 mb-4">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic text-white">
                        Adm Loja Cell
                    </h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-2">
                        Plataforma de Gestão
                    </p>
                </div>

                <form 
                    onSubmit={handleLogin} 
                    noValidate
                    className="bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl rounded-3xl border border-white/5 flex flex-col gap-5"
                >
                    {/* Toggle de Tipo de Acesso */}
                    <div className="flex bg-slate-800/50 p-1 rounded-xl mb-2">
                        <button
                            type="button"
                            onClick={() => { setTipo('usuario'); setErro(''); }}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${tipo === 'usuario' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            USUÁRIO
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTipo('admin'); setErro(''); }}
                            className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${tipo === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            ADMIN
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="w-full bg-slate-800/50 border border-white/5 pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                                />
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)} 
                                    className="w-full bg-slate-800/50 border border-white/5 pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={carregando} 
                        className="mt-2 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-lg shadow-indigo-900/20"
                    >
                        {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-600 text-[10px] font-bold tracking-widest uppercase">
                    © {new Date().getFullYear()} Adm Loja Cell
                </p>
            </div>
        </main>
    );
}

export default Login;