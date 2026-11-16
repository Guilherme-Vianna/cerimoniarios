# Cerimoniários Católicos

App Cerimoniários Católicos em um só projeto Next.js 16 (React 19, Tailwind v4): login pelo Firebase (Google, e-mail e
senha ou visitante), provas sobre a
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
| `NEXT_PUBLIC_CONTACT_EMAIL` | não | E-mail de contato mostrado na política de privacidade (use o mesmo da Play Store) |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | não | ID da Google Tag (`AW-…` do Google Ads ou `G-…` do Analytics); vazio = sem rastreamento |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` | não | `AW-…` do Google Ads, se for diferente da tag acima |
| `NEXT_PUBLIC_GOOGLE_ADS_SIGN_UP_LABEL` | não | Rótulo da conversão "Cadastro" no Google Ads |
| `NEXT_PUBLIC_GOOGLE_ADS_COMPLETE_QUIZ_LABEL` | não | Rótulo da conversão "Prova concluída" (micro-conversão) |
| `NEXT_PUBLIC_GOOGLE_ADS_DONATE_LABEL` | não | Rótulo da conversão "Doação" (macro-conversão) |
| `NEXT_PUBLIC_PIX_KEY` | não | Chave Pix mostrada depois do resultado da prova; vazio = sem pedido de doação |
| `NEXT_PUBLIC_PIX_RECIPIENT` | não | Nome que aparece no banco ao pagar o Pix |
| `NEXT_PUBLIC_DONATION_URL` | não | Link opcional de doação por cartão (ex.: Buy Me a Coffee) |

As tabelas já existem no Neon de produção; num banco novo, rode `pnpm db:setup` uma vez com o `DATABASE_URL` dele.
As variáveis `NEXT_PUBLIC_*` entram no build: depois de mudar alguma, faça um novo deploy. No Firebase, adicione o
domínio da Vercel em Authentication → Settings → Authorized domains, senão o login com Google é bloqueado.

No Firebase, em Authentication → Sign-in method, ative **Google**, **E-mail/senha** e **Anônimo** (o anônimo é o modo
visitante, que permite fazer a prova sem entrar). Depois de atualizar o código, rode `pnpm db:setup` no banco de produção:
ele adiciona a coluna `users.is_guest`.

## Google Ads

A Google Tag carrega em todas as páginas quando `NEXT_PUBLIC_GOOGLE_TAG_ID` está preenchido. Eventos enviados
(`src/lib/analytics.ts`):

| Evento | Quando | Conversão no Ads |
| --- | --- | --- |
| `complete_quiz` | Entregou uma prova (inclusive visitante) | Micro-conversão: dá volume para o algoritmo aprender |
| `donate_click` | Copiou a chave Pix ou abriu o link de doação | Macro-conversão: a que traz dinheiro |
| `sign_up` | Criou conta (Google pela primeira vez ou e-mail) | Opcional |
| `login`, `guest_start`, `share` | Entrou, começou como visitante, compartilhou a pontuação | Só para análise |

Use `https://cerimoniarios-gilt.vercel.app/prova` como URL final dos anúncios: quem chega sem login entra
automaticamente como visitante (via `/comecar`, mantendo `gclid` e `utm_*`) e já cai na prova.

No Google Ads, crie as conversões em Metas → Conversões → Site → configuração manual com código, copie o rótulo de cada
uma para a variável correspondente e use contagem "Uma" para `complete_quiz` e `sign_up`. A doação por Pix e o botão de
compartilhar só aparecem no site, depois do resultado da prova; no app Android a doação fica escondida (a Google Play
exige o próprio sistema de pagamento lá).

