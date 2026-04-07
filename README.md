# Criando um App React

Instale o framework `React`
[Comando:] `npx create-next-app@latest .`

Instalar o [axios] para realizar a conexão com o banco de dados: `npm install axios`.

Para que o framework possa ser instalado a pasta tem que estar
com letras minúsculas, evitando [cameoCase]. O projeto no [GitHub]
está com a pasta em letras minúsciulas.

## Para Rodar o Projeto

Instale o `lucide-react` para ter acesso aos símbolos na hora de rodar
o projeto.
[Comando:] `npm install lucide-react`

Instale o `SweetAlert2` para ter acesso aos alertas na hora de rodar o projeto
[Comando]: `npm install sweetalert2 sweetalert2-react-content`

Para rodar o projeto:
[Comando:] `npm run dev`

Instale uma biblioteca logica que manipula os cookies no navegador.
[Comando:] `npm install js-cookie`

Instale as declarações de tipo para que o TypeScript entenda os comandos da biblioteca e pare de exibir o erro "Cannot find module".
[Comando:] `npm install -D @types/js-cookie`