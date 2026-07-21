# GabAI PH

> Verify once with your face. Get a living roadmap to your driver's license.

## Quickstart

1. `git clone <repo> && cd eGov-hackathon-2026`
2. `cp backend/.env.example backend/.env && cp frontend/.env.example frontend/.env.local`
3. Fill in the hackathon secrets in `backend/.env` and the eKYC pubKey in `frontend/.env.local`
4. `npm install && npm --prefix backend install && npm --prefix frontend install`
5. `npm run dev` → frontend on http://localhost:3000, backend on http://localhost:4000

Run backend unit tests with `npm test`. Dev status page (unlinked): http://localhost:3000/admin.
