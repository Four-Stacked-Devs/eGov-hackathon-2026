# Deploying HaviFlow

HaviFlow is two apps: a **Next.js frontend** and an **Express backend** that holds
session/user state in memory. The backend must run as a single long-lived process
(not serverless), so it goes on **Render** (or Railway), and the frontend goes on
**Vercel**.

```
  Browser ──▶ Vercel (frontend, Next.js) ──▶ Render (backend, Express) ──▶ eGov APIs
```

Deploy the **backend first** — you need its URL for the frontend, and vice-versa.
Env vars can be edited after the fact, so a little back-and-forth is fine.

---

## 1. Backend → Render

The repo ships a `render.yaml` blueprint.

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, select the repo. Render reads `render.yaml`
   and creates the `haviflow-backend` web service (root dir `backend`,
   `npm install` → `npm start`).
3. When prompted, paste the secret env vars (the `sync: false` ones) from your
   local `backend/.env`:
   - `SSO_PARTNER_CODE`, `SSO_PARTNER_SECRET`
   - `EVERIFY_CLIENT_ID`, `EVERIFY_CLIENT_SECRET`
   - `EGOVAI_ACCESS_CODE`, `EMESSAGE_TOKEN`
   - `FACE_LIVENESS_BASE_URL`, `FACE_LIVENESS_API_KEY` (optional — leave blank to
     disable the liveness pre-check)
   - `FRONTEND_ORIGIN` — set to your Vercel URL once you have it (step 2). You can
     put a placeholder now and update it after.
4. Deploy. Note the service URL, e.g. `https://haviflow-backend.onrender.com`.

> Render's free tier sleeps after inactivity and cold-starts in ~30–60s. For a
> live demo, open the backend URL once a minute before you present, or upgrade to
> the paid tier.

**Railway alternative:** New Project → Deploy from repo → set **Root Directory**
to `backend`, start command `npm start`. Add the same env vars. Railway injects
`PORT` automatically, which the app already reads.

---

## 2. Frontend → Vercel

1. In Vercel: **Add New → Project**, import the same repo.
2. Set **Root Directory** to `frontend` (Import screen → Edit). Vercel then
   auto-detects Next.js — leave build/output settings default.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (no trailing slash), e.g.
     `https://haviflow-backend.onrender.com`
   - `NEXT_PUBLIC_EKYC_PUBKEY` = your eKYC public key
4. Deploy. Note the assigned URL, e.g. `https://haviflow.vercel.app`.

---

## 3. Wire the two together

1. Back in Render, set `FRONTEND_ORIGIN` to the exact Vercel URL (no trailing
   slash). This is used for CORS — a mismatch blocks every request.
2. Redeploy the backend so the new origin takes effect.

That's it. The session cookie is automatically `SameSite=None; Secure` in
production (`NODE_ENV=production`), so it survives the cross-domain hop between
Vercel and Render.

---

## Gotchas

- **Cookies not sticking / stuck on sign-in?** `FRONTEND_ORIGIN` on the backend
  must match the frontend origin *exactly* (scheme + host, no trailing slash),
  and `NODE_ENV` must be `production` so the cookie is sent cross-site.
- **In-memory state.** Users and sessions live in RAM (`backend/src/store.ts`).
  A backend restart or scaling past one instance drops everyone's session. Fine
  for a demo; for real use, keep the backend on a single instance and replace the
  `Map`s with Postgres/Redis.
- **Preview deployments.** Each Vercel preview gets a new URL that won't match
  `FRONTEND_ORIGIN`. Demo from the production (or a fixed) domain.
