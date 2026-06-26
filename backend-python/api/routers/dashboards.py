"""
HTML dashboard routes (server-rendered via Jinja2).

Phase 4a: GET /dashboard/linkedin renders the LinkedIn dashboard shell with real
KPI data fetched server-side (no JS needed for first paint). Interactivity (live
filtering of the posts table) lands in Phase 4b.
"""
from __future__ import annotations

from datetime import datetime
from pathlib import Path

from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from agents.brand_visibility.linkedin.db import LinkedInDatabase
from api.routers.linkedin import (
    PostSort,
    get_db,
    posts as linkedin_posts,
    stats as linkedin_stats,
)

router = APIRouter()

# Same templates dir as main.py (api/templates). routers/ -> parent.parent == api/.
templates = Jinja2Templates(directory=str(Path(__file__).resolve().parent.parent / "templates"))


def _fmt_ts(ts) -> str:
    """Format a stored ISO timestamp for display, or em-dash if absent/unparseable."""
    if not ts:
        return "—"
    try:
        d = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
        return d.strftime("%b %d, %Y %H:%M UTC")
    except Exception:
        return str(ts)


@router.get("/dashboard/linkedin", response_class=HTMLResponse)
def linkedin_dashboard(request: Request, db: LinkedInDatabase = Depends(get_db)):
    s = linkedin_stats(db)  # reuse the /api/linkedin/stats logic -> LinkedinStatsResponse

    runs_total = db.query("SELECT COUNT(*) AS c FROM linkedin_runs")[0]["c"]
    last_run = db.query("SELECT MAX(started_at) AS m FROM linkedin_runs")[0]["m"]
    posts_month = db.query(
        "SELECT COUNT(*) AS c FROM linkedin_posts "
        "WHERE strftime('%Y-%m', ingested_at) = strftime('%Y-%m', 'now')"
    )[0]["c"]

    context = {
        "stats": s,
        "most_recent_display": _fmt_ts(s.most_recent_scrape),
        "footer": {
            "runs_total": runs_total,
            "last_run": _fmt_ts(last_run),
            "posts_this_month": posts_month,
        },
    }
    return templates.TemplateResponse(request, "linkedin_dashboard.html", context)


@router.get("/dashboard/linkedin/_posts-table", response_class=HTMLResponse)
def linkedin_posts_table(
    request: Request,
    db: LinkedInDatabase = Depends(get_db),
    tier: Optional[list[str]] = Query(None),
    category: Optional[str] = Query(None),
    source_class: Optional[str] = Query(None),
    sort_by: PostSort = Query(PostSort.tier_asc_then_fit),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """HTML partial (table + counts) for HTMX filter updates. Reuses the Phase 2
    /api/linkedin/posts query logic (single source of truth) and adds a
    pre-formatted posted_at_display for the template."""
    resp = linkedin_posts(
        db, limit=limit, offset=offset, tier=tier,
        category=category or None, source_class=source_class or None, sort_by=sort_by,
    )
    rows = []
    for p in resp.posts:
        d = p.model_dump()
        d["posted_at_display"] = _fmt_ts(p.posted_at)
        rows.append(d)

    context = {
        "posts": rows,
        "total": resp.total,
        "limit": resp.limit,
        "offset": resp.offset,
    }
    return templates.TemplateResponse(request, "_posts_table.html", context)
