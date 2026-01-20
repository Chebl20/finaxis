# 🎤 FINAXIS - GUIA DE APRESENTAÇÃO MVP

## Antes da Apresentação (15 minutos antes)

### 1. Teste Local
```bash
cd /home/chebl/Documents/Projetos/finaxis
npm run dev:api      # Terminal 1
npm run dev:web      # Terminal 2
```

### 2. Aguarde
- API pronta: "🚀 Server running at http://0.0.0.0:3000"
- Frontend pronto: "VITE v4..."

### 3. Acesse
- Frontend: http://localhost:5173
- API: http://localhost:3000

---

## 🎬 Roteiro de Apresentação (15 minutos)

### 📌 Slide 1: Abertura (30s)
```
FINAXIS - Gestão Financeira Inteligente para PMEs
```

**Fale:** "Bom dia/tarde. Vou apresentar o FINAXIS, um SaaS de gestão financeira que simplifica como PMEs gerenciam suas finanças."

---

### 📌 Slide 2: O Problema (2 min)

**Mostre a tela com dados do mercado:**
- 73% das PMEs usam planilhas
- Falta de visibilidade
- Erros manuais
- Sem análise de dados

**Fale:** "PMEs enfrentam desafios reais com planilhas desorganizadas, falta de visibilidade e dificuldade para analisar despesas."

---

### 📌 Slide 3: A Solução (1 min)

**Mostre os 5 pilares:**
1. Simplicidade
2. Automação
3. Visibilidade
4. Colaboração
5. Segurança

**Fale:** "FINAXIS resolve isso com uma plataforma intuitiva, segura e na nuvem."

---

### 📌 Demo ao Vivo (10 minutos) ⭐ IMPORTANTE

#### Passo 1: Login (1 min)
```
URL: http://localhost:5173/login
Email: demo@finaxis.com
Senha: 123456
```

**Fale:** "Primeiro, fazemos login com uma conta de teste..."

**🎯 Mostrar:**
- Campo de email
- Campo de senha
- Link para se cadastrar
- Após login: "Bem-vindo, Demo User!"

#### Passo 2: Seleção de Empresa (1 min)
```
Página: Tenant Select
```

**Fale:** "FINAXIS é multi-tenant, então um usuário pode gerenciar múltiplas empresas..."

**🎯 Mostrar:**
- Card "Demo Company"
- Papel do usuário (owner)
- Opção de criar nova empresa
- Clique em "Demo Company"

#### Passo 3: Dashboard (2 min)
```
Página: Dashboard
```

**Fale:** "Aqui temos um dashboard com visão geral em tempo real..."

**🎯 Mostrar:**
- Saldo Total: R$ ...
- Entradas (Mês): R$ ...
- Saídas (Mês): R$ ...
- Resultado: R$ ...
- Lista de contas
- Gráfico de top categorias
- Últimas transações

**Diga:** "Todos esses números são atualizados em tempo real conforme transações são criadas."

#### Passo 4: Criar Transação (2 min)
```
Página: Transações
Clique: Botão "Nova Transação"
```

**Fale:** "Vou criar uma transação para mostrar como é simples..."

**🎯 Preencha:**
- Conta: "Caixa"
- Tipo: "Despesa"
- Categoria: "Alimentação"
- Valor: "250.00"
- Descrição: "Almoço com cliente"
- Data: "Hoje"

**Clique:** "Salvar Transação"

**Resultado:** A transação aparece na lista e o saldo é atualizado!

**Fale:** "Veja como em segundos a transação foi criada, categorizada e o saldo atualizado."

#### Passo 5: Transações (1 min)
```
Página: Transações
```

**Fale:** "Aqui temos uma lista completa de todas as transações..."

**🎯 Mostrar:**
- Tabela com data, descrição, categoria, conta, valor
- A transação que acabamos de criar
- Cores diferenciadas (verde receita, vermelho despesa)

#### Passo 6: Relatórios (2 min)
```
Página: Relatórios
```

**Fale:** "Os relatórios mostram a saúde financeira com gráficos intuitivos..."

**🎯 Mostrar:**
- KPIs no topo
- Bar Chart: Fluxo mensal (receitas vs despesas)
- Pie Chart: Distribuição por categoria
- Tabela detalhada por categoria

**Diga:** "Esses gráficos ajudam a identificar padrões de gastos e oportunidades de economia."

#### Passo 7: Configurações (1 min)
```
Página: Configurações
Clique: Tab "Suporte"
```

**Fale:** "E temos um sistema integrado de suporte para ajudar os usuários..."

**🎯 Mostrar:**
- Formulário para criar ticket
- Lista de tickets
- Status dos tickets

---

### 📌 Slide 4: Arquitetura (2 min) - SEM CÓDIGO

**Mostrar diagrama:**
```
React Frontend (Vite) → REST API (Fastify) → PostgreSQL (Supabase)
```

**Fale:** "Tecnicamente, temos uma arquitetura moderna com:"
- Frontend em React com Vite (muito rápido)
- Backend em Fastify (leve e performático)
- PostgreSQL gerenciado pelo Supabase

**Não mostre código** - apenas explicar conceitos.

---

### 📌 Slide 5: Modelo de Negócio (1 min)

**Mostrar tabela:**
```
Plano         Preço      Recursos
Free          Grátis     1 empresa, 100 tx/mês
Starter       R$ 49/mês  5 empresas
Pro           R$ 149/mês Ilimitado
```

**Fale:** "O modelo é SaaS subscription-based com diferentes planos."

---

### 📌 Slide 6: Roadmap (1 min)

**Mostrar:**
- ✅ MVP (Janeiro 2026) - Concluído
- 🔄 Fase 2 (Março) - Integração bancária
- 🔄 Fase 3 (Junho) - API pública

**Fale:** "O MVP está completo. Os próximos passos incluem integrações mais avançadas."

---

### 📌 Slide 7: Diferenciais (1 min)

**Mostrar comparativo:**
- FINAXIS: Simples, Barato, Automático
- Competitors: Complexo, Caro, Manual

---

### 📌 Slide 8: Chamada para Ação (1 min)

**Diga:**
- "Teste grátis em finaxis.app"
- "Sua opinião é importante"
- "Vamos conversar sobre parcerias/investimento"

---

### 📌 Q&A (5 minutos)

**Perguntas possíveis e respostas:**

**P: Como vocês garantem a segurança dos dados?**
R: Usamos JWT para autenticação, banco em nuvem com backup automático, e isolamento de dados por tenant.

**P: Suporta integração bancária?**
R: Não no MVP, mas é prioridade para Março 2026.

**P: Qual é o plano de preços?**
R: Free grátis (limitado), Starter R$49 e Pro R$149/mês.

**P: Como é o suporte?**
R: Sistema de tickets integrado com resposta em 24-48h.

**P: Vocês têm clientes já?**
R: MVP foi lançado agora em janeiro. Estamos buscando early adopters.

---

## 📊 Materiais Necessários

✅ Notebook com WiFi
✅ Projetor/Monitor
✅ Mouse (opcional)
✅ Cabo HDMI
✅ Backup em vídeo (se conexão falhar)

---

## 🚨 Se Algo der Errado

### Erro de Conexão no Demo
```
Tenha um vídeo gravado:
/videos/finaxis-demo.mp4 (2-3 minutos)
```

### Port 3000 ou 5173 Já em Uso
```bash
API_PORT=3001 npm run dev:api
# ou
lsof -i :3000 | kill -9
```

### Banco de Dados Não Conecta
```bash
# Verifique a conexão:
psql postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

---

## ⏱️ Timeline da Apresentação

| Tempo | Atividade |
|-------|-----------|
| 0-0:30 | Abertura |
| 0:30-2:30 | Problema |
| 2:30-4:00 | Solução |
| 4:00-14:00 | **Demo ao Vivo** ⭐ |
| 14:00-16:00 | Arquitetura |
| 16:00-17:00 | Negócio |
| 17:00-18:00 | Roadmap |
| 18:00-19:00 | Diferenciais |
| 19:00-20:00 | CTA |
| 20:00-25:00 | Q&A |

**Total: 25 minutos (flexível)**

---

## 💡 Dicas Importantes

✅ **Praticar a demo** - Rode várias vezes antes
✅ **Falar devagar** - Deixe claro e entendem
✅ **Focar em benefícios** - Não em features técnicas
✅ **Fazer pausas** - Deixe espaço para perguntas
✅ **Ter contato** - Deixe email e WhatsApp
✅ **Ser honesto** - Sobre limitações do MVP
✅ **Mostrar paixão** - Pelo produto e problema

---

## 📱 Contatos para Deixar

**Email:** contato@finaxis.app
**WhatsApp:** [seu número]
**LinkedIn:** [seu perfil]
**GitHub:** [seu repo]

---

## 🎯 KPIs da Apresentação

Sucesso significa:
- ✅ Apresentou sem erros técnicos
- ✅ Apresentação entre 20-25 minutos
- ✅ Respondeu perguntas com segurança
- ✅ Coletou emails para follow-up
- ✅ Gerou interesse em demanda

---

## ✨ Última Checklist Antes de Apresentar

- [ ] Node.js e npm funcionando
- [ ] npm install completado
- [ ] npm run dev:api rodando (sem erros)
- [ ] npm run dev:web rodando (sem erros)
- [ ] Frontend acessível em http://localhost:5173
- [ ] API respondendo em http://localhost:3000
- [ ] Login funcionando com demo@finaxis.com
- [ ] Dashboard carregando sem erros
- [ ] Gráficos renderizando
- [ ] Vídeo backup no notebook
- [ ] Slides prontos no PowerPoint
- [ ] Contatos preparados
- [ ] 5 minutos de respiro antes

---

## 🎉 Você Está Pronto!

Apresente com confiança. O FINAXIS MVP está completo, testado e pronto para impressionar.

**Boa sorte e boa apresentação!** 🚀

---

**Data:** 19 de janeiro de 2026
**Versão:** 1.0.0 MVP
