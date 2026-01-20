# FINAXIS - MVP

> SaaS de Gestão Financeira em Nuvem

Solução completa para que PMEs gerenciem suas finanças com automação, relatórios e simplicidade.

## 🚀 Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + TypeScript + Fastify
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT
- **Deployment:** Docker + Coolify
- **Monitoramento:** Winston + Health Checks

## 📋 MVP Features

- ✅ Autenticação e multi-tenant
- ✅ CRUD de contas, categorias e transações
- ✅ Dashboard com visão geral financeira
- ✅ Importação de dados via CSV
- ✅ Relatórios básicos (fluxo de caixa, despesas por categoria)
- ✅ Convite de usuários
- ✅ Sistema de suporte (tickets)

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- PostgreSQL (opcional, pode usar o contêiner Docker)

### Passo a Passo

1. **Clonar o repositório**
   ```bash
   git clone https://github.com/seu-usuario/finaxis.git
   cd finaxis
   ```

2. **Instalar dependências**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env conforme necessário
   ```

4. **Iniciar os serviços com Docker**
   ```bash
   docker-compose up -d
   ```

5. **Acessar a aplicação**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000
   - API Docs: http://localhost:3000/docs

## ☁️ Deploy no Coolify

1. **Preparar o repositório**
   - Certifique-se de que todas as alterações foram commitadas e enviadas para o repositório remoto

2. **Criar um novo projeto no Coolify**
   - Acesse o painel do Coolify
   - Clique em "Add New" > "Application"
   - Selecione seu repositório
   - Escolha "Dockerfile" como método de build
   - Selecione a branch principal (geralmente main ou master)

3. **Configurar variáveis de ambiente**
   - Adicione as variáveis necessárias do arquivo `.env.example`
   - Configure as variáveis de banco de dados fornecidas pelo Coolify

4. **Configurações avançadas (opcional)**
   - Defina o comando de build: `npm run build`
   - Defina o diretório de saída: `apps/web/dist`
   - Configure o comando de inicialização: `npm start`

5. **Implantar**
   - Clique em "Save & Deploy"
   - Acompanhe os logs para verificar se tudo foi implantado corretamente

6. **Configurar domínios (opcional)**
   - No painel do Coolify, vá até "Settings" > "Domains"
   - Adicione seus domínios personalizados
   - Configure o SSL se necessário

## 🏗️ Estrutura do Projeto

```
finaxis/
├── apps/
│   ├── api/          # Backend Node.js + Fastify
│   └── web/          # Frontend React + Vite
├── packages/
│   ├── shared/       # Tipos e validações compartilhadas
│   └── ui/           # Componentes reutilizáveis
├── infra/            # Docker, scripts e configuração
└── docs/             # Documentação
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git

### Setup Local

```bash
# 1. Clone e instale dependências
git clone <repo>
cd finaxis
npm install

# 2. Configure variáveis de ambiente
cp .env.example .env.local

# 3. Inicie banco de dados
docker-compose up -d

# 4. Rode migrations
npm run db:migrate

# 5. Inicie dev servers
npm run dev
```

Acesse:
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000

## 📚 Documentação

- [Visão do Produto](./docs/PRODUCT_VISION.md)
- [Guia de Arquitetura](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [API Reference](./apps/api/docs/API.md)

## 🚢 Deploy

```bash
# Build
npm run build

# Deploy com Docker
docker-compose -f docker-compose.prod.yml up -d
```

## 📝 Licença

Proprietary - FINAXIS Tecnologia

## 👥 Time

Desenvolvido por: Seu Time
Data: Janeiro 2026
