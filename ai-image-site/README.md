# minsuro

An uncensored AI image studio. Users sign in, buy credits, and submit
text-to-image or image-to-image jobs that fal.ai renders asynchronously.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling, design tokens declared in `src/app/globals.css`
- **Motion** for interaction and scroll animation, **lucide-react** for icons
- **Firebase Auth** for accounts, **Firestore** for users, credits and jobs
- **Paystack** for credit top-ups
- **fal.ai** queue + webhook for generation (no always-on worker)

## Getting started

```bash
npm install
npm run dev      # app on http://localhost:3000
```

Locally every surface is served from one origin:

| Path | Surface |
| --- | --- |
| `/` | marketing landing page |
| `/studio` | the authenticated studio |
| `/learn` | prompting lessons |
| `/api/*` | JSON API |

`/api/generate` deducts credits, then submits the job to the fal.ai queue with
a webhook URL (`/api/fal/webhook`). fal POSTs the result when it is done; we
store the file on R2 (or local disk) and mark the job succeeded. On localhost
fal cannot reach the webhook, so generate waits for the result in the same
request instead.

## Environment

Create `.env.local` with the variables validated in `src/lib/env.ts`:

| Variable | Purpose |
| --- | --- |
| `BASE_URL` | Public origin fal uses as the webhook target. Must not be localhost in production |
| `NEXT_PUBLIC_SITE_URL` | Marketing site origin — unset for local dev |
| `NEXT_PUBLIC_STUDIO_URL` | Studio origin — unset for local dev |
| `NEXT_PUBLIC_LEARN_URL` | Learn site origin — unset for local dev |
| `NEXT_PUBLIC_API_URL` | API origin. Leave unset until the API sends CORS headers |
| `FAL_KEY` | fal.ai API key — required for generation |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (API key, auth domain, project id, storage bucket, messaging sender id, app id) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON for Admin SDK (Paystack + fal webhooks) |
| `PAYSTACK_SECRET_KEY` | Secret key for checkout and webhook signatures |
| `PAYSTACK_CURRENCY` | Checkout currency. Defaults to `NGN` |

## Domains

One deployment serves four hostnames. `src/proxy.ts` reads the incoming `Host`
header and rewrites it onto the matching internal path, so `studio.minsuroai.com/`
renders `/studio` and `learn.minsuroai.com/prompt-anatomy` renders
`/learn/prompt-anatomy`. Paths belonging to another surface are redirected to
the host that owns them.

| Host | Serves | Notes |
| --- | --- | --- |
| `minsuroai.com` | landing page | indexed |
| `studio.minsuroai.com` | the studio | the only place users sign in; `noindex` |
| `learn.minsuroai.com` | lessons | static, indexed |
| `api.minsuroai.com` | `/api/*` only | other paths redirect to the marketing site |

Host routing only activates once the `NEXT_PUBLIC_*_URL` vars point at
*different* hosts. While they are unset — or all resolve to the same origin —
the proxy passes requests straight through and the internal paths are served as
written, which is what makes local development work without DNS.

Two things to know before deploying:

- These are `NEXT_PUBLIC_` vars, so they are inlined at build time. They must be
  set in the build environment, not only at runtime.
- Firebase Auth sessions are scoped to one origin, which is why sign-in lives
  only on the studio host. Add every hostname to the Firebase console's
  authorized domains list.
- Behind a CDN that is not host-aware, responses must vary on `Host`.

To exercise host routing locally, `*.localhost` resolves on macOS without
touching `/etc/hosts`. With the `NEXT_PUBLIC_*_URL` vars in `.env.local` pointed
at `http://localhost:3000`, `http://studio.localhost:3000` and
`http://learn.localhost:3000`, each surface is its own host — the same split
production uses.

## Deploy (Vercel + Cloudflare)

One Vercel project serves every hostname. Do **not** create three Vercel apps.

1. [vercel.com/new](https://vercel.com/new) → Import `richardagaya/AI`.
2. **Root Directory** → `ai-image-site` (the Next app is a subfolder of the repo).
3. Add the Production env vars from `.env.example` (`BASE_URL`, the three
   `NEXT_PUBLIC_*_URL`s, and every `NEXT_PUBLIC_FIREBASE_*`). Leave
   `NEXT_PUBLIC_API_URL` unset.
4. Deploy once so Vercel issues a `*.vercel.app` URL. Confirm `/`, `/studio`
   and `/learn` load on that URL.
5. Project → Settings → Domains, add:
   - `minsuroai.com`
   - `www.minsuroai.com` (redirect to apex)
   - `studio.minsuroai.com`
   - `learn.minsuroai.com`
6. In Cloudflare DNS, create the records Vercel shows. Keep each one **DNS
   only** (grey cloud), not Proxied. Typical values:
   - `minsuroai.com` → `A` `76.76.21.21`
   - `www`, `studio`, `learn` → `CNAME` `cname.vercel-dns.com`
7. Firebase Console → Authentication → Settings → Authorized domains, add
   `minsuroai.com`, `www.minsuroai.com`, `studio.minsuroai.com`.

After that, landing / studio / learn are live. Generation needs `FAL_KEY`,
`FIREBASE_SERVICE_ACCOUNT` (so the fal webhook can write the job), and for
production files, the R2 vars. Sign-in, credits, and the learn site do not
need R2.

## Working on a section

Same repo, same deploy. People own folders, not separate apps:

| Live host | Code they change |
| --- | --- |
| `minsuroai.com` | `src/app/page.tsx`, `src/components/landing/` |
| `studio.minsuroai.com` | `src/app/studio/`, `src/components/dashboard/`, `src/components/auth/` |
| `learn.minsuroai.com` | `src/app/learn/`, `src/components/learn/`, `src/lib/learn.ts` |
| API (still same origin) | `src/app/api/` |

Shared, so coordinate: `src/lib/site.ts`, `src/proxy.ts`, `src/app/layout.tsx`,
`src/app/globals.css`, `src/components/ui/`, `src/components/brand/`.

Locally, run `npm run dev` and open the matching host (`learn.localhost:3000`,
etc.). A preview deploy from a branch still serves all three surfaces.

## Project layout

```
src/proxy.ts             maps hostnames onto internal routes
src/app/page.tsx         marketing landing page
src/app/studio/          authenticated studio, auth state in AppClient.tsx
src/app/learn/           lesson index and lesson pages
src/app/api/             API handlers
src/components/brand/    snowflake mark and wordmark
src/components/landing/  marketing sections (hero, showcase, pricing, FAQ…)
src/components/learn/    learn nav, footer and lesson renderer
src/components/dashboard/ authenticated generation console
src/components/ui/       button, form controls, media card, reveal
src/lib/site.ts          surface URLs and host resolution
src/lib/learn.ts         lesson content
src/lib/                 auth, Firestore, fal, storage, media manifest
```

## Costs

Text-to-image costs 1 credit, image-to-image costs 2. Credits are deducted in the
same Firestore transaction that creates the job, so a request can never generate
without paying, and failed jobs do not consume credits.
