"""
Brand Visibility Agent API — FastAPI entrypoint (Phase 1 skeleton).

Run locally (from python-backend/):
    uvicorn api.main:app --reload --port 8000

Phase 1 exposes only /health and /agent/info. Data endpoints (X, LinkedIn) and
HTML dashboards come in later phases; templates/ and static/ are created now so
those can be added without restructuring.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from agents.brand_visibility.linkedin.db import LinkedInDatabase
from agents.brand_visibility.x.db import Database as XDatabase
from api.routers import dashboards as dashboards_router
from api.routers import linkedin as linkedin_router
from api.routers import x as x_router

API_VERSION = "0.1.0"

# uvicorn's logger so lifespan messages appear in the server output.
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the LinkedIn schema ONCE at startup, not per request.

    Request handlers use LinkedInDatabase(skip_schema_init=True); this is the
    single place schema DDL runs while the API is up.
    """
    logger.info("Initializing schema...")
    db = LinkedInDatabase()  # default skip_schema_init=False -> runs DDL once
    try:
        conn = getattr(db, "_conn_obj", None)
        if conn is not None and hasattr(conn, "close"):
            conn.close()
    except Exception:  # best-effort; libsql may not require an explicit close
        pass
    logger.info("Schema initialization complete")

    # Verify X (KA017) Turso connectivity at startup. The X tables already exist
    # in Turso, so skip schema init here — this is a connectivity probe only.
    try:
        xdb = XDatabase(skip_schema_init=True)
        logger.info("X DB connectivity OK (scraped_tweets: %s rows)", xdb.count_posts())
        xconn = getattr(xdb, "_conn_obj", None)
        if xconn is not None and hasattr(xconn, "close"):
            xconn.close()
    except Exception:
        logger.exception("X DB connectivity check FAILED (dashboard /dashboard/x may error)")

    yield
    logger.info("API shutdown complete")

# Resolve api/ dir so paths work regardless of the process CWD.
_API_DIR = Path(__file__).resolve().parent
_TEMPLATES_DIR = _API_DIR / "templates"
_STATIC_DIR = _API_DIR / "static"
_TEMPLATES_DIR.mkdir(exist_ok=True)
_STATIC_DIR.mkdir(exist_ok=True)

app = FastAPI(title="Brand Visibility Agent API", version=API_VERSION, lifespan=lifespan)

# CORS: wide open for now. Tighten allow_origins to the teammate's React URL once
# known. allow_credentials stays False because credentials are incompatible with
# the "*" wildcard origin (and there's no auth yet).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configured for future HTML responses (unused in Phase 1).
templates = Jinja2Templates(directory=str(_TEMPLATES_DIR))
app.mount("/static", StaticFiles(directory=str(_STATIC_DIR)), name="static")

# Platform routers
app.include_router(linkedin_router.router, prefix="/api/linkedin", tags=["linkedin"])
app.include_router(x_router.router, prefix="/api/x", tags=["x"])
# Server-rendered HTML dashboards
app.include_router(dashboards_router.router, tags=["dashboards"])


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "brand-visibility-agent-api",
        "version": API_VERSION,
    }


@app.get("/agent/info")
def agent_info() -> dict:
    """Agent metadata consumed by the React Level-2 platform selector.

    dashboard_url values are RELATIVE — the frontend joins them with the API base
    URL to build iframe sources.
    """
    return {
        "slug": "brand-visibility",
        "name": "Brand Visibility Agent",
        "description": "Voice AI builder signals from X and LinkedIn",
        "has_platforms": True,
        "platforms": [
            {"slug": "x", "name": "X", "dashboard_url": "/dashboard/x"},
            {"slug": "linkedin", "name": "LinkedIn", "dashboard_url": "/dashboard/linkedin"},
        ],
    }
