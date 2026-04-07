'use client'
import instancia from "@/src/service/api";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
    id: string;
    router: string;
    onSuccess?: () => void;
    setError: (message: string | null) => void;
    setSuccess: (message: string | null) => void;
    className?: string; // 1. Adicionado aqui na Interface
}

const DeleteButton = ({ id, router, onSuccess, setError, setSuccess, className }: DeleteButtonProps) => {

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Tem certeza?",
            text: "Esta ação não pode ser desfeita!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sim, excluir!",
            cancelButtonText: "Cancelar"
        });

        if (!result.isConfirmed) return;

        setError(null);
        setSuccess(null);
        
        try {
            const response = await instancia.delete(`${router}/${id}`);
            setSuccess(response.data.message || "Registro apagado com sucesso!");
            if(onSuccess) {
                onSuccess()
            }
        } catch (error:any) {
            setError(error.response?.data?.message || "Erro ao apagar o registro!");
        }
    }

    return (
        <button 
            onClick={handleDelete}
            
            className={`
                group/btn flex items-center gap-2 px-3 py-2 
                bg-transparent hover:bg-red-50 
                active:bg-red-100 rounded-lg 
                transition-all duration-200
                ${className}
            `}
            title="Excluir Registro"
        >
            <Trash2 
                className="w-4 h-4 text-gray-700 
                group-hover/btn:text-red-700 
                group-active/btn:text-red-800 
                transition-colors duration-200" 
            />
            <span 
                className="md:hidden lg:inline text-gray-700 
                group-hover/btn:text-red-700 
                group-active/btn:text-red-800 
                transition-colors duration-200 font-medium text-sm"
            >
                Excluir
            </span>
        </button>
    );

}


export default DeleteButton;