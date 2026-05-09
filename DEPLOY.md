# Deploy — Plataforma Tiago Alemão VET

## PRÉ-REQUISITOS
- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Netlify](https://netlify.com)
- Conta no [Asaas](https://asaas.com) (sandbox primeiro)
- Conta no [Resend](https://resend.com) (email)

---

## ETAPA 1 — Supabase

### 1. Criar projeto
- supabase.com → New Project
- Nome: `plataforma-tiago-alemao-vet`
- Região: **South America (São Paulo)**
- Salvar senha do banco gerada

### 2. Rodar SQL (em ordem)
SQL Editor → New query → Run:

**Passo A** — Schema base:
```
Cole o conteúdo de: supabase/migrations.sql
```

**Passo B** — Fases 2–6 (monetização, biblioteca, gamificação, comunidade):
```
Cole o conteúdo de: supabase/migrations_v2.sql
```

### 3. Criar usuário admin
- Authentication → Users → Add user
- Email + senha fortes
- Após criado: Table Editor → profiles → editar o registro
  - Mudar `role` de `student` para `owner`

### 4. Configurar Auth
Authentication → Settings:
- **Site URL**: `https://SEU-SITE.netlify.app` (atualizar depois com domínio final)
- **Redirect URLs**: `https://SEU-SITE.netlify.app/**`
- Desativar confirmação de email para testes (Email → Enable email confirmations → OFF)

### 5. Copiar credenciais
Settings → API:
- **Project URL** → salvar
- **anon public key** → salvar
- **service_role key** → salvar (nunca expor no frontend)

---

## ETAPA 2 — Configurar variáveis locais

```bash
cp .env.example .env
```

Editar `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

Testar localmente:
```bash
npm install
npm run dev
# Acessar http://localhost:5174
# Fazer login com o usuário owner criado no Supabase
```

---

## ETAPA 3 — Deploy Netlify

### Opção A — Via interface (mais fácil)
1. netlify.com → Add new site → Import an existing project
2. Conectar ao GitHub (ou arrastar a pasta `dist/`)
3. Build settings (detectados automaticamente pelo `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Site configuration → Environment variables** → adicionar:
   ```
   VITE_SUPABASE_URL      = https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   ```
5. Deploy site

### Opção B — Via CLI
```bash
npm install -g netlify-cli
netlify login
netlify init        # vincular ao site Netlify
netlify deploy --prod
```

### Após o deploy
- Copiar a URL gerada: `https://SEU-SITE.netlify.app`
- Atualizar Supabase Auth → Settings → Site URL com essa URL

---

## ETAPA 4 — Deploy Edge Functions (ASA + Email)

### Instalar CLI Supabase
```bash
npm install -g supabase
supabase login
supabase link --project-ref XXXXXXXXXXXXXXXX
```
(O project-ref está na URL do dashboard: `supabase.com/dashboard/project/XXXXXXXXXXXXXXXX`)

### Configurar secrets
```bash
supabase secrets set ASAAS_API_KEY=$aact_...
supabase secrets set ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
supabase secrets set ASAAS_WEBHOOK_TOKEN=token-secreto-escolhido
supabase secrets set RESEND_API_KEY=re_xxxxxx
supabase secrets set FROM_EMAIL=noreply@tiagoedu.com.br
supabase secrets set PLATFORM_URL=https://app.tiagoedu.com.br
supabase secrets set PLATFORM_NAME="Tiago Alemão VET"
```

### Deploy das funções
```bash
supabase functions deploy create-payment
supabase functions deploy create-subscription
supabase functions deploy asa-webhook
supabase functions deploy reengagement-email
```

### Registrar webhook no Asaas
Asaas → Configurações → Integrações → Webhooks → Adicionar:
```
URL: https://XXXXXXXXXXXXXXXX.supabase.co/functions/v1/asa-webhook
Eventos: PAYMENT_CONFIRMED, PAYMENT_OVERDUE, PAYMENT_REFUNDED,
         SUBSCRIPTION_CANCELLED, SUBSCRIPTION_EXPIRED
Token: (mesmo valor de ASAAS_WEBHOOK_TOKEN)
```

---

## ETAPA 5 — Domínio personalizado

### No Netlify
Site configuration → Domain management → Add custom domain:
```
app.tiagoedu.com.br
```
O Netlify mostra os registros DNS a configurar.

### No registrador (Registro.br / Cloudflare)
```
Tipo:  CNAME
Nome:  app
Valor: SEU-SITE.netlify.app
```
SSL é automático (Let's Encrypt via Netlify). No Cloudflare leva ~5 min.

### Atualizar URLs após domínio ativo
- Supabase Auth → Site URL: `https://app.tiagoedu.com.br`
- `supabase secrets set PLATFORM_URL=https://app.tiagoedu.com.br`
- Redeployar as funções: `supabase functions deploy reengagement-email`

---

## ETAPA 6 — Conteúdo inicial (antes de abrir inscrições)

Fazer login como owner e criar:
1. **Produto** → /admin/produtos → criar com preço
2. **Curso** → /admin/cursos → criar módulos, aulas e publicar
3. **Material** → /admin/biblioteca → subir 1 PDF gratuito
4. **Evento** → /admin/mentorias → criar próxima live

---

## TROCA SANDBOX → PRODUÇÃO

Quando pronto para cobrar de verdade:
```bash
supabase secrets set ASAAS_API_KEY=chave_de_producao
supabase secrets set ASAAS_BASE_URL=https://api.asaas.com/v3
supabase functions deploy create-payment
supabase functions deploy asa-webhook
```
E atualizar o webhook no Asaas de produção com a mesma URL.

---

## CHECKLIST FINAL

**Auth**
- [ ] Cadastro de novo aluno funciona
- [ ] Login com email + senha funciona
- [ ] Recuperação de senha envia email e link abre /nova-senha
- [ ] Logout funciona

**Conteúdo**
- [ ] Aluno vê cursos na loja
- [ ] Player abre, vídeo reproduz, progresso salva
- [ ] Notas salvam e reaparecem ao voltar

**Pagamento**
- [ ] Checkout PIX gera QR code (sandbox)
- [ ] Webhook confirma pagamento → acesso liberado automaticamente

**Mobile**
- [ ] Bottom bar navega corretamente
- [ ] Formulários funcionam no celular

**Admin**
- [ ] Criar/publicar curso funciona
- [ ] Lista de alunos carrega com dados reais
- [ ] Moderação de posts funciona

**Infraestrutura**
- [ ] URL com domínio próprio
- [ ] Cadeado SSL verde
- [ ] Sem erros no console do browser
