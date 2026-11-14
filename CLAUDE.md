# CLAUDE.md

## Rules for the AI

- Keep this file accurate: update it in the same change that alters structure, stack, commands, conventions or rules. Max 100 lines.
- Code, identifiers, commits and docs in English; user-facing copy in Brazilian Portuguese (pt-BR).
- No code comments unless the reason is not obvious from the code.
- Every new environment variable goes into `.env.example` and the Vercel table in `README.md`.
- Next.js 16 differs from older versions (`proxy.ts` instead of middleware, async `params`/`cookies()`, `refresh()` from
  `next/cache` in server actions): read `node_modules/next/dist/docs/` before using an unfamiliar API.
- pnpm only. Before finishing: `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit` (and `pnpm build` for routing/config changes).

## Project

Cerimoniários: study app for Catholic altar servers. A quiz about the liturgy of the Mass (Gemini, with a reviewed
question bank as fallback) → every wrong answer becomes a spaced-repetition flashcard (Anki-like) → correct answers and
reviews give XP for a weekly and all-time leaderboard. One Next.js app deployed on Vercel; no separate backend.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (tokens and animations in `src/app/globals.css` `@theme`)
- PostgreSQL on Neon via `postgres` (postgres.js, `prepare: false`), plain SQL, no ORM
- Firebase Auth (Google sign-in only) on the client; `jose` verifies ID tokens on the server
- `@google/genai` for question generation; Vitest for unit tests; PWA (`manifest.ts`, `public/sw.js`)

## Layout

```
src/app/            routes; (app)/ = signed-in area: prova, prova/[id], flashcards, revisar, ranking, ajuda
                    (inicio redirects to /prova); each has a loading.tsx skeleton; template.tsx = page transition
src/app/api/session cookie endpoints (POST/DELETE) and /expired (clears cookie, relative redirect to login)
src/server/         business logic, server-only: db, account, quizzes, flashcards, leaderboard, gemini,
                    generation (sanitize/shuffle), question-bank(+ -data), srs, time, catalog, errors, current-user
src/lib/            actions.ts (server actions), api/data.ts (page loaders), api/types.ts (shared shapes), auth/, pwa
src/components/     app/ (header, nav, account menu, skeletons), quiz/, review/, cards/, pwa/, ui/ (primitives)
db/schema.sql       idempotent schema; `pnpm db:setup` applies it
tests/              Vitest unit tests for pure server modules
```

## Data flow and auth

1. Client signs in with Firebase (`signInWithPopup`), POSTs the ID token to `/api/session` → httpOnly `session` cookie.
2. `SessionRefresher` posts refreshed tokens; `proxy.ts` only redirects by cookie presence (`PROTECTED_PATHS`).
3. Pages read through `lib/api/data.ts`, mutations go through `lib/actions.ts`; both resolve the user with
   `server/current-user.ts` (verify token + upsert `users` row, React `cache()`).
4. Services throw `ServiceError(status)`; loaders redirect 401 to `/api/session/expired`; actions return
   `{ ok, data | error }` with pt-BR messages. Never call the database from client components.
5. `src/server/*` imports `server-only`. Time comparisons use the database clock (`now()`), not the server clock.

## Domain rules

- Topics are fixed in `server/catalog.ts` (7 keys); `topic = null` means all topics, weighted toward weak ones
  (accuracy < 70% with ≥ 3 answers). No difficulty levels: every quiz mixes basic, intermediate and advanced.
- Quiz: 5–20 questions, 4 options, options shuffled server-side; answers/explanations hidden until submitted.
  Gemini output goes through `sanitize()`; missing questions are filled from the bank (fresh first, then repeats).
  `GEMINI_API_KEY` empty = bank only. The quiz page sets `maxDuration = 60`.
- Question bank (`question-bank-data.ts`): every entry cites its source when one exists ("IGMR 274",
  "Normas Universais do Ano Litúrgico 22"); `referenceUrl()` maps it to the official text. Never invent references.
- Submit: wrong or blank answers create flashcards (or reset an existing card with the same front). XP: 10 per correct
  answer, +20 for a perfect quiz. In-progress quizzes can be abandoned (deleted); completed ones are kept.
- SRS (`server/srs.ts`, SM-2 style): Again = back in 10 min and to the end of the session queue; Hard/Good/Easy space
  by days. Reviews give 1–3 XP only when the card was due.
- Leaderboard: week starts Monday 00:00 `LEADERBOARD_TIMEZONE` (America/Sao_Paulo); ties share the rank.

## Database

Tables: `users`, `quizzes`, `quiz_questions` (options `jsonb`), `flashcards`, `xp_events`. UUID ids generated in code
(`crypto.randomUUID()`). Schema changes: edit `db/schema.sql` idempotently (`if not exists`, `add column if not exists`)
and run `pnpm db:setup` against each database. The production Neon DB was created by the old FastAPI/Alembic API and has
an extra `alembic_version` table; leave it.

## UI conventions

- Mobile first: bottom tab bar on small screens (Prova, Flashcards, Ranking), top nav on desktop; header has help,
  account menu (help + sign out) and the PWA "Instalar" button.
- Loading states are skeletons (`components/ui/skeleton.tsx`, `components/app/page-skeletons.tsx`), never "Carregando…"
  text; spinners only inside buttons for in-flight actions.
- Destructive actions use `ConfirmDialog`; animations come from `@theme` (`animate-fade-up`, `card-in`, `pop`, …) and
  respect `prefers-reduced-motion`.

## Commands

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm test` · `pnpm db:setup` · Docker: `docker compose up --build` (from the
parent folder, uses `web/.env.local`). CI (`.github/workflows/ci.yml`): lint, test, build. Vercel deploys `main`.
