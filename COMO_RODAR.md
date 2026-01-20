# 🚀 FINAXIS MVP - Como Rodar Localmente

## Sistema Pronto para Usar com Supabase

O projeto já está completamente integrado com o banco de dados PostgreSQL da Supabase fornecido.

### Credenciais de Conexão Supabase:
```
postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## 📋 Pré-requisitos

- **Node.js** 18+ (download: https://nodejs.org)
- **Git** (já deve estar instalado)
- ✅ Banco de dados Supabase já configurado

---

## ⚡ Quick Start (5 minutos)

### 1️⃣ Instale as dependências
```bash
cd /home/chebl/Documents/Projetos/finaxis
npm install
```

**Tempo estimado:** 2-3 minutos

### 2️⃣ Configure variáveis de ambiente
```bash
# A arquivo .env.production já existe com as credenciais do Supabase
# Para desenvolvimento local, copie a configuração:

cat > .env.local << EOF
DATABASE_URL=postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
API_PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-key-finaxis-2024
CORS_ORIGIN=http://localhost:5173
VITE_API_URL=http://localhost:3000
EOF
```

### 3️⃣ Rode as migrations e seed
```bash
npm run db:migrate
npm run db:seed
```

**O quê faz:**
- Cria todas as tabelas no Supabase
- Insere dados de teste (usuário demo, categorias, contas)

### 4️⃣ Inicie os servidores
Em um terminal:
```bash
npm run dev:api
```

Em outro terminal:
```bash
npm run dev:web
```

### 5️⃣ Acesse a aplicação
- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000

---

## 🔐 Credenciais de Teste (já carregadas)

```
Email: demo@finaxis.com
Senha: 123456
```

Após logar:
1. Selecione "Demo Company" 
2. Ou crie uma nova empresa

---

## 📱 O Que Você Pode Fazer

✅ Login/Cadastro
✅ Criar múltiplas empresas (multi-tenant)
✅ Visualizar dashboard com saldo total
✅ Criar, editar e listar transações
✅ Gerenciar contas bancárias
✅ Gerenciar categorias de despesas/receitas
✅ Visualizar relatórios com gráficos
✅ Sistema de suporte (tickets)
✅ Convidar usuários (via email)

---

## 🗄️ Estrutura do Banco de Dados

O Supabase agora tem as seguintes tabelas:

- **users** - Usuários do sistema
- **tenants** - Empresas/organizações
- **memberships** - Relação user ↔ tenant
- **accounts** - Contas bancárias/caixas
- **categories** - Categorias de transações
- **transactions** - Lançamentos financeiros
- **rules** - Regras de automação (futuro)
- **support_tickets** - Tickets de suporte
- **audit_logs** - Log de operações

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia API + Frontend simultaneamente
npm run dev:api         # Apenas Backend
npm run dev:web         # Apenas Frontend

# Build para produção
npm run build

# Banco de dados
npm run db:migrate      # Cria tabelas no Supabase
npm run db:seed         # Insere dados de teste
npm run db:reset        # Apaga tudo e recria (CUIDADO!)

# Linting
npm run lint            # Verifica código
npm run format          # Formata código
```

---

## 🌐 Deploy em Produção

Quando quiser colocar no ar:

### 1. Railway (Recomendado para API)
```bash
# Após conectar seu GitHub
# Coloque as variáveis de ambiente em Production
DATABASE_URL=postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
JWT_SECRET=seu_jwt_seguro
NODE_ENV=production
```

### 2. Vercel (Para Frontend)
```bash
# Direto no Vercel conectado ao GitHub
VITE_API_URL=https://seu-api.onrailway.app
```

Detalhes em `docs/SUPABASE_SETUP.md`

---

## 🐛 Troubleshooting

### ❌ Erro: "Cannot connect to database"
```bash
# Verifique a string de conexão no .env.local
# Deve ser exatamente:
postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

### ❌ Porta 3000 já está em uso
```bash
# Altere em .env.local
API_PORT=3001

# Ou libere a porta
lsof -i :3000
kill -9 <PID>
```

### ❌ CORS Error
```bash
# Verifique se CORS_ORIGIN está correto
CORS_ORIGIN=http://localhost:5173
```

### ❌ npm run dev não funciona
```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Próximas Funcionalidades Planejadas

- ⏳ Importação de CSV com preview
- ⏳ Integração com bancos (Open Finance)
- ⏳ App mobile (React Native)
- ⏳ Automações com webhook
- ⏳ Integração com contadores

---

## 📚 Documentação Completa

- [Visão do Produto](./docs/PRODUCT_VISION.md) - O que é FINAXIS
- [Arquitetura](./docs/ARCHITECTURE.md) - Como funciona
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - Deploy em produção
- [Apresentação MVP](./docs/PRESENTATION.md) - Slides para demo

---

## 💬 Suporte

Se tiver dúvidas ou problemas:
1. Verifique a documentação em `docs/`
2. Consulte o Supabase: https://supabase.com/docs
3. Abra uma issue no GitHub

---

## ✨ Resumo Técnico

| Aspecto | Tecnologia |
|---------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Node.js + Fastify + TypeScript |
| Banco | PostgreSQL (Supabase) |
| Auth | JWT |
| Deploy | Docker + Railway/Vercel |
| Monitoramento | Winston Logs |

**Status:** MVP Completo e Testado ✅

---

**Desenvolvido em:** Janeiro 2026
**Versão:** 1.0.0
**Última atualização:** 19 de janeiro de 2026
