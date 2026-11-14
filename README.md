# cerimoniarios-ui

Site do app Cerimoniários (Next.js 16, React 19, Tailwind v4): login com Google pelo Firebase, provas, revisão de
flashcards e ranking. Fala com a [cerimoniarios-api](https://github.com/Guilherme-Vianna/cerimoniarios-api) pelo
servidor (o navegador nunca chama a API direto).

## Rodar localmente

```bash
cp .env.example .env.local   # preencha API_BASE_URL e NEXT_PUBLIC_FIREBASE_*
pnpm install
pnpm dev                     # http://localhost:3000
```

## Deploy na Vercel

Importe este repositório na Vercel (framework Next.js, detectado sozinho) e cadastre em Settings → Environment
Variables:

| Variável | Valor |
| --- | --- |
| `API_BASE_URL` | URL do Cloud Run, sem barra no fim (ex.: `https://cerimoniarios-api-xxxx.a.run.app`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` do Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `cerimoniarios-7c2ee.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `cerimoniarios-7c2ee` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` do Firebase |

As variáveis `NEXT_PUBLIC_*` entram no build: depois de mudar alguma, faça um novo deploy. No Firebase, adicione o
domínio da Vercel em Authentication → Settings → Authorized domains, senão o login com Google é bloqueado.
