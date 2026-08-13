# minsuro

An uncensored AI image studio. Users sign in, buy credits with crypto, and submit
text-to-image or image-to-image jobs that a background worker renders through
ComfyUI.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for styling, design tokens declared in `src/app/globals.css`
- **Motion** for interaction and scroll animation, **lucide-react** for icons
- **Firebase Auth** for accounts, **Firestore** for users, credits and jobs
- **Coinbase Commerce** for credit top-ups
- **ComfyUI** as the render backend, driven by `scripts/worker.ts`

## Getting started

```bash
npm install
npm run dev      # app on http://localhost:3000
npm run worker   # job worker, run alongside the app
```

The worker polls Firestore for queued jobs, hydrates the workflow templates in
`workflows/`, queues them on ComfyUI, then writes the output image back to
storage and flips the job to `succeeded` or `failed`.

## Environment

Create `.env.local` with the variables validated in `src/lib/env.ts`:

| Variable | Purpose |
| --- | --- |
| `BASE_URL` | Public origin, used for checkout redirects |
| `COMFYUI_URL` | ComfyUI endpoint (defaults to `http://127.0.0.1:8188`) |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web config (API key, auth domain, project id, storage bucket, messaging sender id, app id) |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON for the Admin SDK; falls back to Application Default Credentials |
| `COINBASE_COMMERCE_API_KEY` | Optional, required for credit checkout |
| `COINBASE_COMMERCE_WEBHOOK_SECRET` | Optional, verifies top-up webhooks |

## Project layout

```
src/app/                 routes and API handlers
src/app/AppClient.tsx    auth state, wires the landing page to the studio
src/components/brand/    snowflake mark and wordmark
src/components/landing/  marketing sections (hero, showcase, pricing, FAQ…)
src/components/studio/   authenticated generation console
src/components/ui/       button, form controls, media card, reveal
src/lib/                 auth, Firestore, ComfyUI, storage, media manifest
scripts/worker.ts        render worker
workflows/               ComfyUI workflow templates
```

## Costs

Text-to-image costs 1 credit, image-to-image costs 2. Credits are deducted in the
same Firestore transaction that creates the job, so a request can never generate
without paying, and failed jobs do not consume credits.
