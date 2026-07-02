# AI Leaderboard Agent

A master directory of Voice and Audio AI leaderboards — discover, explore, and compare every leaderboard in the voice/audio AI space.

**Stack:** React + Vite (frontend) · FastAPI + Python (backend) · SQLite (local) / Turso (production)

---

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

---

### 1. Backend

```bash
cd leaderboard/backend

# Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and fill in your values (see comments inside the file)

# Run the server (starts on http://localhost:8000)
uvicorn main:app --reload
```

The backend will auto-create the SQLite database (`leaderboard.db`) and seed it with the initial leaderboard entries on first run.

---

### 2. Frontend

Open a second terminal:

```bash
cd leaderboard/frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local — set VITE_API_URL=http://localhost:8000 for local dev

# Start the dev server (opens on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser and log in with the credentials you set in `backend/.env`.

---

### 3. Environment Variables Reference

**backend/.env**

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | For Gemini normalization when adding new leaderboards |
| `JWT_SECRET` | Yes | Any long random string — used to sign login tokens |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Yes (one pair) | Admin login credentials |
| `APP_USERNAME` / `APP_PASSWORD` | Optional | Second login account |
| `TURSO_URL` / `TURSO_AUTH_TOKEN` | Production only | Leave blank to use local SQLite |

**frontend/.env.local**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL — `http://localhost:8000` for local dev |

---

## Features

- Browse all AI leaderboards with filters by domain (STT, TTS, Voice Assistants, Realtime Voice Agents)
- On-demand ranking scraper with 24-hour cache — click a leaderboard to fetch live rankings
- Re-scan button to force a fresh scrape
- Side-by-side leaderboard comparison
- Full-text search across leaderboards, models, and companies
- Admin dashboard — add, edit, and delete leaderboards; prompts panel
- JWT-based authentication protecting all routes

---

## Project Structure

```
leaderboard/
├── backend/
│   ├── main.py              # FastAPI app + auth middleware
│   ├── models.py            # SQLAlchemy models
│   ├── database.py          # DB connection (SQLite / Turso)
│   ├── seed_data.py         # Initial leaderboard seed entries
│   ├── requirements.txt
│   ├── .env.example         # Copy to .env and fill in
│   ├── agent/
│   │   ├── normalizer.py    # Gemini normalization (one-time per leaderboard)
│   │   └── scraper.py       # On-demand ranking scraper
│   └── routers/
│       ├── auth.py          # POST /auth/login
│       ├── leaderboards.py  # GET /leaderboards, /leaderboards/{id}, ...
│       ├── search.py        # GET /search
│       ├── compare.py       # GET /compare/...
│       ├── admin.py         # POST/PUT/DELETE /admin/...
│       └── domain_categories.py
└── frontend/
    ├── src/
    │   ├── App.tsx           # Routes
    │   ├── main.tsx          # Entry point
    │   ├── lib/
    │   │   ├── auth.tsx      # Auth context + JWT storage
    │   │   └── api.ts        # API client helpers
    │   ├── pages/            # Home, DomainPage, LeaderboardPage, ...
    │   └── components/       # Layout, Login, RequireAuth, ...
    ├── vercel.json           # Vercel deployment config
    ├── vite.config.ts
    ├── package.json
    └── .env.example          # Copy to .env.local and fill in
```
