# 🏟️ Central de Ajuda GoSports

> Assistente virtual inteligente para o app GoSports — reservas de quadras, suporte e tutoriais, respondido por IA com base em documentos do Google Drive.

---

## 📐 Arquitetura Cloud

```
Usuário → Vercel (Next.js) → API Route → Google Drive (docs)
                                       → Claude API (resposta)
```

- **Frontend + Backend**: Next.js 14 App Router no Vercel
- **Knowledge Base**: Google Drive (pasta compartilhada com Service Account)
- **IA**: Anthropic Claude Sonnet
- **Deploy**: GitHub → Vercel (CI/CD automático)
- **Variáveis**: Painel do Vercel (zero segredos no repositório)

---

## 📁 Estrutura do Projeto

```
gosports-help-center/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts        # POST /api/chat
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx                # Página principal
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ChatInput.tsx           # Input + microfone
│   │   ├── ChatWindow.tsx          # Lista de mensagens
│   │   ├── MessageBubble.tsx       # Bolhas de chat
│   │   └── SuggestedQuestions.tsx  # Botões rápidos
│   ├── lib/
│   │   ├── claude.ts               # Claude API
│   │   └── drive.ts                # Google Drive API
│   └── types/
│       └── index.ts
├── .env.example
├── .gitignore
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `ANTHROPIC_API_KEY` | Chave da API do Claude |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta no Google Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da conta de serviço (minificado, 1 linha) |

---

## 🔑 1. Configurar Anthropic API

1. Acesse [console.anthropic.com](https://console.anthropic.com)
2. Vá em **Settings → API Keys**
3. Clique em **Create Key**
4. Copie a chave (começa com `sk-ant-...`)
5. Guarde — você vai colar no Vercel

---

## ☁️ 2. Configurar Google Drive

### 2.1 — Criar projeto no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **New Project** → dê um nome (ex: `gosports-help`)
3. Selecione o projeto criado

### 2.2 — Ativar a API do Drive

1. Vá em **APIs & Services → Library**
2. Procure **"Google Drive API"**
3. Clique em **Enable**

### 2.3 — Criar Service Account

1. Vá em **IAM & Admin → Service Accounts**
2. Clique em **Create Service Account**
   - Nome: `gosports-drive-reader`
   - Role: **Viewer** (ou nenhuma — permissão vem da pasta)
3. Após criar, clique no service account → **Keys → Add Key → JSON**
4. O arquivo JSON será baixado automaticamente

### 2.4 — Minificar o JSON para 1 linha

No terminal:
```bash
cat seu-arquivo.json | tr -d '\n' | tr -d ' '
```

Ou online: [jsonminifier.org](https://jsonminifier.org) — cole o JSON e minifique.

O resultado será algo como:
```
{"type":"service_account","project_id":"gosports-help","private_key_id":"abc123",...}
```

### 2.5 — Criar pasta no Google Drive

1. Abra [drive.google.com](https://drive.google.com)
2. Crie uma nova pasta: **"GoSports Tutoriais"**
3. Clique com botão direito → **Compartilhar**
4. Adicione o email da Service Account (ex: `gosports-drive-reader@gosports-help.iam.gserviceaccount.com`) com permissão de **Leitor**
5. Copie o **ID da pasta** da URL:
   ```
   drive.google.com/drive/folders/1ABC123XYZ...
                                    ^^^^^^^^^^^^^^ este é o ID
   ```

### 2.6 — Adicionar documentos

Dentro da pasta, crie **Google Docs** com tutoriais. Exemplo:

**"Como baixar o app GoSports"**
```
Para baixar o app GoSports:
1. Abra a App Store (iPhone) ou Google Play (Android)
2. Pesquise por "GoSports"
3. Toque em Instalar
4. Aguarde o download completar
...
```

Crie um arquivo por tema para melhor organização.

---

## 🐙 3. Setup GitHub

```bash
# Clone ou inicialize o repositório
git init
git add .
git commit -m "feat: initial GoSports Help Center MVP"

# Crie repositório no GitHub (github.com/new)
git remote add origin https://github.com/SEU_USUARIO/gosports-help-center.git
git branch -M main
git push -u origin main
```

---

## 🚀 4. Deploy no Vercel

### 4.1 — Conectar repositório

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório do GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Clique em **Deploy** uma vez para criar o projeto

### 4.2 — Configurar variáveis de ambiente

Vá em **Project → Settings → Environment Variables** e adicione:

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `GOOGLE_DRIVE_FOLDER_ID` | `1ABC123XYZ...` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` (JSON 1 linha) |

⚠️ **Importante**: Selecione os ambientes **Production**, **Preview** e **Development**.

### 4.3 — Novo deploy

Após salvar as variáveis, vá em **Deployments → Redeploy** (ou faça um novo push).

---

## 🔄 5. Atualizações futuras

```bash
# Edite os arquivos localmente
# Depois:
git add .
git commit -m "feat: nova funcionalidade"
git push
# → Vercel faz deploy automático em ~30 segundos
```

Para atualizar a base de conhecimento: **apenas adicione/edite documentos na pasta do Google Drive** — sem redeploy necessário.

---

## 🧪 6. Teste local (opcional)

```bash
# Clone o projeto
git clone https://github.com/SEU_USUARIO/gosports-help-center
cd gosports-help-center

# Instale dependências
npm install

# Copie e preencha o .env.local
cp .env.example .env.local
# Edite o .env.local com suas chaves

# Rode localmente
npm run dev
# Acesse: http://localhost:3000
```

---

## 📈 Próximas Melhorias

| Prioridade | Melhoria |
|-----------|----------|
| 🔴 Alta | Adicionar mais documentos ao Drive |
| 🟡 Média | Cache Redis para evitar recarregar docs no Drive a cada request |
| 🟡 Média | Embeddings + busca semântica (Pinecone ou pgvector) |
| 🟢 Baixa | Histórico de conversas persistido |
| 🟢 Baixa | Analytics (perguntas mais feitas) |
| 🟢 Baixa | Avaliação de respostas (👍/👎) |
| 🔵 Extra | Suporte a PDFs no Drive |
| 🔵 Extra | Autenticação para área admin |

---

## 🆘 Suporte

- Email: suporte@gosports.com.br
- Documentação Vercel: [vercel.com/docs](https://vercel.com/docs)
- Documentação Anthropic: [docs.anthropic.com](https://docs.anthropic.com)
- Google Drive API: [developers.google.com/drive](https://developers.google.com/drive)
