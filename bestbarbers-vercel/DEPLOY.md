# BestBarbers Dashboard — Deploy no Vercel

## PASSO 1 — Criar conta no Vercel (grátis)
Acesse: https://vercel.com → "Sign Up" → entre com GitHub ou Google

---

## PASSO 2 — Criar repositório no GitHub
1. Acesse https://github.com → "New repository"
2. Nome: bestbarbers-dashboard
3. Clique "Create repository"
4. Faça upload dos arquivos desta pasta (arraste e solte)

---

## PASSO 3 — Conectar ao Vercel
1. No Vercel, clique "Add New Project"
2. Conecte sua conta do GitHub
3. Selecione o repositório "bestbarbers-dashboard"
4. Clique "Deploy"

---

## PASSO 4 — Ativar o banco de dados (Vercel KV)
1. No painel do Vercel, vá em "Storage"
2. Clique "Create Database" → escolha "KV"
3. Nome: bestbarbers-kv
4. Clique "Create & Connect to Project"
5. Isso cria automaticamente as variáveis de ambiente necessárias

---

## PASSO 5 — Atualizar a extensão Chrome
Após o deploy, você terá uma URL como:
  https://bestbarbers-dashboard.vercel.app

Abra o arquivo: extension-background.js
Troque a linha:
  const SERVER_URL = 'COLE_SUA_URL_VERCEL_AQUI/api/dados';
Por:
  const SERVER_URL = 'https://SEU-PROJETO.vercel.app/api/dados';

Depois atualize também a extensão no Chrome:
  chrome://extensions → botão "Atualizar" (ícone de reload)

---

## PRONTO!
- Dashboard: https://SEU-PROJETO.vercel.app
- A extensão envia os dados direto para a nuvem
- Acesse o dashboard de qualquer dispositivo
