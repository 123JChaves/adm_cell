'use client'

import { useEffect } from "react";
import Swal from "sweetalert2";

interface AlertMessageProps {
    type: "success" | "error";
    message: string | null;
    onClose?: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
    useEffect(() => {
        if (message) {
            Swal.fire({
                icon: type,
                title: type === "success" ? "Sucesso" : "Erro!",
                text: message,
                confirmButtonColor: type === "success" ? "#4f46e5" : "#ef4444",
            }).then(() => {
                if (onClose) onClose();
            });
        }
    }, [message, type, onClose]);

    return null;
}