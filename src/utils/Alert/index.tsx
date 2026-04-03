import {useEffect} from "react";
import Swal from "sweetalert2";

interface AlertMessageProps {
    type: "success" | "error";
    message: string | null;

}

export default function AlertMessage({type, message}: AlertMessageProps) {
    useEffect(() => {

        if(message) {
            Swal.fire({
                icon: type,
                title: type === "success" ? "Sucesso" : "Erro!",
                text: message,
                confirmButtonColor: type === "success" ? "#4caf50" : "#f44336",
            });
        }

    }, [message, type]);

    return null;
}