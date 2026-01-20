# FINAXIS - Guia de Arquitetura

## Overview

FINAXIS é um SaaS de gestão financeira construído com arquitetura monorepo, seguindo padrões modernos de desenvolvimento.

## Arquitetura Geral

```
┌─────────────────────────────────────────────┐
│              Frontend (React)                │
│         http://localhost:5173                │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────┐
│     Backend API (Fastify + TypeScript)      │
│        http://localhost:3000                 │
└──────────────────┬──────────────────────────┘
                   │ SQL
                   ▼
┌─────────────────────────────────────────────┐
│    PostgreSQL (Supabase Cloud)              │
│   aws-1-sa-east-1.pooler.supabase.com       │
└─────────────────────────────────────────────┘
```

## Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Fastify (leve e rápido)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL 16
- **ORM/Query Builder:** postgres (simples, sem abstração excessiva)
- **Autenticação:** JWT
- **Validação:** Zod
- **Logging:** Winston

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite (rápido e moderno)
- **Linguagem:** TypeScript
- **UI Framework:** TailwindCSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Gráficos:** Recharts
- **Roteamento:** React Router v6

### Infraestrutura
- **Database:** Supabase PostgreSQL (gerenciado)
- **Containerização:** Docker & Docker Compose
- **Deploy:** Railway/Vercel/Render

## Estrutura de Pastas

```
finaxis/
├── apps/
│   ├── api/                 # Backend
│   │   ├── src/
│   │   │   ├── index.ts    # Entrypoint
│   │   │   ├── database/   # Migrations, conexão
│   │   │   ├── modules/    # Lógica de negócio
│   │   │   ├── routes/     # Endpoints HTTP
│   │   │   ├── middleware/ # Auth, logging
│   │   │   ├── utils/      # Helpers, validações
│   │   │   └── types/      # Tipos globais
│   │   └── package.json
│   │
│   └── web/                 # Frontend
│       ├── src/
│       │   ├── main.tsx     # Entrypoint
│       │   ├── App.tsx      # Router
│       │   ├── components/  # Componentes React
│       │   ├── pages/       # Páginas (rotas)
│       │   ├── hooks/       # Custom hooks
│       │   ├── lib/         # API client
│       │   ├── store/       # Zustand stores
│       │   └── index.css    # Estilos globais
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       └── package.json
│
├── packages/                # Código compartilhado (futuro)
│   ├── shared/    # Tipos, validações comuns
│   └── ui/        # Componentes reutilizáveis
│
├── infra/                   # Docker, deploy
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
│
├── docs/                    # Documentação
├── package.json             # Workspace raiz
└── tsconfig.json            # Config TypeScript global
```

## Fluxo de Dados

### Autenticação
```
1. User -> Login Form
2. Frontend POST /auth/login
3. Backend valida credenciais
4. Backend gera JWT Token
5. Frontend armazena Token em localStorage
6. Frontend envia Token em Authorization header
7. Backend valida JWT em cada requisição
```

### Multi-tenant
```
1. User pode ter múltiplos Tenants
2. Cada Tenant é uma empresa/organização
3. User seleciona Tenant ao logar
4. Frontend armazena currentTenant
5. Backend filtra dados por tenant_id
6. Garantido isolamento de dados
```

### CRUD de Transações
```
1. User cria transação no formulário
2. Frontend valida com Zod
3. POST /tenants/:tenantId/transactions
4. Backend valida novamente
5. Backend cria transaction
6. Backend atualiza account.balance
7. Backend registra em audit_log
8. Frontend atualiza lista
```

## Padrões de Código

### Modules (Lógica de Negócio)
```typescript
// apps/api/src/modules/transactions.ts
export async function createTransaction(...) {
  // Validação (já feita em route)
  // Lógica de negócio
  // Interação com DB
  // Retorno de dados
}
```

### Routes (Endpoints HTTP)
```typescript
// apps/api/src/routes/transactions.ts
fastify.post('/tenants/:tenantId/transactions', 
  { onRequest: [fastify.authenticate] },
  async (request, reply) => {
    try {
      // Validação de entrada
      // Chamada a módulo
      // Resposta
    } catch (error) {
      handleErrorResponse(error, reply);
    }
  }
);
```

### API Client (Frontend)
```typescript
// apps/web/src/lib/api.ts
export const transactionsAPI = {
  create: (tenantId: string, data: any) =>
    api.post(`/tenants/${tenantId}/transactions`, data),
  list: (tenantId: string, filters?: any) =>
    api.get(`/tenants/${tenantId}/transactions`, { params: filters }),
};
```

### State Management (Frontend)
```typescript
// apps/web/src/store/auth.ts
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
}));
```

## Segurança

✅ **Autenticação:**
- JWT com expiração
- Password hashing com bcrypt
- Refresh tokens (futuro)

✅ **Autorização:**
- Multi-tenant com tenant_id filtering
- Validação em cada rota protegida
- CORS restritivo

✅ **Data Validation:**
- Zod schemas em entrada
- TypeScript types em tempo de compilação
- SQL prepared statements (postgres lib)

✅ **Comunicação:**
- HTTPS em produção
- Helmet headers
- Rate limiting (futuro)

## Deploy

### Local (Docker Compose)
```bash
docker-compose up
# API: http://localhost:3000
# Web: http://localhost:5173
# DB: localhost:5432
```

### Produção (Supabase + Railway)
1. **Database:** Supabase PostgreSQL
2. **API:** Railway Docker container
3. **Frontend:** Vercel
4. **Environment Variables:** .env.production

Detalhes em `docs/SUPABASE_SETUP.md`

## Monitoramento

- **Logs:** Winston (console + files)
- **Errors:** Global error handler
- **Performance:** Database query logs
- **Uptime:** Health check endpoint

## Testing (MVP)

- Unit tests: Validações e lógica isolada
- Integration tests: Endpoints principais
- E2E tests: Fluxos críticos (futuro)

---

**Versão:** 1.0
**Last Updated:** Janeiro 2026
