# Contributing

This is **one Next.js app**, not separate landing and dashboard repos. You own folders. Open a branch, keep PRs to the UI you were asked to change.

## Front-end (landing + dashboard)

Use this if you were asked to work on the marketing site and/or the studio UI.

### Run it

```bash
npm install
cp .env.example .env.local
# Fill the NEXT_PUBLIC_FIREBASE_* values (ask the project owner)
npm run dev
```

| URL | What |
| --- | --- |
| http://localhost:3000 | Landing |
| http://localhost:3000/studio | Dashboard (sign in) |

Do **not** commit `.env.local`.

### Env you need

Only Firebase **web** config. These already ship in the browser bundle.

```bash
BASE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STUDIO_URL=http://localhost:3000/studio
NEXT_PUBLIC_LEARN_URL=http://localhost:3000/learn

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

That is enough to build the landing, auth dialog, sidebar, composer, and gallery layout.

### Env you do not need

Leave these out unless the owner explicitly gives you a **test** value:

| Variable | If missing |
| --- | --- |
| `FAL_KEY` | Generate returns “not configured” |
| `PAYSTACK_SECRET_KEY` | Top up returns “not configured” |
| `FIREBASE_SERVICE_ACCOUNT` | Not required for local UI work |
| `R2_*` | Images would use a local `storage/` folder anyway |

Never put live Paystack keys, R2 write keys, or the Firebase service-account JSON in git or in a chat with other front-end folks.

### Folders you own

| Surface | Change these |
| --- | --- |
| Landing | `src/app/page.tsx`, `src/components/landing/`, `src/lib/media.ts` |
| Dashboard | `src/app/studio/`, `src/components/dashboard/`, `src/components/auth/` |

Swap landing images/videos in `src/lib/media.ts` only — do not hardcode URLs inside section components.

Studio screen state lives in `src/lib/store.ts` (Jotai). Prefer reading/writing atoms over threading new props through `Dashboard`.

### Do not edit

- `src/app/api/` — JSON API (auth, generate, jobs, credits)
- `src/lib/auth.ts`, `firestoreRest.ts`, `fal.ts`, `paystack.ts`, `r2.ts`, `env.ts`, `firebaseAdmin.ts`

If a button needs a new backend field or endpoint, open an issue / ping the owner. Do not invent API routes.

### Ask before changing (shared)

These affect landing, studio, and learn at once:

- `src/app/layout.tsx`, `src/app/globals.css`
- `src/lib/site.ts`, `src/proxy.ts`
- `src/components/brand/`, `src/components/ui/`

Links to the studio must use `studioUrl()` / `learnUrl()` from `@/lib/site`, not a hardcoded `https://studio.minsuroai.com`.

### Git

```bash
git checkout -b feat/landing-dashboard
```

Keep landing and studio in separate PRs when you can. Do not mix API or env changes into a UI PR.

---

## Backend / API (owner)

`src/app/api/`, `src/lib/` server modules, Vercel env, Paystack, fal, R2, Firebase Admin. See `README.md` for the full env list and deploy notes.
