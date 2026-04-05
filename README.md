# 🏟️ Central de Ajuda GoSports

> Assistente virtual inteligente para o app GoSports — reservas de quadras, suporte e tutoriais, respondido por IA com base em documentos do Google Drive.

---

## 📁 Estrutura do Projeto

```
gosports-help-center/
├── app/                          # Next.js App Router (raiz)
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # POST /api/chat — backend serverless
│   ├── globals.css
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Página principal
├── components/
│   ├── ChatInput.tsx             # Input + microfone (Web Speech API)
│   ├── ChatWindow.tsx            # Lista de mensagens
│   ├── Header.tsx                # Header com branding GoSports
│   ├── MessageBubble.tsx         # Bolhas de chat com markdown
│   └── SuggestedQuestions.tsx   # Botões de perguntas rápidas
├── lib/
│   ├── claude.ts                 # Integração Claude API
│   └── drive.ts                  # Integração Google Drive API
├── types/
│   └── index.ts                  # TypeScript interfaces
├── public/
│   └── favicon.svg
├── .env.example                  # Template de variáveis
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json                 # paths: "@/*" → "./*"
└── vercel.json
```

---

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API do Claude (console.anthropic.com) |
| `GOOGLE_DRIVE_FOLDER_ID` | ID da pasta no Google Drive |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | JSON da Service Account em 1 linha |

---

## 🚀 Deploy no Vercel

### 1. Push para o GitHub

```bash
git init
git add .
git commit -m "feat: initial GoSports Help Center MVP"
git remote add origin https://github.com/SEU_USUARIO/gosports-help-center.git
git branch -M main
git push -u origin main
```

### 2. Importar no Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório do GitHub
3. Framework detectado automaticamente: **Next.js**

### 3. Variáveis de ambiente no Vercel

Em **Project → Settings → Environment Variables**, adicione:

```
ANTHROPIC_API_KEY         → sk-ant-...
GOOGLE_DRIVE_FOLDER_ID    → 1ABC123XYZ...
GOOGLE_SERVICE_ACCOUNT_JSON → {"type":"service_account",...}
```

### 4. Deploy

Clique em **Deploy** — ou faça um novo `git push` para trigger automático.

---

## 🧪 Desenvolvimento local

```bash
# Instalar dependências
npm install

# Copiar e preencher variáveis
cp .env.example .env.local

# Rodar localmente
npm run dev
# → http://localhost:3000
```

---

## 🔄 Atualizar base de conhecimento

Edite ou adicione **Google Docs** na pasta do Drive compartilhada — **sem redeploy necessário**. Os documentos são lidos em tempo real a cada pergunta.

---

## 📐 Arquitetura

```
Usuário → Vercel (Next.js App Router)
              ├── /app/page.tsx         → Frontend React
              └── /app/api/chat/        → Serverless function
                      ├── lib/drive.ts  → Google Drive API
                      └── lib/claude.ts → Anthropic Claude API
```

---

## 📈 Próximas melhorias

| Prioridade | Melhoria |
|---|---|
| 🔴 Alta | Adicionar mais documentos ao Drive |
| 🟡 Média | Cache para evitar recarregar docs a cada request |
| 🟡 Média | Embeddings + busca semântica (Pinecone / pgvector) |
| 🟢 Baixa | Histórico persistido por sessão |
| 🟢 Baixa | Analytics — perguntas mais frequentes |
| 🟢 Baixa | Avaliação de respostas (👍 / 👎) |
