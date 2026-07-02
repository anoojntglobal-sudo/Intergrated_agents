import os
import threading
import jwt
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

from database import engine, SessionLocal
from models import Base
from seed_data import run_seed, seed_domain_categories, fix_domain_corruption, fix_category_configs, seed_prompts
from routers import leaderboards, search, compare, admin, domain_categories, auth as auth_router

Base.metadata.create_all(bind=engine)

def _create_missing_tables():
    """Create tables added after initial schema (create_all is idempotent for existing tables)."""
    from sqlalchemy import inspect
    insp = inspect(engine)
    existing = insp.get_table_names()
    if "seed_exclusions" not in existing:
        from models import SeedExclusion
        SeedExclusion.__table__.create(bind=engine)
        print("Migration: created 'seed_exclusions' table.")

_create_missing_tables()

# Auto-migrate: add any columns that exist in models but not yet in the DB.
# Needed when running against an existing leaderboard.db after a schema change.
def _auto_migrate():
    from sqlalchemy import inspect, text
    insp = inspect(engine)
    try:
        existing_cols = {c["name"] for c in insp.get_columns("leaderboards")}
    except Exception:
        return  # Table doesn't exist yet — create_all() will build it with the full schema
    with engine.begin() as conn:
        if "source" not in existing_cols:
            conn.execute(text("ALTER TABLE leaderboards ADD COLUMN source VARCHAR NOT NULL DEFAULT 'seed'"))
            print("Migration: added 'source' column to leaderboards.")
        if "column_order" not in existing_cols:
            conn.execute(text("ALTER TABLE leaderboards ADD COLUMN column_order JSON"))
            print("Migration: added 'column_order' column to leaderboards.")
        if "scraper_note" not in existing_cols:
            conn.execute(text("ALTER TABLE leaderboards ADD COLUMN scraper_note TEXT"))
            print("Migration: added 'scraper_note' column to leaderboards.")
        if "scope" not in existing_cols:
            conn.execute(text("ALTER TABLE leaderboards ADD COLUMN scope VARCHAR"))
            print("Migration: added 'scope' column to leaderboards.")

_auto_migrate()

app = FastAPI(title="Voice AI Leaderboard Agent", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_JWT_SECRET = os.getenv("JWT_SECRET", "change-me-please")
_JWT_ALGORITHM = "HS256"
# Paths that bypass auth entirely
_PUBLIC_PATHS = {"/", "/health", "/docs", "/openapi.json", "/redoc"}
_PUBLIC_PREFIXES = ("/auth/",)


@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    # Let CORS preflight pass through so the CORS middleware can respond correctly
    if request.method == "OPTIONS":
        return await call_next(request)
    path = request.url.path
    if path in _PUBLIC_PATHS or any(path.startswith(p) for p in _PUBLIC_PREFIXES):
        return await call_next(request)
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Not authenticated"})
    token = auth[7:]
    try:
        payload = jwt.decode(token, _JWT_SECRET, algorithms=[_JWT_ALGORITHM])
        request.state.user = payload
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"detail": "Token expired"})
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={"detail": "Invalid token"})
    return await call_next(request)


app.include_router(auth_router.router)
app.include_router(leaderboards.router)
app.include_router(search.router)
app.include_router(compare.router)
app.include_router(admin.router)
app.include_router(domain_categories.router)


@app.on_event("startup")
def on_startup():
    # Run seed + migrations synchronously so the DB is ready before requests come in
    db = SessionLocal()
    try:
        run_seed(db)
        fix_domain_corruption(db)
        seed_domain_categories(db)
        fix_category_configs(db)
        seed_prompts(db)          # ← add this line
    finally:
        db.close()

    # Normalization calls Gemini (slow) — run in background so the server is
    # immediately ready to serve requests instead of blocking for minutes.
    def _enrich_in_background():
        """
        Normalize pending / no-description leaderboards at startup.
        Sequential and single-threaded — safe for Render free-tier (512 MB).
        Scope and popularity are enriched lazily after each rescan instead.
        """
        from models import Leaderboard
        from agent.normalizer import normalize_leaderboard

        db = SessionLocal()
        try:
            pending = db.query(Leaderboard).filter(Leaderboard.status == "pending").all()
            no_about = db.query(Leaderboard).filter(
                Leaderboard.status == "active",
                Leaderboard.description.is_(None),
            ).all()
            to_normalize = pending + no_about
            if to_normalize:
                print(f"[bg] Normalizing {len(to_normalize)} leaderboard(s)...")
                for lb in to_normalize:
                    try:
                        normalize_leaderboard(lb.id, db)
                    except Exception as e:
                        print(f"  [bg] Normalize error for {lb.name}: {e}")
                        lb.status = "active"
                        db.commit()
        finally:
            db.close()

    threading.Thread(target=_enrich_in_background, daemon=True).start()


@app.get("/")
def root():
    return {"message": "Voice AI Leaderboard Agent API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
