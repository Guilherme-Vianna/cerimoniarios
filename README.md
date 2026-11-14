# Cerimoniários

App Cerimoniários em um só projeto Next.js 16 (React 19, Tailwind v4): login com Google pelo Firebase, provas sobre a
liturgia da Missa geradas pelo Gemini (com um banco de 79 perguntas revisadas como reserva), flashcards com repetição
espaçada, XP e ranking. O "backend" roda no próprio Next (server actions e `src/server/`), falando direto com o
PostgreSQL (Neon). Não há API separada.

```
src/app/        páginas (App Router) e /api/session (cookie com o token do Firebase)
src/server/     regras de negócio: banco, prova, flashcards, ranking, Gemini, banco de perguntas
src/lib/        actions (server actions), loaders de página, auth, tipos
db/schema.sql   tabelas (idempotente)
```

## Rodar localmente

```bash
cp .env.example .env.local   # preencha DATABASE_URL, NEXT_PUBLIC_FIREBASE_* e, se quiser, GEMINI_API_KEY
pnpm install
pnpm db:setup                # cria as tabelas se ainda não existirem
pnpm dev                     # http://localhost:3000
```

```bash
pnpm test && pnpm lint && pnpm build
```

Ou com Docker, na pasta acima: `docker compose up --build`.

## Deploy na Vercel

Importe este repositório na Vercel (framework Next.js) e cadastre em Settings → Environment Variables:

| Variável | Obrigatória | Valor |
| --- | --- | --- |
| `DATABASE_URL` | sim | String do Neon como ele entrega (`postgresql://…?sslmode=require&channel_binding=require`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | sim | `apiKey` do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | sim | `cerimoniarios-7c2ee.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | sim | `cerimoniarios-7c2ee` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | sim | `appId` do Firebase |
| `GEMINI_API_KEY` | não | Chave do Google AI Studio; sem ela a prova usa só o banco de perguntas |
| `GEMINI_MODEL` | não | Padrão `gemini-3.8-flash` |
| `GEMINI_TIMEOUT_SECONDS` | não | Padrão `45` (a página da prova tem `maxDuration = 60`) |
| `LEADERBOARD_TIMEZONE` | não | Padrão `America/Sao_Paulo` |

As tabelas já existem no Neon de produção; num banco novo, rode `pnpm db:setup` uma vez com o `DATABASE_URL` dele.
As variáveis `NEXT_PUBLIC_*` entram no build: depois de mudar alguma, faça um novo deploy. No Firebase, adicione o
domínio da Vercel em Authentication → Settings → Authorized domains, senão o login com Google é bloqueado.
