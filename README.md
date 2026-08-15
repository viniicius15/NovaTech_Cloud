# NovaTech Cloud

Sistema web desenvolvido para gerenciamento de produtos e operações de uma empresa, utilizando uma arquitetura separada entre **Frontend** e **Backend**.

## 🚀 Tecnologias

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT
* Docker

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

## 📁 Estrutura do projeto

```text
NovaTech_Cloud/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── generated/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── docker-compose.yml
├── LICENSE
└── README.md
```

## 🗄️ Banco de dados

O projeto utiliza **PostgreSQL** como banco de dados e **Prisma ORM** para gerenciamento e acesso aos dados.

As principais entidades do sistema incluem produtos e seus respectivos dados de estoque e gerenciamento.

## 🐳 Docker

O projeto utiliza Docker para facilitar a configuração e execução dos serviços.

Para iniciar os containers:

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d --build
```

Para verificar os containers:

```bash
docker compose ps
```

Para parar os containers:

```bash
docker compose down
```

> Não envie arquivos `.env` ou outras informações sensíveis para o GitHub.

## ▶️ Execução

### Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Execute em desenvolvimento:

```bash
npm run dev
```

### Frontend

Entre na pasta:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

## 🔐 Segurança

O projeto utiliza autenticação baseada em JWT e variáveis de ambiente para informações sensíveis.

Em ambiente de produção, recomenda-se utilizar chaves secretas fortes e configurar corretamente as permissões e credenciais.

## ☁️ Objetivo

O **NovaTech Cloud** foi desenvolvido como um projeto de aplicação web utilizando conceitos de:

* Desenvolvimento Full Stack
* APIs REST
* Banco de dados relacional
* Docker
* Containerização
* Arquitetura Frontend/Backend
* Autenticação
* Deploy em ambiente cloud

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.

Consulte o arquivo [`LICENSE`](LICENSE) para obter os termos completos da licença.

---

**NovaTech Cloud — Sistema de gerenciamento web**