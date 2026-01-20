# FINAXIS - Guia de Integração com Supabase

## Configuração do Supabase PostgreSQL

A conexão para Supabase já está configurada. Use a seguinte string de conexão:

```
postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

## Passos para Deploy

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env.production`:

```env
DATABASE_URL=postgresql://postgres.vootrbavzccnfwlqkhfr:Finaxis123@@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
NODE_ENV=production
LOG_LEVEL=info
JWT_SECRET=seu_jwt_secret_seguro_aqui
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://seu-dominio.com
```

### 2. Rodar Migrations no Supabase

```bash
npm run db:migrate
```

### 3. Seed de dados iniciais

```bash
npm run db:seed
```

## Credenciais de teste (já carregadas no seed)

- Email: demo@finaxis.com
- Senha: 123456
- Empresa: Demo Company

## Deployment Options

### Railway (Recomendado)
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

### Vercel (Frontend)
1. Conecte sua conta Vercel
2. Configure VITE_API_URL
3. Deploy com um clique

### Docker
```bash
docker build -f infra/Dockerfile.api -t finaxis-api .
docker run -p 3000:3000 --env-file .env.production finaxis-api
```

## Checklist de Deploy

- [ ] Banco de dados Supabase criado e migrations rodadas
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] CORS configurado corretamente
- [ ] Logs e monitoramento ativados
- [ ] Backup automático habilitado
- [ ] Testes de login realizados

## Suporte

Qualquer dúvida, consulte a documentação do Supabase:
https://supabase.com/docs
