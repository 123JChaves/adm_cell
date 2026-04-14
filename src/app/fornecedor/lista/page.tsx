'use client'

import Menu from "@/src/components/Menu";
import Sidebar from "@/src/components/Sidebar";
import Footer from "@/src/components/Footer";

const ListaDeFornecedores = () => {
    return (
        // 1. min-h-screen garante que o layout ocupe no mínimo a altura toda da tela
        // 2. flex-col organiza os filhos (Menu, Meio, Footer) em coluna
        <div className="flex flex-col min-h-screen">
            <Menu />
            
            {/* 3. flex-1 faz este div crescer e ocupar todo o espaço vazio, empurrando o footer */}
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8">
                    <div className="max-w-2xl"> 
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Fornecedores
                        </h1>
                        <div className="mt-6">
                            <p className="text-lg text-gray-600 leading-relaxed text-justify">
                                Aqui será uma área de listagem de fornecedores!
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            <Footer />
        </div>
    );
}

export default ListaDeFornecedores;