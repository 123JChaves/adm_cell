"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";
import instancia from "@/src/service/api";
import AlertMessage from "@/src/utils/Alert";
import EntradaComSugestao from "@/src/utils/AutoComplete";
import { 
    Users, Save, ArrowLeft, ListFilter, Building2, 
    Fingerprint, FileText, MapPinned, Hash 
} from "lucide-react";
import Link from "next/link";

// Interfaces Estritas para Tipagem
interface EntidadeGeograficaBase {
    id: number;
    nome: string;
    pais?: { id: number };
    estado?: { id: number };
    cidade?: { id: number };
    bairro?: { id: number };
}

const CadastroFornecedor = () => {
    // ESTADOS DE CONTROLE DE FEEDBACK
    const [estaCarregandoProcessamento, setEstaCarregandoProcessamento] = useState<boolean>(false);
    const [mensagemDeErroGeral, setMensagemDeErroGeral] = useState<string | null>(null);
    const [mensagemDeSucesso, setMensagemDeSucesso] = useState<string | null>(null);
    const [dicionarioErrosDosCampos, setDicionarioErrosDosCampos] = useState<Record<string, string>>({});

    // ESTADOS DO FORNECEDOR (DADOS JURÍDICOS)
    const [nomeFantasiaFornecedor, setNomeFantasiaFornecedor] = useState<string>("");
    const [razaoSocialFornecedor, setrazaoSocialFornecedor] = useState<string>("");
    const [cnpjFornecedor, setCnpjFornecedor] = useState<string>("");

    // ESTADOS DO ENDEREÇO (Endereco)
    const [textoEndereco, setTextoEndereco] = useState<string>("");
    const [identificadorEndereco, setIdentificadorEndereco] = useState<number | null>(null);
    const [numeroDoEndereco, setNumeroDoEndereco] = useState<string>("");

    // ESTADOS GEOGRÁFICOS (TEXTO E IDENTIFICADOR)
    const [textoBairro, setTextoBairro] = useState<string>("");
    const [identificadorBairro, setIdentificadorBairro] = useState<number | null>(null);
    const [textoCidade, setTextoCidade] = useState<string>("");
    const [identificadorCidade, setIdentificadorCidade] = useState<number | null>(null);
    const [textoEstado, setTextoEstado] = useState<string>("");
    const [identificadorEstado, setIdentificadorEstado] = useState<number | null>(null);
    const [textoPais, setTextoPais] = useState<string>("");
    const [identificadorPais, setIdentificadorPais] = useState<number | null>(null);

    // ESTADOS DAS LISTAS DO BANCO DE DADOS (LEITURA)
    const [bancoDeDadosPaises, setBancoDeDadosPaises] = useState<EntidadeGeograficaBase[]>([]);
    const [bancoDeDadosEstados, setBancoDeDadosEstados] = useState<EntidadeGeograficaBase[]>([]);
    const [bancoDeDadosCidades, setBancoDeDadosCidades] = useState<EntidadeGeograficaBase[]>([]);
    const [bancoDeDadosBairros, setBancoDeDadosBairros] = useState<EntidadeGeograficaBase[]>([]);
    const [bancoDeDadosEnderecos, setBancoDeDadosEnderecos] = useState<EntidadeGeograficaBase[]>([]);

    // CARGA INICIAL PARA SINCRONIZAÇÃO DAS LISTAS
    useEffect(() => {
        const carregarListasDeApoioGeograficas = async () => {
            try {
                const [respostaPaises, respostaEstados, respostaCidades, respostaBairros, respostaEnderecos] = await Promise.all([
                    instancia.get<EntidadeGeograficaBase[]>("/paises"),
                    instancia.get<EntidadeGeograficaBase[]>("/estados"),
                    instancia.get<EntidadeGeograficaBase[]>("/cidades"),
                    instancia.get<EntidadeGeograficaBase[]>("/bairros"),
                    instancia.get<EntidadeGeograficaBase[]>("/enderecos"),
                ]);
                setBancoDeDadosPaises(respostaPaises.data);
                setBancoDeDadosEstados(respostaEstados.data);
                setBancoDeDadosCidades(respostaCidades.data);
                setBancoDeDadosBairros(respostaBairros.data);
                setBancoDeDadosEnderecos(respostaEnderecos.data);
            } catch {
                setMensagemDeErroGeral("Houve uma falha ao sincronizar as listas de endereços.");
            }
        };
        carregarListasDeApoioGeograficas();
    }, []);

    const formatarCNPJ = (valorInformado: string) => {

    const apenasNumerosCnpj = valorInformado.replace(/\D/g, "").slice(0, 14);

    return apenasNumerosCnpj
        .replace(/^(\d{2})(\d)/, "$1.$2")              // 00.
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")  // 00.000.
        .replace(/\.(\d{3})(\d)/, ".$1/$2")            // 00.000.000/
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");        // 00.000.000/0000-00
    };

    // FUNÇÕES DE FILTRAGEM E MANIPULAÇÃO
    const filtrarSugestoesPeloNome = (listaOriginal: EntidadeGeograficaBase[], termoDeBusca: string) => {
        if (termoDeBusca.length < 1) return [];
        return listaOriginal.filter((item) =>
            item.nome.toLowerCase().includes(termoDeBusca.toLowerCase())
        );
    };

    const gerenciarMudancaNoCampoComSugestao = (
        valorInformado: string, 
        listaDeDados: EntidadeGeograficaBase[], 
        atualizarTexto: (valor: string) => void, 
        atualizarIdentificador: (id: number | null) => void,
        nivelParaLimpeza?: string
    ) => {
        atualizarTexto(valorInformado);
        const registroEncontrado = listaDeDados.find((item) => item.nome.toLowerCase() === valorInformado.toLowerCase());
        atualizarIdentificador(registroEncontrado ? registroEncontrado.id : null);

        // Reset em cascata para manter a integridade hierárquica
        if (nivelParaLimpeza === "pais") { setTextoEstado(""); setIdentificadorEstado(null); }
        if (nivelParaLimpeza === "estado") { setTextoCidade(""); setIdentificadorCidade(null); }
        if (nivelParaLimpeza === "cidade") { setTextoBairro(""); setIdentificadorBairro(null); }
        if (nivelParaLimpeza === "bairro") { setTextoEndereco(""); setIdentificadorEndereco(null); }
    };

    const processarEnvioDoFormulario = async (eventoDeSubmissao: FormEvent<HTMLFormElement>) => {
    eventoDeSubmissao.preventDefault();
    setDicionarioErrosDosCampos({});
    setMensagemDeErroGeral(null);

    const errosDetectados: Record<string, string> = {};

    // Validações usando os nomes exatos dos seus states
    if (!razaoSocialFornecedor.trim()) errosDetectados.razaoSocial = "A Razão Social é obrigatória.";
    if (!nomeFantasiaFornecedor.trim()) errosDetectados.nomeFantasia = "O Nome Fantasia é obrigatório.";
    if (!cnpjFornecedor.trim()) errosDetectados.cnpj = "O CNPJ é obrigatório.";
    if (!textoPais.trim()) errosDetectados.Pais = "O País é obrigatório.";
    if (!textoEstado.trim()) errosDetectados.Estado = "O Estado é obrigatório.";
    if (!textoCidade.trim()) errosDetectados.Cidade = "A Cidade é obrigatória.";
    if (!textoBairro.trim()) errosDetectados.Bairro = "O Bairro é obrigatório.";
    if (!textoEndereco.trim()) errosDetectados.Endereco = "O Endereço é obrigatório.";
    if (!numeroDoEndereco.trim()) errosDetectados.numero = "O Número é obrigatório.";

    if (Object.keys(errosDetectados).length > 0) {
        setDicionarioErrosDosCampos(errosDetectados);
        setMensagemDeErroGeral("Por favor, preencha os campos obrigatórios destacados.");
        return;
    }

    setEstaCarregandoProcessamento(true);

        const payloadDeCadastro = {
            nomeFantasia: nomeFantasiaFornecedor.trim(),
            razaoSocial: razaoSocialFornecedor.trim(),
            cnpj: cnpjFornecedor.replace(/\D/g, ""),
            enderecos: [
                {
                    nome: textoEndereco,
                    numero: Number(numeroDoEndereco),
                    bairro: {
                        id: identificadorBairro,
                        nome: textoBairro,
                        cidade: {
                            id: identificadorCidade,
                            nome: textoCidade,
                            estado: {
                                id: identificadorEstado,
                                nome: textoEstado,
                                pais: { 
                                    id: identificadorPais, 
                                    nome: textoPais 
                                }
                            }
                        }
                    }
                }
            ]
        };

        try {
            await instancia.post("/fornecedor", payloadDeCadastro);
            setMensagemDeSucesso("Fornecedor cadastrado com sucesso!");
            
            // Limpeza dos campos após sucesso
            setNomeFantasiaFornecedor("");
            setrazaoSocialFornecedor("");
            setCnpjFornecedor("");
            setTextoEndereco("");
            setNumeroDoEndereco("");
            setTextoBairro("");
            setTextoCidade("");
            setTextoEstado("");
            setTextoPais("");
        } catch (erroCapturado: any) {
            setMensagemDeErroGeral(erroCapturado.response?.data?.message || "Erro ao processar o cadastro.");
        } finally {
            setEstaCarregandoProcessamento(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <header className="sticky top-0 z-50 w-full">
                <Menu />
            </header>

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
                                <Link href="/dashboard" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                            </div>
                        </header>

                        {/* Alertas de Feedback */}
                        <div className="mb-8">
                            {mensagemDeErroGeral && <AlertMessage type="error" message={mensagemDeErroGeral} />}
                            {mensagemDeSucesso && <AlertMessage type="success" message={mensagemDeSucesso} />}
                        </div>

                        {/* Formulário Principal */}
                        <form 
                            onSubmit={processarEnvioDoFormulario} 
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
                                            value={nomeFantasiaFornecedor} 
                                            onChange={(evento) => setNomeFantasiaFornecedor(evento.target.value)}
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
                                            value={cnpjFornecedor} 
                                            onChange={(eventoDeDigitacao) => {
                                                const valorFormatado = formatarCNPJ(eventoDeDigitacao.target.value);
                                                setCnpjFornecedor(valorFormatado);
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
                                            value={razaoSocialFornecedor} 
                                            onChange={(evento) => setrazaoSocialFornecedor(evento.target.value)}
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
                                        valor={textoPais}
                                        listaDeSugestoes={filtrarSugestoesPeloNome(bancoDeDadosPaises, textoPais)}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoComSugestao(valor, bancoDeDadosPaises, setTextoPais, setIdentificadorPais, "pais")}
                                        aoSelecionarItem={(item) => {
                                            setTextoPais(item.nome);
                                            setIdentificadorPais(item.id);
                                            setTextoEstado("");
                                            setIdentificadorEstado(null);
                                        }}
                                        ehNovoRegistro={!identificadorPais && textoPais.length > 0}
                                        textoDeFundo="Procure o país..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Pais}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Estado" 
                                        valor={textoEstado} 
                                        listaDeSugestoes={filtrarSugestoesPeloNome(bancoDeDadosEstados.filter((estado) => estado.pais?.id === identificadorPais), textoEstado)}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoComSugestao(valor, bancoDeDadosEstados, setTextoEstado, setIdentificadorEstado, "estado")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoEstado(item.nome); 
                                            setIdentificadorEstado(item.id); 
                                            setTextoCidade(""); 
                                            setIdentificadorCidade(null);
                                        }}
                                        ehNovoRegistro={!identificadorEstado && textoEstado.length > 0}
                                        textoDeFundo="Procure o estado..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Estado}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Cidade" 
                                        valor={textoCidade} 
                                        listaDeSugestoes={filtrarSugestoesPeloNome(bancoDeDadosCidades.filter((cidade) => cidade.estado?.id === identificadorEstado), textoCidade)}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoComSugestao(valor, bancoDeDadosCidades, setTextoCidade, setIdentificadorCidade, "cidade")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoCidade(item.nome); 
                                            setIdentificadorCidade(item.id); 
                                            setTextoBairro(""); 
                                            setIdentificadorBairro(null);
                                        }}
                                        ehNovoRegistro={!identificadorCidade && textoCidade.length > 0}
                                        textoDeFundo="Procure a cidade..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Cidade}
                                    />

                                    <EntradaComSugestao
                                        rotulo="Bairro" 
                                        valor={textoBairro} 
                                        listaDeSugestoes={filtrarSugestoesPeloNome(bancoDeDadosBairros.filter((bairro) => bairro.cidade?.id === identificadorCidade), textoBairro)}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoComSugestao(valor, bancoDeDadosBairros, setTextoBairro, setIdentificadorBairro, "bairro")}
                                        aoSelecionarItem={(item) => { 
                                            setTextoBairro(item.nome); 
                                            setIdentificadorBairro(item.id); 
                                            setTextoEndereco(""); 
                                            setIdentificadorEndereco(null);
                                        }}
                                        ehNovoRegistro={!identificadorBairro && textoBairro.length > 0}
                                        textoDeFundo="Procure o bairro..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Bairro}
                                    />

                                    <EntradaComSugestao 
                                        rotulo="Rua / Avenida (Endereço)" 
                                        valor={textoEndereco} 
                                        listaDeSugestoes={filtrarSugestoesPeloNome(
                                            bancoDeDadosEnderecos.filter((endereco) => endereco.bairro?.id === identificadorBairro), 
                                            textoEndereco
                                        )}
                                        aoAlterarValor={(valor) => gerenciarMudancaNoCampoComSugestao(valor, bancoDeDadosEnderecos, setTextoEndereco, setIdentificadorEndereco)}
                                        aoSelecionarItem={(item) => { 
                                            setTextoEndereco(item.nome); 
                                            setIdentificadorEndereco(item.id); 
                                        }}
                                        ehNovoRegistro={!identificadorEndereco && textoEndereco.length > 0}
                                        textoDeFundo="Nome da rua..."
                                        mensagemDeErro={dicionarioErrosDosCampos.Endereco}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <label className="font-bold text-sm text-slate-700 ml-1">Número:</label>
                                        <input 
                                            type="number"
                                            value={numeroDoEndereco} 
                                            onChange={(evento) => setNumeroDoEndereco(evento.target.value)}
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