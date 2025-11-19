🚀 Portfólio Futurista - Sistema Web Completo Local

Este é um sistema de portfólio profissional completo, desenvolvido com uma arquitetura Full-Stack local (Node.js + Express + React + JSON/Multer/JWT/Bcrypt), seguindo um design futurista com Glassmorphism e Neon.

⚙️ Estrutura do Projeto

O projeto segue a estrutura lógica:

server.js: Servidor principal Node.js com Express e Multer.

auth.js, dataManager.js, middleware.js: Lógica de autenticação, CRUD de dados e proteção de rotas.

db.json: Banco de dados local em formato JSON.

public/PortfolioApp.jsx: O frontend React completo (SPA) com toda a UI e lógica.

/uploads: Pasta criada automaticamente para armazenar todos os arquivos (imagens, PDFs).

💡 Como Rodar o Projeto (Instalação e Uso)

Siga os passos abaixo para colocar o sistema no ar:

1. Pré-requisitos

Você precisa ter o Node.js e o npm (ou yarn) instalados em sua máquina.

2. Configuração e Instalação

Crie as pastas:

Crie a estrutura de pastas manualmente: uploads, uploads/perfil, uploads/certificados, uploads/thumbs, uploads/publicacoes, uploads/resume. (O server.js tentará criar o básico, mas é bom garantir).

Instale as dependências:

npm install
# ou
yarn install


Adicione um arquivo de imagem placeholder

Para evitar erros no frontend, coloque uma imagem de perfil padrão em uploads/perfil/default.png.

3. Inicialização do Servidor

Inicie o servidor Node.js com Express:

npm start
# ou
nodemon server.js (se você tiver o nodemon instalado, via `npm run dev`)


O console exibirá a mensagem: 🚀 Servidor futurista rodando em http://localhost:3001

4. Acessando o Sistema

Portfólio Público (Frontend):
Abra seu navegador em: http://localhost:3001

Painel Administrativo (Login):
Acesse: http://localhost:3001/#login

Credenciais Padrão:

Usuário: admin

Senha: senha123

🔐 Segurança

Autenticação: O sistema usa bcrypt para hashing de senha (a senha padrão já está hasheada no db.json) e JWT para proteger todas as rotas de API no painel administrativo (/api/admin/*).

Local: Todos os dados e arquivos são armazenados localmente na pasta uploads e no arquivo db.json.

✨ Destaques da Interface

Tema Dark & Neon: Estilização baseada em Tailwind CSS para criar o visual futurista.

Glassmorphism: Utilizado nos cards e no layout principal.

Foto Imersiva: A foto de perfil "flutua" sobre os cards.

Modal Dinâmico: A foto de perfil some automaticamente quando um modal de visualização de PDF (certificado/currículo) é aberto, retornando ao fechar.
