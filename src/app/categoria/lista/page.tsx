'use client'

import Menu from "@/src/components/Menu"
import Sidebar from "@/src/components/Sidebar";

const ListarCategorias = () => {

    return (
        <div>
            <Menu />
            <div>
                <Sidebar />
                <main className="flex-1 md:ml-64 p-8">
                    <div className="max-w-2xl"> 
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                            Categorias
                        </h1>
                        <div className="mt-6">
                            <p className="text-lg text-gray-600 leading-relaxed text-justify">
                                Aqui será uma área de listagem de categorias!
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default ListarCategorias;