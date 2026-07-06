# Local Dev — Frontend (Vite + React)

The KiteAI agent platform UI. Two dashboards are embedded as iframes from the
**Python** service (`backend-python/`): LinkedIn (`/brand/linkedin`) and X
(`/brand/x`). Auth + the X-agent Node dashboard come from the **Node** backend
(`backend/`).

## Prerequisites
- Node 18+
- Both backends running locally (see below) — the frontend alone can't log in or
  show dashboards.

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local     # Windows: copy .env.example .env.local
```

`.env.local` (gitignored) — local values:
```
VITE_API_URL=http://localhost:3001     # Node backend (auth + X-agent Node dashboard)
VITE_PYTHON_URL=http://localhost:8000  # Python dashboards (LinkedIn + X iframes)
```
If `VITE_PYTHON_URL` is unset, the app falls back to the Render deployment
(`https://kiteai-brand-visibility-py.onrender.com`), so the iframes still work
without a local Python server.

## Run (needs all three processes)

Open three terminals:

```bash
# 1. Python dashboards — see backend-python/DEV.md
cd backend-python && .\venv\Scripts\Activate.ps1 && uvicorn api.main:app --reload --port 8000

# 2. Node backend (auth) — see backend/ for its .env
cd backend && node server.js          # serves :3001

# 3. Frontend
cd frontend && npm run dev             # Vite on http://localhost:5173
```

Then open **http://localhost:5173**, log in (Node backend must be up), and go to
**Brand Visibility → LinkedIn Agent** / **X Agent**.

> Vite picks the next free port if 5173 is taken — watch its startup line. If it
> lands elsewhere and you later tighten CORS, add that origin to the Python
> service's `ALLOWED_ORIGINS`.

## Test the iframe integration locally
1. Python running on :8000, frontend on :5173.
2. Visit `/brand/x` — the embedded dashboard should load with real Turso data and
   a compact header (← Brand Visibility · X Agent · **Open in new tab ↗**).
3. Confirm it's hitting **local**, not Render: the "Open in new tab ↗" link should
   point at `http://localhost:8000/dashboard/x` (DevTools → Network, or hover).
4. Same for `/brand/linkedin`.
5. To temporarily test against Render instead, comment out `VITE_PYTHON_URL` in
   `.env.local` and restart `npm run dev` (Vite only reads env at startup).

## Build / sanity
```bash
npm run build     # production build; catches JSX/import errors
```

## Troubleshooting
- **Iframe blank / connection refused** — Python (:8000) not running, or
  `VITE_PYTHON_URL` wrong. Restart Vite after editing `.env.local`.
- **Login fails** — Node backend (:3001) not running, or `VITE_API_URL` wrong.
- **Env change not taking effect** — Vite reads `.env.local` only at dev-server
  start; restart `npm run dev`.
