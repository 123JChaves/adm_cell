"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import EntradaComSugestao from "@/src/utils/AutoComplete";
import axios from "axios";
import { 
    Users, Save, ArrowLeft, ListFilter, Building2, 
    Fingerprint, FileText, MapPinned, Hash 
} from "lucide-react";
import Link from "next/link";

interface EntidadeGeograficaBase {
    id: number;
    nome: string;
    pais?: { id: number };
    estado?: { id: number };
    cidade?: { id: number };
    bairro?: { id: number };
}

const CadastroFornecedor = () => {
    // ESTADOS DE CONTROLE DE FEEDBACK E INTERFACE
    const [estaCarregandoProcessamento, setEstaCarregandoProcessamento] = useState<boolean>(false);
    const [mensagemDeErroGeral, setMensagemDeErroGeral] = useState<string | null>(null);
    const [mensagemDeSucessoGeral, setMensagemDeSucessoGeral] = useState<string | null>(null);
    const [dicionarioErrosDosCampos, setDicionarioErrosDosCampos] = useState<Record<string, string>>({});

    // ESTADOS DOS DADOS JURÍDICOS DO FORNECEDOR
    const [nomeFantasiaDoFornecedor, setNomeFantasiaDoFornecedor] = useState<string>("");
    const [razaoSocialDoFornecedor, setRazaoSocialDoFornecedor] = useState<string>("");
    const [cnpjDoFornecedor, setCnpjDoFornecedor] = useState<string>("");

    // ESTADOS DO ENDEREÇO FÍSICO
    const [textoDoNomeDaRua, setTextoDoNomeDaRua] = useState<string>("");
    const [identificadorDoEnderecoNoBanco, setIdentificadorDoEnderecoNoBanco] = useState<number | null>(null);
    const [numeroDoLogradouro, setNumeroDoLogradouro] = useState<string>("");

    // ESTADOS DA HIERARQUIA GEOGRÁFICA
    const [textoDoBairro, setTextoDoBairro] = useState<string>("");
    const [identificadorDoBairroNoBanco, setIdentificadorDoBairroNoBanco] = useState<number | null>(null);
    const [textoDaCidade, setTextoDaCidade] = useState<string>("");
    const [identificadorDaCidadeNoBanco, setIdentificadorDaCidadeNoBanco] = useState<number | null>(null);
    const [textoDoEstado, setTextoDoEstado] = useState<string>("");
    const [identificadorDoEstadoNoBanco, setIdentificadorDoEstadoNoBanco] = useState<number | null>(null);
    const [textoDoPais, setTextoDoPais] = useState<string>("");
    const [identificadorDoPaisNoBanco, setIdentificadorDoPaisNoBanco] = useState<number | null>(null);

    // ESTADOS DAS LISTAS DE APOIO PARA SUGESTÕES
    const [listaDePaisesDoBanco, setListaDePaisesDoBanco] = useState<EntidadeGeograficaBase[]>([]);
    const [listaDeEstadosDoBanco, setListaDeEstadosDoBanco] = useState<EntidadeGeograficaBase[]>([]);
    const [listaDeCidadesDoBanco, setListaDeCidadesDoBanco] = useState<EntidadeGeograficaBase[]>([]);
    const [listaDeBairrosDoBanco, setListaDeBairrosDoBanco] = useState<EntidadeGeograficaBase[]>([]);
    const [listaDeEnderecosDoBanco, setListaDeEnderecosDoBanco] = useState<EntidadeGeograficaBase[]>([]);

    useEffect(() => {
        const carregarTodasAsListasGeograficasParaSugestao = async () => {
            try {
                const [respostaPaises, respostaEstados, respostaCidades, respostaBairros, respostaEnderecos] = await Promise.all([
                    instancia.get("/paises"), 
                    instancia.get("/estados"),
                    instancia.get("/cidades"), 
                    instancia.get("/bairros"),
                    instancia.get("/enderecos"),
                ]);
                setListaDePaisesDoBanco(respostaPaises.data); 
                setListaDeEstadosDoBanco(respostaEstados.data);
                setListaDeCidadesDoBanco(respostaCidades.data); 
                setListaDeBairrosDoBanco(respostaBairros.data);
                setListaDeEnderecosDoBanco(respostaEnderecos.data);
            } catch {
                setMensagemDeErroGeral("Falha ao sincronizar as listas geográficas do servidor.");
            }
        };
        carregarTodasAsListasGeograficasParaSugestao();
    }, []);

    const aplicarMascaraDeCnpjParaVisualizacao = (valorOriginal: string) => {
        const apenasDigitosNumericos = valorOriginal.replace(/\D/g, "").slice(0, 14);
        return apenasDigitosNumericos.replace(/^(\d{2})(\d)/, "$1.$2")
                .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1/$2")
                .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
    };

    const filtrarListaDeSugestoesPeloTermoDigitado = (listaParaFiltrar: EntidadeGeograficaBase[], termoDeBusca: string) => {
        return termoDeBusca.length < 1 ? [] : listaParaFiltrar.filter(item => item.nome.toLowerCase().includes(termoDeBusca.toLowerCase()));
    };

    const gerenciarMudancaNoCampoDeAutoComplete = (valorDigitado: string, listaReferencia: EntidadeGeograficaBase[], atualizarTexto: (valor: string) => void, atualizarIdentificador: (id: number | null) => void, nivelHierarquico?: string) => {
        atualizarTexto(valorDigitado);
        const itemEncontradoNaLista = listaReferencia.find(item => item.nome.toLowerCase() === valorDigitado.toLowerCase());
        atualizarIdentificador(itemEncontradoNaLista ? itemEncontradoNaLista.id : null);
        
        if (nivelHierarquico === "pais") { setTextoDoEstado(""); setIdentificadorDoEstadoNoBanco(null); }
        if (nivelHierarquico === "estado") { setTextoDaCidade(""); setIdentificadorDaCidadeNoBanco(null); }
        if (nivelHierarquico === "cidade") { setTextoDoBairro(""); setIdentificadorDoBairroNoBanco(null); }
        if (nivelHierarquico === "bairro") { setTextoDoNomeDaRua(""); setIdentificadorDoEnderecoNoBanco(null); }
    };

    const processarEnvioDoFormularioDeCadastro = async (eventoDeEnvio: FormEvent<HTMLFormElement>) => {
        eventoDeEnvio.preventDefault();
        setDicionarioErrosDosCampos({});
        setMensagemDeErroGeral(null);
        setMensagemDeSucessoGeral(null);

        const errosDetectadosNaValidacao: Record<string, string> = {};
        if (!razaoSocialDoFornecedor.trim()) errosDetectadosNaValidacao.razaoSocial = "A Razão Social é obrigatória.";
        if (!nomeFantasiaDoFornecedor.trim()) errosDetectadosNaValidacao.nomeFantasia = "O Nome Fantasia é obrigatório.";
        if (cnpjDoFornecedor.length < 18) errosDetectadosNaValidacao.cnpj = "O CNPJ informado é inválido.";
        if (!textoDoPais.trim()) errosDetectadosNaValidacao.Pais = "O País é obrigatório.";
        if (!textoDoEstado.trim()) errosDetectadosNaValidacao.Estado = "O Estado é obrigatório.";
        if (!textoDaCidade.trim()) errosDetectadosNaValidacao.Cidade = "A Cidade é obrigatória.";
        if (!textoDoBairro.trim()) errosDetectadosNaValidacao.Bairro = "O Bairro é obrigatório.";
        if (!textoDoNomeDaRua.trim()) errosDetectadosNaValidacao.Endereco = "O Endereço é obrigatório.";
        if (!numeroDoLogradouro.trim()) errosDetectadosNaValidacao.numero = "O número é obrigatório.";

        if (Object.keys(errosDetectadosNaValidacao).length > 0) {
            setDicionarioErrosDosCampos(errosDetectadosNaValidacao);
            setMensagemDeErroGeral("Por favor, preencha os campos obrigatórios destacados.");
            return;
        }

        setEstaCarregandoProcessamento(true);

        const objetoParaEnvioAoServidor = {
            nomeFantasia: nomeFantasiaDoFornecedor.trim(),
            razaoSocial: razaoSocialDoFornecedor.trim(),
            cnpj: cnpjDoFornecedor.replace(/\D/g, ""),
            enderecos: [{
                nome: textoDoNomeDaRua,
                numero: Number(numeroDoLogradouro),
                bairro: {
                    id: identificadorDoBairroNoBanco,
                    nome: textoDoBairro,
                    cidade: {
                        id: identificadorDaCidadeNoBanco,
                        nome: textoDaCidade,
                        estado: {
                            id: identificadorDoEstadoNoBanco,
                            nome: textoDoEstado,
                            pais: { id: identificadorDoPaisNoBanco, nome: textoDoPais }
                        }
                    }
                }
            }]
        };

        try {
            const respostaDoServidor = await instancia.post("/fornecedor", objetoParaEnvioAoServidor);
            setMensagemDeSucessoGeral(respostaDoServidor.data.message || "Fornecedor cadastrado com sucesso!");
            limparTodosOsCamposDoFormulario();
        } catch (erroCapturadoNoServidor: any) {
            setMensagemDeErroGeral(erroCapturadoNoServidor.response?.data?.message || "Erro ao processar o cadastro.");
        } finally {
            setEstaCarregandoProcessamento(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const limparTodosOsCamposDoFormulario = () => {
        setNomeFantasiaDoFornecedor(""); 
        setRazaoSocialDoFornecedor(""); 
        setCnpjDoFornecedor("");
        setTextoDoNomeDaRua(""); 
        setNumeroDoLogradouro(""); 
        setTextoDoBairro("");
        setTextoDaCidade(""); 
        setTextoDoEstado(""); 
        setTextoDoPais("");
        setIdentificadorDoBairroNoBanco(null); 
        setIdentificadorDaCidadeNoBanco(null); 
        setIdentificadorDoEstadoNoBanco(null); 
        setIdentificadorDoPaisNoBanco(null);
    };

        return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full">
                <Menu />
            </header>

            {/* ALERTAS UNIFICADOS - Com onClose para resetar o estado e permitir novos disparos */}
            {mensagemDeErroGeral && (
                <AlertMessage 
                    type="error" 
                    message={mensagemDeErroGeral} 
                    onClose={() => setMensagemDeErroGeral(null)} 
                />
            )}
            {mensagemDeSucessoGeral && (
                <AlertMessage 
                    type="success" 
                    message={mensagemDeSucessoGeral} 
                    onClose={() => setMensagemDeSucessoGeral(null)} 
                />
            )}

            <div className="flex flex-1">
                <Sidebar />

                <main className="flex-1 md:ml-64 p-6 md:p-12 transition-all">
                    <div className="max-w-5xl mx-auto">
                        
                        {/* Cabeçalho da Página */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-md shadow-indigo-100">
                                        <Users className="text-white w-6 h-6" />
                                    </div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                        Novo Fornecedor
                                    </h1>
                                </div>
                                <p className="text-slate-500 font-medium mt-2 ml-1">
                                    Gestão de parceiros e logradouros em tempo real.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link 
                                    href="/fornecedor/lista" 
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
                                >
                                    <ListFilter className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                                    Listar Fornecedores
                                </Link>
                            </div>
                        </header>

                        {/* Formulário Principal */}
                        <form 
                            onSubmit={processarEnvioDoFormularioDeCadastro} 
                            className="bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 md:p-12 space-y-10"
                        >
                            {/* SEÇÃO: DADOS ORGANIZACIONAIS */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <Building2 className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                                        Dados Organizacionais
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-sm text-slate-700 ml-1">Nome Fantasia:</label>
                                        <input 
                                            type="text"
                                            value={nomeFantasiaDoFornecedor} 
                                            onChange={(evento) => setNomeFantasiaDoFornecedor(evento.target.value)}
                                            className={`w-full p-4 bg-slate-50 border ${dicionarioErrosDosCampos.nomeFantasia ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                            placeholder="Ex: Tech Solutions"
                                        />
                                        {dicionarioErrosDosCampos.nomeFantasia && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.nomeFantasia}</span>}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-sm text-slate-700 ml-1">CNPJ:</label>
                                        <input 
                                            type="text"
                                            placeholder="00.000.000/0000-00"
                                            value={cnpjDoFornecedor} 
                                            onChange={(eventoDeDigitacao) => {
                                                const valorFormatado = aplicarMascaraDeCnpjParaVisualizacao(eventoDeDigitacao.target.value);
                                                setCnpjDoFornecedor(valorFormatado);
                                                if (dicionarioErrosDosCampos.cnpj) {
                                                    setDicionarioErrosDosCampos((errosAnteriores) => ({ ...errosAnteriores, cnpj: "" }));
                                                }
                                            }}
                                            className={`w-full p-4 bg-slate-50 border ${dicionarioErrosDosCampos.cnpj ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                        />
                                        {dicionarioErrosDosCampos.cnpj && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.cnpj}</span>}
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="font-bold text-sm text-slate-700 ml-1">Razão Social:</label>
                                        <input 
                                            type="text"
                                            value={razaoSocialDoFornecedor} 
                                            onChange={(evento) => setRazaoSocialDoFornecedor(evento.target.value)}
                                            className={`w-full p-4 bg-slate-50 border ${dicionarioErrosDosCampos.razaoSocial ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                            placeholder="Nome oficial da empresa"
                                        />
                                        {dicionarioErrosDosCampos.razaoSocial && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.razaoSocial}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO: ENDEREÇO E LOCALIZAÇÃO */}
                            <div className="space-y-6 pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                                    <MapPinned className="w-5 h-5 text-indigo-600" />
                                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                                        Endereço e Localização
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EntradaComSugestao
                                        rotulo="País"
                                        valor={textoDoPais}
                                        listaDeSugestoes={filtrarListaDeSugestoesPeloTermoDigitado(listaDePaisesDoBanco, textoDoPais)}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoDeAutoComplete(valor, listaDePaisesDoBanco, setTextoDoPais, setIdentificadorDoPaisNoBanco, "pais")}
                                        aoSelecionarItem={(item) => {
                                            setTextoDoPais(item.nome);
                                            setIdentificadorDoPaisNoBanco(item.id);
                                            setTextoDoEstado("");
                                            setIdentificadorDoEstadoNoBanco(null);
                                        }}
                                        ehNovoRegistro={!identificadorDoPaisNoBanco && textoDoPais.length > 0}
                                        textoDeFundo="Procure o país..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Pais}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Estado" 
                                        valor={textoDoEstado} 
                                        listaDeSugestoes={filtrarListaDeSugestoesPeloTermoDigitado(
                                            listaDeEstadosDoBanco.filter((estado) => estado.pais?.id === identificadorDoPaisNoBanco), 
                                            textoDoEstado
                                        )}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoDeAutoComplete(valor, listaDeEstadosDoBanco, setTextoDoEstado, setIdentificadorDoEstadoNoBanco, "estado")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoDoEstado(item.nome); 
                                            setIdentificadorDoEstadoNoBanco(item.id); 
                                            setTextoDaCidade(""); 
                                            setIdentificadorDaCidadeNoBanco(null);
                                        }}
                                        ehNovoRegistro={!identificadorDoEstadoNoBanco && textoDoEstado.length > 0}
                                        textoDeFundo="Procure o estado..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Estado}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Cidade" 
                                        valor={textoDaCidade} 
                                        listaDeSugestoes={filtrarListaDeSugestoesPeloTermoDigitado(
                                            listaDeCidadesDoBanco.filter((cidade) => cidade.estado?.id === identificadorDoEstadoNoBanco), 
                                            textoDaCidade
                                        )}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoDeAutoComplete(valor, listaDeCidadesDoBanco, setTextoDaCidade, setIdentificadorDaCidadeNoBanco, "cidade")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoDaCidade(item.nome); 
                                            setIdentificadorDaCidadeNoBanco(item.id); 
                                            setTextoDoBairro(""); 
                                            setIdentificadorDoBairroNoBanco(null);
                                        }}
                                        ehNovoRegistro={!identificadorDaCidadeNoBanco && textoDaCidade.length > 0}
                                        textoDeFundo="Procure a cidade..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Cidade}
                                    />

                                    <EntradaComSugestao
                                        rotulo="Bairro" 
                                        valor={textoDoBairro} 
                                        listaDeSugestoes={filtrarListaDeSugestoesPeloTermoDigitado(
                                            listaDeBairrosDoBanco.filter((bairro) => bairro.cidade?.id === identificadorDaCidadeNoBanco), 
                                            textoDoBairro
                                        )}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoDeAutoComplete(valor, listaDeBairrosDoBanco, setTextoDoBairro, setIdentificadorDoBairroNoBanco, "bairro")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoDoBairro(item.nome); 
                                            setIdentificadorDoBairroNoBanco(item.id); 
                                            setTextoDoNomeDaRua(""); 
                                            setIdentificadorDoEnderecoNoBanco(null);
                                        }}
                                        ehNovoRegistro={!identificadorDoBairroNoBanco && textoDoBairro.length > 0}
                                        textoDeFundo="Procure o bairro..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Bairro}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Rua / Avenida (Endereço)" 
                                        valor={textoDoNomeDaRua} 
                                        listaDeSugestoes={filtrarListaDeSugestoesPeloTermoDigitado(
                                            listaDeEnderecosDoBanco.filter((endereco) => endereco.bairro?.id === identificadorDoBairroNoBanco), 
                                            textoDoNomeDaRua
                                        )}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoDeAutoComplete(valor, listaDeEnderecosDoBanco, setTextoDoNomeDaRua, setIdentificadorDoEnderecoNoBanco)}
                                        aoSelecionarItem={(item) => { 
                                            setTextoDoNomeDaRua(item.nome); 
                                            setIdentificadorDoEnderecoNoBanco(item.id); 
                                        }}
                                        ehNovoRegistro={!identificadorDoEnderecoNoBanco && textoDoNomeDaRua.length > 0}
                                        textoDeFundo="Nome da rua..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Endereco}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-sm text-slate-700 ml-1">Número:</label>
                                        <input 
                                            type="text"
                                            value={numeroDoLogradouro} 
                                            onChange={(evento) => setNumeroDoLogradouro(evento.target.value)}
                                            className={`w-full p-4 bg-slate-50 border ${dicionarioErrosDosCampos.numero ? 'border-red-500' : 'border-slate-200'} rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all`}
                                            placeholder="Ex: 123"
                                        />
                                        {dicionarioErrosDosCampos.numero && <span className="text-red-500 text-xs font-bold ml-1">{dicionarioErrosDosCampos.numero}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Botão de Submissão */}
                            <div className="flex justify-end pt-8 border-t border-slate-50">
                                <button 
                                    type="submit" 
                                    disabled={estaCarregandoProcessamento}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {estaCarregandoProcessamento ? "Processando..." : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Finalizar Cadastro
                                        </>
                                    )}
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

export default CadastroFornecedor;