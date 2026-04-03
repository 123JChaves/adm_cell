'use client'
import instancia from "@/src/service/api";
import Swal from "sweetalert2";

interface DeleteButtonProps {
    id: string;
    router: string;
    onSuccess?: () => void;
    setError: (message: string | null) => void;
    setSuccess: (message: string | null) => void;
    className?: string; // 1. Adicionado aqui na Interface
}

// 2. Adicionado 'className' aqui na desestruturação
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
            className={`bg-red-500 text-white rounded-md hover:bg-red-600 font-bold flex items-center justify-center ${className}`}
        >
            Excluir
        </button>
    );
}


export default DeleteButton;