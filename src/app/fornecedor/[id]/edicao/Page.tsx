"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import EntradaComSugestao from "@/src/utils/AutoComplete";
import { 
    Users, Save, ArrowLeft, Building2, 
    MapPinned, Hash, Fingerprint, FileText,
    CheckCircle2, XCircle, Package
} from "lucide-react";

interface EntidadeGeograficaBase {
    id: number;
    nome: string;
    pais?: { id: number };
    estado?: { id: number };
    cidade?: { id: number };
    bairro?: { id: number };
}

const EdicaoFornecedor = () => {
    const parametrosDaRota = useParams();
    const navegadorDePaginas = useRouter();
    const identificadorDoFornecedor = parametrosDaRota.id;

    // ESTADOS DE CONTROLE
    const [estaCarregandoDados, setEstaCarregandoDados] = useState<boolean>(true);
    const [estaSubmetendo, setEstaSubmetendo] = useState<boolean>(false);
    const [mensagemErro, setMensagemErro] = useState<string | null>(null);
    const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

    // ESTADOS DOS DADOS JURÍDICOS
    const [nomeFantasia, setNomeFantasia] = useState<string>("");
    const [razaoSocial, setRazaoSocial] = useState<string>("");
    const [cnpj, setCnpj] = useState<string>("");
    const [statusAtivoDoFornecedor, setStatusAtivoDoFornecedor] = useState<boolean>(true);
    const [identificadorDoEnderecoExistente, setIdentificadorDoEnderecoExistente] = useState<number | null>(null);

    // ESTADOS DE LOCALIZAÇÃO
    const [textoDaRua, setTextoDaRua] = useState<string>("");
    const [idDaRua, setIdDaRua] = useState<number | null>(null);
    const [numeroLogradouro, setNumeroLogradouro] = useState<string>("");
    const [textoDoBairro, setTextoDoBairro] = useState<string>("");
    const [idDoBairro, setIdDoBairro] = useState<number | null>(null);
    const [textoDaCidade, setTextoDaCidade] = useState<string>("");
    const [idDaCidade, setIdDaCidade] = useState<number | null>(null);
    const [textoDoEstado, setTextoDoEstado] = useState<string>("");
    const [idDoEstado, setIdDoEstado] = useState<number | null>(null);
    const [textoDoPais, setTextoDoPais] = useState<string>("");
    const [idDoPais, setIdDoPais] = useState<number | null>(null);

    // LISTAS DE SUGESTÃO
    const [listaPaises, setListaPaises] = useState<EntidadeGeograficaBase[]>([]);
    const [listaEstados, setListaEstados] = useState<EntidadeGeograficaBase[]>([]);
    const [listaCidades, setListaCidades] = useState<EntidadeGeograficaBase[]>([]);
    const [listaBairros, setListaBairros] = useState<EntidadeGeograficaBase[]>([]);
    const [listaEnderecos, setListaEnderecos] = useState<EntidadeGeograficaBase[]>([]);

    const aplicarMascaraCnpj = (valor: string) => {
        const apenasNumeros = valor.replace(/\D/g, "").slice(0, 14);
        return apenasNumeros
            .replace(/^(\d{2})(\d)/, "$1.$2")
            .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
            .replace(/\.(\d{3})(\d)/, ".$1/$2")
            .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    };

    useEffect(() => {
        const carregarTudo = async () => {
            try {
                const [resP, resEs, resCi, resBa, resEn, resForn] = await Promise.all([
                    instancia.get("/paises"), 
                    instancia.get("/estados"),
                    instancia.get("/cidades"), 
                    instancia.get("/bairros"),
                    instancia.get("/enderecos"),
                    instancia.get(`/fornecedor/${identificadorDoFornecedor}`)
                ]);

                setListaPaises(resP.data);
                setListaEstados(resEs.data);
                setListaCidades(resCi.data);
                setListaBairros(resBa.data);
                setListaEnderecos(resEn.data);

                const f = resForn.data;
                setNomeFantasia(f.nomeFantasia);
                setRazaoSocial(f.razaoSocial);
                setCnpj(aplicarMascaraCnpj(f.cnpj));
                setStatusAtivoDoFornecedor(f.ativo);

                if (f.enderecos && f.enderecos.length > 0) {
                    const e = f.enderecos[0];
                    setIdentificadorDoEnderecoExistente(e.id);
                    setTextoDaRua(e.nome);
                    setIdDaRua(e.id);
                    setNumeroLogradouro(String(e.numero));
                    setTextoDoBairro(e.bairro.nome);
                    setIdDoBairro(e.bairro.id);
                    setTextoDaCidade(e.bairro.cidade.nome);
                    setIdDaCidade(e.bairro.cidade.id);
                    setTextoDoEstado(e.bairro.cidade.estado.nome);
                    setIdDoEstado(e.bairro.cidade.estado.id);
                    setTextoDoPais(e.bairro.cidade.estado.pais.nome);
                    setIdDoPais(e.bairro.cidade.estado.pais.id);
                }
            } catch (err) {
                setMensagemErro("Erro ao carregar dados do fornecedor.");
            } finally {
                setEstaCarregandoDados(false);
            }
        };

        if (identificadorDoFornecedor) carregarTudo();
    }, [identificadorDoFornecedor]);

    const processarEnvio = async (evento: FormEvent) => {
        evento.preventDefault();
        setEstaSubmetendo(true);
        setMensagemErro(null);

        const payload = {
            nomeFantasia,
            razaoSocial,
            cnpj: cnpj.replace(/\D/g, ""),
            ativo: statusAtivoDoFornecedor,
            enderecos: [{
                id: identificadorDoEnderecoExistente,
                nome: textoDaRua,
                numero: Number(numeroLogradouro),
                bairro: {
                    id: idDoBairro,
                    nome: textoDoBairro,
                    cidade: {
                        id: idDaCidade,
                        nome: textoDaCidade,
                        estado: {
                            id: idDoEstado,
                            nome: textoDoEstado,
                            pais: { id: idDoPais, nome: textoDoPais }
                        }
                    }
                }
            }]
        };

        try {
            await instancia.put(`/fornecedor/${identificadorDoFornecedor}`, payload);
            setMensagemSucesso("Cadastro atualizado com sucesso!");
            setTimeout(() => navegadorDePaginas.push("/fornecedor/lista"), 2000);
        } catch (err: any) {
            setMensagemErro(err.response?.data?.message || "Erro na atualização.");
        } finally {
            setEstaSubmetendo(false);
        }
    };

    if (estaCarregandoDados) {
        return <div className="flex items-center justify-center h-screen font-black uppercase italic text-slate-400 animate-pulse">Sincronizando dados...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full"><Menu /></header>
            {mensagemErro && <AlertMessage type="error" message={mensagemErro} onClose={() => setMensagemErro(null)} />}
            {mensagemSucesso && <AlertMessage type="success" message={mensagemSucesso} onClose={() => setMensagemSucesso(null)} />}

            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-5xl mx-auto">
                        
                        <header className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-md">
                                    <Users className="text-white w-7 h-7" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 uppercase">Editar Fornecedor</h1>
                            </div>
                            <button onClick={() => navegadorDePaginas.back()} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                <ArrowLeft className="w-7 h-7" />
                            </button>
                        </header>

                        <form onSubmit={processarEnvio} className="bg-white border border-slate-200 p-8 md:p-12 rounded-[3rem] shadow-sm space-y-12">
                            
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                    <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest">Empresa</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Razão Social</label>
                                        <input type="text" value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Nome Fantasia</label>
                                        <input type="text" value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-700 uppercase ml-1">CNPJ</label>
                                        <input type="text" value={cnpj} onChange={(e) => setCnpj(aplicarMascaraCnpj(e.target.value))} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-3">
                                        <label className="text-xs font-black text-slate-700 uppercase ml-1 tracking-widest">Status de Operação</label>
                                        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
                                            <button type="button" onClick={() => setStatusAtivoDoFornecedor(true)} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${statusAtivoDoFornecedor ? 'bg-white text-green-600 shadow-sm border border-green-50' : 'text-slate-500'}`}>
                                                <CheckCircle2 className="w-4 h-4" /> ATIVO
                                            </button>
                                            <button type="button" onClick={() => setStatusAtivoDoFornecedor(false)} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all ${!statusAtivoDoFornecedor ? 'bg-white text-red-600 shadow-sm border border-red-50' : 'text-slate-500'}`}>
                                                <XCircle className="w-4 h-4" /> INATIVO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                                    <MapPinned className="w-5 h-5 text-indigo-600" />
                                    <h2 className="font-black text-slate-800 uppercase text-sm tracking-widest">Endereço</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EntradaComSugestao 
                                        rotulo="País" valor={textoDoPais} 
                                        listaDeSugestoes={listaPaises.filter(p => p.nome.toLowerCase().includes(textoDoPais.toLowerCase()))}
                                        aoAlterarValor={(v) => { setTextoDoPais(v); const m = listaPaises.find(p => p.nome.toLowerCase() === v.toLowerCase()); setIdDoPais(m ? m.id : null); }}
                                        aoSelecionarItem={(i) => { setTextoDoPais(i.nome); setIdDoPais(i.id); }}
                                    />
                                    <EntradaComSugestao 
                                        rotulo="Estado" valor={textoDoEstado} 
                                        listaDeSugestoes={listaEstados.filter(e => e.pais?.id === idDoPais && e.nome.toLowerCase().includes(textoDoEstado.toLowerCase()))}
                                        aoAlterarValor={(v) => { setTextoDoEstado(v); const m = listaEstados.find(e => e.nome.toLowerCase() === v.toLowerCase() && e.pais?.id === idDoPais); setIdDoEstado(m ? m.id : null); }}
                                        aoSelecionarItem={(i) => { setTextoDoEstado(i.nome); setIdDoEstado(i.id); }}
                                    />
                                    <EntradaComSugestao 
                                        rotulo="Cidade" valor={textoDaCidade} 
                                        listaDeSugestoes={listaCidades.filter(c => c.estado?.id === idDoEstado && c.nome.toLowerCase().includes(textoDaCidade.toLowerCase()))}
                                        aoAlterarValor={(v) => { setTextoDaCidade(v); const m = listaCidades.find(c => c.nome.toLowerCase() === v.toLowerCase() && c.estado?.id === idDoEstado); setIdDaCidade(m ? m.id : null); }}
                                        aoSelecionarItem={(i) => { setTextoDaCidade(i.nome); setIdDaCidade(i.id); }}
                                    />
                                    <EntradaComSugestao 
                                        rotulo="Bairro" valor={textoDoBairro} 
                                        listaDeSugestoes={listaBairros.filter(b => b.cidade?.id === idDaCidade && b.nome.toLowerCase().includes(textoDoBairro.toLowerCase()))}
                                        aoAlterarValor={(v) => { setTextoDoBairro(v); const m = listaBairros.find(b => b.nome.toLowerCase() === v.toLowerCase() && b.cidade?.id === idDaCidade); setIdDoBairro(m ? m.id : null); }}
                                        aoSelecionarItem={(i) => { setTextoDoBairro(i.nome); setIdDoBairro(i.id); }}
                                    />
                                    <div className="md:col-span-1">
                                        <EntradaComSugestao 
                                            rotulo="Logradouro / Rua" valor={textoDaRua} 
                                            listaDeSugestoes={listaEnderecos.filter(e => e.bairro?.id === idDoBairro && e.nome.toLowerCase().includes(textoDaRua.toLowerCase()))}
                                            aoAlterarValor={(v) => setTextoDaRua(v)}
                                            aoSelecionarItem={(i) => setTextoDaRua(i.nome)}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-slate-700 uppercase ml-1">Número</label>
                                        <input type="text" value={numeroLogradouro} onChange={(e) => setNumeroLogradouro(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-indigo-600 font-bold" />
                                    </div>
                                </div>
                            </section>

                            <div className="flex justify-end pt-8 border-t border-slate-100">
                                <button type="submit" disabled={estaSubmetendo} className="w-full md:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                                    <Save className="w-5 h-5" /> {estaSubmetendo ? "Gravando..." : "Salvar Alterações"}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default EdicaoFornecedor;