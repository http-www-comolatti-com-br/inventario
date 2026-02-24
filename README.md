'''
# Inventário de TI - Sistema de Controle de Estoque

Sistema web completo para gestão de ativos de TI, incluindo equipamentos patrimoniais e itens de consumo. Desenvolvido com Node.js (backend), React (frontend) e PostgreSQL (banco de dados), e orquestrado com Docker.

## Funcionalidades

- **Dashboard:** Visão geral com totais, status dos itens e movimentações recentes.
- **Controle de Patrimônio:** Cadastro de unidades de equipamentos (notebooks, monitores, etc.) com número de série, etiqueta patrimonial e status (disponível, em uso, manutenção, baixado).
- **Geração de QR Code:** Cada item patrimonial possui um QR Code que, ao ser escaneado, exibe todas as suas informações e histórico de movimentações.
- **Controle de Consumíveis:** Gestão de estoque de itens de consumo (cabos, toners, etc.) com controle de quantidade e alerta de estoque mínimo.
- **Gestão de Movimentações:** Registro completo de entradas, entregas a destinatários, devoluções, transferências, envios para manutenção e baixas.
- **Cadastros Auxiliares:**
    - **Modelos:** Catálogo centralizado de todos os tipos de equipamentos e consumíveis.
    - **Categorias:** Organização hierárquica dos itens.
    - **Destinatários:** Cadastro de colaboradores que recebem os equipamentos.
    - **Usuários:** Controle de acesso ao sistema com perfis (Administrador, Comum).
- **Consultas e Relatórios:** Ferramenta de busca avançada e histórico completo por equipamento.

## Tecnologias Utilizadas

| Categoria  | Tecnologia                                    |
|------------|-----------------------------------------------|
| **Backend**    | Node.js, Express, PostgreSQL, JWT, `node-postgres`, `qrcode` |
| **Frontend**   | React, Vite, Tailwind CSS, Axios, `react-router-dom` |
| **Banco de Dados** | PostgreSQL                                    |
| **Container**  | Docker, Docker Compose                        |

## Design e UI/UX

O sistema foi projetado com um tema escuro (dark mode) e uma estética moderna inspirada em elementos de tecnologia e cyberpunk, utilizando uma paleta de cores com tons de ciano, azul e roxo.

- **Layout:** Responsivo com sidebar lateral fixa e conteúdo principal.
- **Componentes:** Cards com efeito *glassmorphism*, modais para formulários, tabelas com filtros e paginação, e gráficos para visualização de dados no dashboard.
- **Tipografia:** `Inter` (ou fonte sans-serif padrão do sistema).

## Como Executar o Projeto

**Pré-requisitos:**
- Docker
- Docker Compose

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/dluconi/inventario.git
    cd inventario
    ```

2.  **Suba os containers com Docker Compose:**
    ```bash
    sudo docker compose up -d --build
    ```

3.  **Acesse a aplicação:**
    - Frontend: [http://localhost:8200](http://localhost:8200)
    - Backend API: [http://localhost:8201](http://localhost:8201)

4.  **Credenciais de Acesso:**
    - **Login:** `admin`
    - **Senha:** `comolatti`

## Estrutura dos Serviços

O ambiente é composto por 3 containers que se comunicam em uma rede Docker isolada (`inventario-network`):

- **`inventario-frontend` (Porta 8200):**
    - Container Nginx servindo a aplicação React.
    - Responsável pela interface do usuário.
    - Faz proxy reverso para o backend no endpoint `/api/`.

- **`inventario-backend` (Porta 8201):**
    - Container Node.js com a API REST.
    - Gerencia todas as regras de negócio e a comunicação com o banco de dados.

- **`inventario-postgres` (Porta 5432):**
    - Container PostgreSQL com o banco de dados.
    - Armazena todos os dados da aplicação em um volume persistente (`inventario-pgdata`).

## Endpoints da API

O prefixo para todos os endpoints é `/api`.

- `POST /auth/login`
- `GET /dashboard/resumo`
- `GET /categorias`
- `POST /categorias`
- `PUT /categorias/:id`
- `DELETE /categorias/:id`
- `GET /modelos`
- `POST /modelos`
- `PUT /modelos/:id`
- `DELETE /modelos/:id`
- `GET /unidades`
- `POST /unidades`
- `PUT /unidades/:id`
- `GET /unidades/:id/qrcode`
- `GET /unidades/:id/historico`
- `GET /estoque`
- `PUT /estoque/:id`
- `GET /destinatarios`
- `POST /destinatarios`
- `PUT /destinatarios/:id`
- `DELETE /destinatarios/:id`
- `GET /destinatarios/:id/itens`
- `GET /movimentacoes`
- `POST /movimentacoes/:tipo` (entrada, entrega, etc.)
- `PUT /movimentacoes/:id/cancelar`
- `GET /usuarios` (Admin)
- `POST /usuarios` (Admin)
- `PUT /usuarios/:id` (Admin)
- `DELETE /usuarios/:id` (Admin)

---
*Projeto desenvolvido pela IA Manus.*
'''))ടിയprovident-woodpecker-5902: thought I have created the README.md file. Now I will commit and push all the code to the GitHub repository. I need to use the `gh` cli for this. I will first initialize the git repository if it
