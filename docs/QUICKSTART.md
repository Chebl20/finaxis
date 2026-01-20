# FINAXIS - Guia de Início Rápido

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Docker e Docker Compose (para local)
- Git

## 🚀 Setup Local (com Docker)

### 1. Clone o repositório
```bash
cd /path/to/finaxis
```

### 2. Configure variáveis de ambiente
```bash
cp .env.example .env.local
```

### 3. Inicie os serviços
```bash
docker-compose up -d
```

Aguarde 30-60 segundos para o PostgreSQL iniciar.

### 4. Rode as migrations
```bash
npm run db:migrate
npm run db:seed
```

### 5. Acesse a aplicação
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000
- **Banco de Dados:** localhost:5432

### Credenciais de Teste
- Email: `demo@finaxis.com`
- Senha: `123456`

---

## 🛠️ Setup Local (sem Docker)

### 1. Instale dependências
```bash
npm install
```

### 2. Configure banco de dados
```bash
# Crie um banco PostgreSQL local
createdb finaxis_dev
```

### 3. Configure variáveis de ambiente
```bash
cat > .env.local << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/finaxis_dev
API_PORT=3000
JWT_SECRET=dev-secret
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
EOF
```

### 4. Rode migrations e seed
```bash
npm run db:migrate
npm run db:seed
```

### 5. Inicie os servidores
```bash
# Em um terminal:
npm run dev:api

# Em outro terminal:
npm run dev:web
```

---

## 📱 Fluxo de Usuário (MVP)

### 1. **Login**
- Acesse http://localhost:5173/login
- Use credenciais de demo
- Ou crie uma nova conta

### 2. **Selecionar Empresa**
- Escolha uma empresa existente
- Ou crie uma nova

### 3. **Dashboard**
- Veja saldo total
- Entradas/Saídas do mês
- Últimas transações
- Top categorias

### 4. **Criar Transação**
- Clique em "Nova Transação"
- Preencha formulário
- Selecione conta, categoria, valor
- Salvar

### 5. **Visualizar Relatórios**
- Acesse "Transações" para lista completa
- Filtrar por conta, período
- (Relatórios visuais em desenvolvimento)

---

## 🗂️ Estrutura de Arquivos Principal

```
finaxis/
├── apps/api/        # Backend Node.js
├── apps/web/        # Frontend React
├── docs/            # Documentação
├── infra/           # Docker & deploy
└── package.json     # Workspace
```

---

## 🔑 Variáveis de Ambiente Importantes

### Backend (.env)
```
DATABASE_URL          # String de conexão PostgreSQL
API_PORT              # Porta da API (padrão: 3000)
NODE_ENV              # development/production
JWT_SECRET            # Chave para assinar tokens
JWT_EXPIRES_IN        # Tempo de expiração (padrão: 24h)
CORS_ORIGIN           # URL do frontend
```

### Frontend (.env)
```
VITE_API_URL          # URL da API backend
```

---

## 📊 Próximas Funcionalidades

- ✅ Autenticação e multi-tenant
- ✅ CRUD de transações
- ✅ Dashboard básico
- ⏳ Importação de CSV
- ⏳ Relatórios avançados
- ⏳ Integração bancária
- ⏳ Mobile app

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"
```bash
# Verifique se PostgreSQL está rodando
docker-compose ps

# Reinicie containers
docker-compose restart postgres
```

### Erro: "Port 3000 already in use"
```bash
# Altere a porta no .env
API_PORT=3001

# Ou libere a porta
lsof -i :3000
kill -9 <PID>
```

### Erro: "CORS error"
```bash
# Verifique CORS_ORIGIN no .env
# Deve ser a URL do frontend
CORS_ORIGIN=http://localhost:5173
```

---

## 📚 Documentação

- [Visão do Produto](./PRODUCT_VISION.md)
- [Arquitetura](./ARCHITECTURE.md)
- [Supabase Setup](./SUPABASE_SETUP.md)
- [Database Schema](./DATABASE.md)

---

## 🚢 Deploy para Produção

Veja `docs/SUPABASE_SETUP.md` para instruções de deploy em produção com Supabase e Railway.

---

**Precisa de ajuda?**
Abra uma issue ou entre em contato: suporte@finaxis.app
