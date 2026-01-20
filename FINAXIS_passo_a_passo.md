# FINAXIS — Passo a passo de implementação (início da produção)

Este guia transforma o plano do projeto FINAXIS em um roteiro prático para começar a construir o **SaaS de gestão financeira em nuvem**, com **automação**, **relatórios** e **suporte** (stack sugerida: **TypeScript + React + PostgreSQL + Cloud + APIs REST**) fileciteturn0file0L86-L102.

---

## 0) Premissas e objetivos do MVP

### Objetivo do MVP (primeira versão vendável)
Entregar um produto que permita a uma pequena/ média empresa:
- **Cadastrar entradas/saídas** (receitas/despesas)
- **Organizar por categorias/centros de custo**
- **Ver fluxo de caixa** e **relatórios básicos**
- **Convidar usuários** do time (perfis simples)
- **Importar dados** (CSV/planilha) para acelerar onboarding
- Receber **suporte** (tickets/e-mail) e ter **backup/segurança mínimos**

### Escopo fora do MVP (fase 2+)
- Integração bancária automática (Open Finance/OFX)
- Nota fiscal / emissão de boletos
- Cobrança automática e conciliação bancária avançada
- IA para previsões e recomendações (depois que houver dados)

---

## 1) Definição do produto (1–2 dias)

### 1.1 Personas e casos de uso
**Público-alvo:** PMEs (comércio, serviços, startups) fileciteturn0file0L49-L61  
Defina 2 personas:
- **Dono(a)/gestor(a)**: quer visão geral e relatórios
- **Financeiro/assistente**: lança contas, organiza e cobra

### 1.2 Jornada do usuário (onboarding)
- Criar conta → criar empresa/organização → convidar usuário → importar dados → lançar movimentações → ver dashboard.

### 1.3 Proposta de valor (para orientar decisões)
Automação + redução de erros + relatórios claros + simplicidade de uso fileciteturn0file0L63-L84.

**Entregável:** README “Visão do Produto” (1 página) + backlog inicial.

---

## 2) Preparação do repositório e padrões (1 dia)

### 2.1 Monorepo recomendado
- `apps/web` (React)
- `apps/api` (Node/TypeScript)
- `packages/shared` (tipos, validações, utilitários)
- `packages/ui` (componentes)
- `infra/` (docker, deploy, scripts)

### 2.2 Ferramentas e padrões
- Node LTS + TypeScript
- ESLint + Prettier
- Conventional Commits + changelog
- Husky + lint-staged (opcional)
- CI (GitHub Actions): lint, test, build, migrations dry-run

**Checklist:**
- [ ] Regras de branch (main/dev/feature/*)
- [ ] Template de PR
- [ ] Issue templates (bug/feature)

---

## 3) Arquitetura mínima (decisões essenciais) (1 dia)

### 3.1 Multi-tenant (SaaS)
Escolha um modelo simples e seguro:
- **Modelo recomendado no início:** uma única base PostgreSQL com coluna `tenant_id` em todas as tabelas “de negócio”.
- Acesso sempre filtrado por `tenant_id` no backend.

### 3.2 Camadas (API)
- Controllers (HTTP) → Services (regras) → Repositories (DB) → Providers (e-mail, storage)
- Validação em entrada/saída (Zod ou similar)

### 3.3 Segurança básica
- JWT + refresh token (ou sessão)  
- Hash de senha (bcrypt/argon2)  
- Rate limit (login e endpoints críticos)  
- Auditoria simples (tabela de eventos)

---

## 4) Banco de dados (PostgreSQL) — modelagem inicial (1–2 dias)

### 4.1 Entidades do MVP (sugestão)
**Identidade / acesso**
- `users`
- `tenants` (empresa/organização)
- `memberships` (user ↔ tenant + role)

**Financeiro**
- `accounts` (caixas/contas)
- `categories` (receita/despesa)
- `transactions` (lançamentos)
- `attachments` (comprovantes: link para storage)

**Suporte / operação**
- `support_tickets` (básico)
- `audit_log` (eventos relevantes)

### 4.2 Regras importantes
- `transactions` sempre vinculada a: `tenant_id`, `account_id`, `category_id`, `created_by`.
- Campos essenciais em `transactions`: `type` (IN/OUT), `amount`, `date`, `description`, `status` (CONFIRMED/PENDING), `tags` (opcional).

### 4.3 Migrations e seed
- Use Prisma/Drizzle/TypeORM (escolha 1).
- Tenha comandos:
  - `db:migrate`
  - `db:seed`
  - `db:reset` (somente dev)

**Entregável:** Diagrama ER simples + migrations iniciais.

---

## 5) Backend (Node + TypeScript) (3–7 dias)

### 5.1 Setup de API
- Framework: Fastify ou NestJS (Fastify costuma ser mais leve).
- Rotas (MVP):
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /tenants`
  - `POST /tenants/:id/invite`
  - `GET /dashboard/summary`
  - CRUD:
    - `/accounts`
    - `/categories`
    - `/transactions`

### 5.2 Regras do domínio (exemplos)
- Não permitir transação sem `tenant_id`.
- Não permitir deletar categoria usada (ou soft delete).
- Auditoria: criar log em ações críticas (criar/editar/apagar transações).

### 5.3 Testes mínimos
- Unit: serviços (regras)
- Integration: rotas principais (auth + transactions)
- Contract: validação de schemas

---

## 6) Frontend (React) (3–10 dias)

### 6.1 Páginas do MVP
- Login / Cadastro
- Seleção/criação de empresa (tenant)
- Dashboard (saldo, entradas/saídas no mês, gráfico simples)
- Transações (lista + filtros + criar/editar)
- Categorias e Contas
- Importação CSV
- Configurações / equipe (convites)

### 6.2 Componentes essenciais
- Tabela com paginação e filtros
- Formulários com validação
- Toasts e estados de loading/empty/error

### 6.3 UX mínima para “simplicidade”
- Botão “Adicionar lançamento” bem visível
- Atalhos: duplicar lançamento / copiar descrição
- Importar CSV com pré-visualização e mapeamento de colunas

---

## 7) Automação de processos (fase MVP+) (2–5 dias)

Como o plano destaca automação financeira fileciteturn0file0L23-L40, implemente inicialmente algo simples:
- Regras automáticas:
  - Classificação por palavra-chave (ex.: “ALUGUEL” → categoria “Aluguel”)
  - Recorrências mensais (ex.: internet, aluguel)
- Rotina (cron):
  - Gerar lembretes de contas a pagar (email/whatsapp *depois*)
  - Gerar relatório semanal

**Implementação técnica:**
- Tabela `rules` (palavras-chave, categoria, conta, tipo)
- Job runner (BullMQ / Agenda / cron do provedor)
- Observabilidade dos jobs (logs + status)

---

## 8) Relatórios e indicadores (1–3 dias)

### 8.1 Relatórios do MVP
- Fluxo de caixa por período
- Despesas por categoria (top 10)
- Evolução mensal (últimos 6 meses)

### 8.2 Exportação
- CSV e PDF (opcional no MVP; CSV já ajuda muito)

---

## 9) Infraestrutura e deploy (2–4 dias)

O plano prevê **servidor em nuvem**, **banco em nuvem** e **backup** fileciteturn0file0L86-L96.

### 9.1 Ambiente
- **Dev:** docker-compose (api + web + postgres)
- **Prod:** 
  - API: container (Railway/Fly.io/Render/AWS)
  - DB: Postgres gerenciado (Supabase/Neon/RDS)
  - Storage: S3 compatível (ou Supabase Storage)

### 9.2 CI/CD
- Build e testes em PR
- Deploy automático para `main`
- Migrações:
  - “migrate up” no pipeline (com cuidado)
  - ou etapa manual “Release” no começo

### 9.3 Backups e retenção
- Backup diário do Postgres (se gerenciado, habilitar)
- Retenção mínima (7–30 dias)
- Teste de restore (mensal)

---

## 10) Suporte e operação (1–2 dias)

Como há **contrato de suporte** no modelo fileciteturn0file0L78-L85:
- Canal: e-mail + formulário no app
- Tabela de tickets + status (OPEN/IN_PROGRESS/DONE)
- SLA simples (ex.: 24–48h úteis)
- Página “Status/Changelog” (opcional)

---

## 11) Cobrança (quando validar o MVP) (2–5 dias)

O negócio prevê ticket mensal/pacotes fileciteturn0file0L74-L77.
Comece simples:
- Plano Free (limitado) e Pro (pagamento mensal)
- Integração com gateway (Stripe/Mercado Pago/Pagar.me) — fase 2

Até lá:
- Gestão manual (planilha + emissão) para primeiros 5–10 clientes.

---

## 12) Plano de execução por sprints (exemplo prático)

### Sprint 0 (Setup) — 2 a 3 dias
- Repo + CI + docker-compose
- Migrations base (users/tenants/memberships)

### Sprint 1 (Core financeiro) — 1 semana
- Auth + multi-tenant
- CRUD contas/categorias/transações
- Dashboard básico

### Sprint 2 (Onboarding e importação) — 1 semana
- Import CSV com mapeamento
- Regras simples (keywords) + recorrência
- Relatórios básicos

### Sprint 3 (Qualidade + deploy + suporte) — 1 semana
- Deploy prod + domínio + SSL
- Logs/monitoramento
- Tickets de suporte
- Hardening: rate limit, auditoria

---

## 13) Definition of Done (DoD) do MVP

- [ ] Usuário cria conta e entra
- [ ] Cria empresa (tenant) e convida membro
- [ ] Cadastra contas e categorias
- [ ] Cria/edita/exclui transações
- [ ] Dashboard e relatório por período funcionando
- [ ] Import CSV funcionando
- [ ] Deploy em produção com backup e logs
- [ ] Suporte básico (ticket/formulário) disponível

---

## 14) Templates úteis (copie e cole)

### 14.1 Estrutura de backlog (exemplo)
- EPIC: Autenticação e Acesso
  - US01: Cadastro
  - US02: Login
  - US03: Esqueci minha senha
- EPIC: Financeiro
  - US10: CRUD de categorias
  - US11: CRUD de contas
  - US12: CRUD de transações
  - US13: Dashboard
- EPIC: Onboarding
  - US20: Import CSV
  - US21: Regras de classificação
- EPIC: Operação
  - US30: Deploy
  - US31: Backups
  - US32: Logs/monitoramento
  - US33: Suporte/tickets

### 14.2 Checklist de segurança mínima
- [ ] HTTPS em produção
- [ ] Hash de senha
- [ ] Rate limit no login
- [ ] Validação de input (schema)
- [ ] Controle de acesso por tenant
- [ ] Logs e auditoria

---

## 15) Próximo passo imediato (agora)

1. Criar repo (monorepo) e docker-compose  
2. Criar migrations base (users/tenants/memberships)  
3. Implementar Auth + tenant middleware  
4. Implementar CRUD de `transactions` + dashboard simples  
5. Colocar no ar (ambiente de staging) e testar com 1 empresa real  

---

**Fonte:** Plano de Negócios Simplificado — FINAXIS Tecnologia e Gestão Financeira Ltda. fileciteturn0file0L1-L107
