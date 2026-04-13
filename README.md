# 🗂️ Gerenciador de Tarefas Kanban

## 📖 Sobre o Projeto
O **Gerenciador de Tarefas Kanban** é uma aplicação web inspirada no modelo de organização visual utilizado pelo Jira, baseada na metodologia **Kanban**. O sistema tem como objetivo auxiliar no gerenciamento de tarefas e fluxos de trabalho de forma intuitiva, permitindo que usuários acompanhem o progresso das atividades em um ambiente visual e organizado.

A aplicação foi desenvolvida com arquitetura **full stack**, separando frontend e backend, proporcionando maior escalabilidade e manutenção do sistema.

---

## 🎯 Objetivo
O projeto visa oferecer uma solução prática para:
- Organização de tarefas em fluxo contínuo
- Gerenciamento de atividades por status
- Controle de acesso com autenticação de usuários
- Visualização clara do progresso das demandas

---

## 🏗️ Arquitetura do Sistema

### 🔹 Frontend
Desenvolvido com foco em usabilidade e responsividade, o frontend é responsável pela interface do usuário e interação com o sistema.

**Tecnologias utilizadas:**
- React  
- Vite  
- React Router DOM  
- Axios  
- Tailwind CSS  
- Lucide React  

**Principais funcionalidades:**
- Tela de login e cadastro  
- Navegação entre páginas  
- Dashboard principal  
- Estrutura para visualização do quadro Kanban  

---

### 🔹 Backend
O backend é responsável pela lógica da aplicação, autenticação de usuários e integração com o banco de dados.

**Tecnologias utilizadas:**
- Node.js  
- Express  
- MySQL  
- JWT (JSON Web Token)  
- Bcrypt  
- Dotenv  
- CORS  

**Principais responsabilidades:**
- Autenticação e autorização de usuários  
- Criptografia de senhas  
- Gerenciamento de rotas e requisições  
- Conexão com banco de dados  

---

## 🔐 Autenticação
O sistema implementa autenticação baseada em **JWT**, garantindo segurança no acesso às rotas protegidas. As senhas dos usuários são armazenadas de forma criptografada utilizando **bcrypt**.

---

## 📊 Funcionalidades
- Cadastro de usuários  
- Login seguro  
- Dashboard principal  
- Estrutura para gerenciamento de tarefas  
- Organização baseada em Kanban  
- Comunicação entre frontend e backend via API REST  

---

## 🔄 Fluxo de Uso
1. O usuário realiza cadastro ou login  
2. Acessa o dashboard principal  
3. Interage com a interface do sistema  
4. Gerencia tarefas dentro da lógica Kanban  

---

## 🚀 Diferenciais
- Arquitetura separada (frontend + backend)  
- Interface moderna com Tailwind CSS  
- Autenticação segura com JWT  
- Código organizado e modular  
- Base sólida para expansão futura  

---

## 📈 Possíveis Melhorias Futuras
- Sistema de comentários  
- Notificações em tempo real  
- Controle de permissões por usuário  
- Deploy em ambiente cloud  

---

## 🧪 Como Executar o Projeto

### 🔧 Pré-requisitos
- Node.js instalado
- Gerenciador de pacotes (npm ou yarn)
- Banco de dados MySQL configurado

---

### ▶️ Rodando o Backend
```bash
cd backend
npm install
npm run dev
```

### ▶️ Rodando o Frontend
```bash
cd frontend
npm install
npm run dev
