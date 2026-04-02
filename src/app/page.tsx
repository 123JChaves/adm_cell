'use client'

import { useEffect, useState } from "react";
import Home from "./home/page";

export default function HomePage() {

  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const usuarioAtual = localStorage.getItem('users');
    if(usuarioAtual) {
      const usuario = JSON.parse(usuarioAtual);
      setUserName(usuario.nome)
    }
  }, []);

  return (
    <div>
      <Home />
    </div>
  );
}
