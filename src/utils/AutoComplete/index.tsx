'use client';

import { useState, KeyboardEvent } from "react";

interface PropriedadesDaEntradaComSugestao {
    rotulo: string;
    valor: string;
    aoAlterarValor: (novoValor: string) => void;
    aoSelecionarItem: (item: { id: number; nome: string }) => void;
    listaDeSugestoes: Array<{ id: number; nome: string }>;
    ehNovoRegistro?: boolean;
    estaDesativado?: boolean;
    textoDeFundo?: string;
    mensagemDeErro?: string;
}

const EntradaComSugestao = ({
    rotulo,
    valor,
    aoAlterarValor,
    listaDeSugestoes,
    aoSelecionarItem,
    ehNovoRegistro = false,
    estaDesativado = false,
    textoDeFundo = "",
    mensagemDeErro
}: PropriedadesDaEntradaComSugestao) => { // Adicionado '=>' que faltava na definição
    
    const [estaAberto, setEstaAberto] = useState(false);
    const [posicaoDoCursor, setPosicaoDoCursor] = useState(-1);

    const gerenciarTeclasPressionadas = (eventoDeTeclado: KeyboardEvent<HTMLInputElement>) => {
        if (!estaAberto || listaDeSugestoes.length === 0) return;

        if (eventoDeTeclado.key === "ArrowDown") {
            setPosicaoDoCursor(anterior => (anterior < listaDeSugestoes.length - 1 ? anterior + 1 : anterior));
        } 
        else if (eventoDeTeclado.key === "ArrowUp") {
            setPosicaoDoCursor(anterior => (anterior > 0 ? anterior - 1 : anterior));
        } 
        else if (eventoDeTeclado.key === "Enter") {
            eventoDeTeclado.preventDefault();
            if (posicaoDoCursor >= 0 && posicaoDoCursor < listaDeSugestoes.length) {
                confirmarSelecao(listaDeSugestoes[posicaoDoCursor]);
            }
        }
        else if (eventoDeTeclado.key === "Escape") {
            setEstaAberto(false);
        }
    };

    const confirmarSelecao = (itemSelecionado: { id: number; nome: string }) => {
        aoAlterarValor(itemSelecionado.nome);
        aoSelecionarItem(itemSelecionado);
        setEstaAberto(false);
        setPosicaoDoCursor(-1);
    };

    return (
        <div className="flex flex-col relative w-full mb-4">
            <label className="font-bold text-sm flex justify-between items-center mb-1 text-slate-700">
                <span>{rotulo}:</span>
                {ehNovoRegistro && (
                    <span className="text-orange-600 text-[10px] font-black bg-orange-100 px-2 py-0.5 rounded animate-pulse tracking-tight">
                        [NOVO REGISTRO]
                    </span>
                )}
            </label>

            <input
                type="text"
                autoComplete="off" 
                name={`campo-aleatorio-${rotulo.toLowerCase().replace(/\s/g, '-')}`}
                data-lpignore="true" 
                value={valor}
                disabled={estaDesativado}
                placeholder={textoDeFundo}
                onKeyDown={gerenciarTeclasPressionadas}
                onChange={(eventoDeDigitacao) => {
                    aoAlterarValor(eventoDeDigitacao.target.value);
                    setEstaAberto(true);
                    setPosicaoDoCursor(-1);
                }}
                onBlur={() => setTimeout(() => setEstaAberto(false), 200)}
                className={`border p-3 rounded-xl outline-none focus:ring-4 transition-all ${
                    mensagemDeErro 
                    ? 'border-red-500 bg-red-50 focus:ring-red-200' 
                    : 'border-slate-200 bg-slate-50 focus:ring-indigo-500/10 focus:border-indigo-600'
                } ${estaDesativado ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''}`}
            />

            {mensagemDeErro && (
                <span className="text-red-500 text-[11px] font-bold mt-1 ml-1">
                    {mensagemDeErro}
                </span>
            )}

            {estaAberto && listaDeSugestoes.length > 0 && (
                <ul className="absolute z-50 top-[76px] w-full bg-white border border-slate-200 rounded-xl shadow-2xl max-h-52 overflow-y-auto py-1 border-t-0">
                    {listaDeSugestoes.map((itemIndividual, indiceNoLaco) => (
                        <li
                            key={itemIndividual.id}
                            onMouseEnter={() => setPosicaoDoCursor(indiceNoLaco)}
                            onClick={() => confirmarSelecao(itemIndividual)}
                            className={`px-4 py-3 cursor-pointer text-sm font-medium transition-colors ${
                                posicaoDoCursor === indiceNoLaco 
                                ? 'bg-indigo-600 text-white' 
                                : 'hover:bg-indigo-50 text-slate-700'
                            }`}
                        >
                            {itemIndividual.nome}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EntradaComSugestao;