"""
HTML dashboard routes (server-rendered via Jinja2).

Phase 4a: GET /dashboard/linkedin renders the LinkedIn dashboard shell with real
KPI data fetched server-side (no JS needed for first paint). Interactivity (live
filtering of the posts table) lands in Phase 4b.

Phase 4c: interactive control panels (prompt editor, scheduler form, manual run)
plus pagination. The mutating panels POST/PUT to *dashboard* wrapper endpoints
here that reuse the Phase 1-3 JSON handlers as the single source of truth, then
return HTML partials (HTMX swaps them in place). This keeps form posts simple
(form-encoded, no json-enc extension) and the JSON API untouched.

Phase 4d: cost-summary panel, a standalone KPI-strip partial (shared by first
paint and the post-run refresh), an ?embedded=true mode for iframe hosting, and
assorted polish. Still no new JSON API endpoints — cost data reuses the Phase 2
/api/linkedin/cost-summary handler.
"""
from __future__ import annotations

from datetime import datetime
from pathlib import Path

from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Form, HTTPException, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import ValidationError

from agents.brand_visibility.linkedin.db import LinkedInDatabase
from api.routers.linkedin import (
    MONTHLY_BUDGET,
    PostSort,
    UpdatePromptRequest,
    UpdateScheduleRequest,
    _next_prompt_version,
    _scalar,
    active_prompt as linkedin_active_prompt,
    cost_summary as linkedin_cost_summary,
    get_db,
    posts as linkedin_posts,
    run_now as linkedin_run_now,
    run_status as linkedin_run_status,
    schedule as linkedin_schedule,
    stats as linkedin_stats,
    update_active_prompt as linkedin_update_active_prompt,
    update_schedule_endpoint as linkedin_update_schedule,
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


def _duration(started, completed) -> str:
    """Human duration between two ISO timestamps, e.g. '42s' or '3m 05s'."""
    try:
        a = datetime.fromisoformat(str(started).replace("Z", "+00:00"))
        b = datetime.fromisoformat(str(completed).replace("Z", "+00:00"))
        secs = max(0, int((b - a).total_seconds()))
        return f"{secs // 60}m {secs % 60:02d}s" if secs >= 60 else f"{secs}s"
    except Exception:
        return "—"


PAGE_SIZES = [25, 50, 100, 200]


def _kpi_context(db: LinkedInDatabase) -> dict:
    """Context for the KPI strip — shared by the full-page render (via include)
    and the standalone /_kpi-strip refresh endpoint (Phase 4d, DRY)."""
    s = linkedin_stats(db)  # reuse the /api/linkedin/stats logic -> LinkedinStatsResponse
    return {"stats": s, "most_recent_display": _fmt_ts(s.most_recent_scrape)}


@router.get("/dashboard/linkedin", response_class=HTMLResponse)
def linkedin_dashboard(
    request: Request,
    embedded: bool = Query(False),
    db: LinkedInDatabase = Depends(get_db),
):
    runs_total = db.query("SELECT COUNT(*) AS c FROM linkedin_runs")[0]["c"]
    last_run = db.query("SELECT MAX(started_at) AS m FROM linkedin_runs")[0]["m"]
    posts_month = db.query(
        "SELECT COUNT(*) AS c FROM linkedin_posts "
        "WHERE strftime('%Y-%m', ingested_at) = strftime('%Y-%m', 'now')"
    )[0]["c"]

    context = {
        **_kpi_context(db),                 # stats, most_recent_display (for the included KPI strip)
        "embedded": embedded,               # ?embedded=true hides the header for iframe hosting
        "footer": {
            "runs_total": runs_total,
            "last_run": _fmt_ts(last_run),
            "posts_this_month": posts_month,
        },
    }
    return templates.TemplateResponse(request, "linkedin_dashboard.html", context)


@router.get("/dashboard/linkedin/_kpi-strip", response_class=HTMLResponse)
def kpi_strip(request: Request, db: LinkedInDatabase = Depends(get_db)):
    """Just the KPI strip — fetched on the initial page render via {% include %}
    is server-side, but this endpoint lets the post-run-completion poller refresh
    the live numbers without a full reload."""
    return templates.TemplateResponse(request, "_kpi_strip.html", _kpi_context(db))


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
    pre-formatted posted_at_display for the template.

    Empty-tier short-circuit (Phase 4d): on this dashboard the tier checkboxes are
    the primary filter, so "no tier selected" means show nothing (drives the empty
    state) rather than the JSON API's "no tier filter -> all rows". The JSON
    endpoint is unchanged; only this dashboard wrapper interprets it this way."""
    if not tier:
        rows, total, eff_offset = [], 0, 0
    else:
        resp = linkedin_posts(
            db, limit=limit, offset=offset, tier=tier,
            category=category or None, source_class=source_class or None, sort_by=sort_by,
        )
        rows = []
        for p in resp.posts:
            d = p.model_dump()
            d["posted_at_display"] = _fmt_ts(p.posted_at)
            rows.append(d)
        total, eff_offset = resp.total, resp.offset

    page_start = (eff_offset + 1) if rows else 0
    page_end = eff_offset + len(rows)
    context = {
        "posts": rows,
        "total": total,
        "limit": limit,
        "offset": eff_offset,
        # Pagination (Phase 4c): all derived server-side so the template stays dumb.
        "page_start": page_start,
        "page_end": page_end,
        "prev_offset": max(0, eff_offset - limit),
        "next_offset": eff_offset + limit,
        "has_prev": eff_offset > 0,
        "has_next": (eff_offset + limit) < total,
        "page_sizes": PAGE_SIZES,
    }
    return templates.TemplateResponse(request, "_posts_table.html", context)


# --------------------------------------------------------------------------
# Phase 4c — control-panel partials (lazy-loaded into the dashboard <details>)
# --------------------------------------------------------------------------

def _prompt_editor_context(db: LinkedInDatabase, status: Optional[dict] = None,
                           draft_text: Optional[str] = None) -> dict:
    """Build the prompt-editor context. draft_text, when set, repopulates the
    textarea after a failed save so the user doesn't lose their edit."""
    try:
        cur = linkedin_active_prompt(db)
        version, text, updated = cur.prompt_version, cur.prompt_text, cur.updated_at
    except HTTPException:
        version, text, updated = "—", "", None  # no active prompt yet
    return {
        "prompt_version": version,
        "prompt_text": draft_text if draft_text is not None else text,
        "updated_display": _fmt_ts(updated),
        "next_version": _next_prompt_version(db),
        "max_chars": 50_000,
        "status": status,
    }


@router.get("/dashboard/linkedin/_prompt-editor", response_class=HTMLResponse)
def prompt_editor(request: Request, db: LinkedInDatabase = Depends(get_db)):
    return templates.TemplateResponse(request, "_prompt_editor.html", _prompt_editor_context(db))


@router.post("/dashboard/linkedin/_prompt-editor", response_class=HTMLResponse)
def prompt_editor_save(
    request: Request,
    prompt_text: str = Form(""),     # default "" so an empty submit reaches our
    prompt_version: str = Form(""),  # friendly handler instead of a raw FastAPI 422
    db: LinkedInDatabase = Depends(get_db),
):
    """Save via the JSON handler (single source of truth), then re-render the
    editor with a status banner. Validation errors keep the submitted text."""
    # Empty / whitespace-only is rejected here (dashboard-side) so the user sees a
    # styled message rather than the JSON API's raw 422 — and so a blanks-only
    # prompt never silently saves (min_length=1 alone would accept "   ").
    if not prompt_text.strip():
        status = {"type": "error", "message": "Prompt text cannot be empty."}
        ctx = _prompt_editor_context(db, status=status, draft_text=prompt_text)
        return templates.TemplateResponse(request, "_prompt_editor.html", ctx)
    try:
        payload = UpdatePromptRequest(
            prompt_text=prompt_text,
            prompt_version=prompt_version.strip() or None,  # blank -> auto-increment
        )
    except ValidationError as exc:
        status = {"type": "error", "message": f"Invalid: {exc.errors()[0]['msg']}"}
        ctx = _prompt_editor_context(db, status=status, draft_text=prompt_text)
        return templates.TemplateResponse(request, "_prompt_editor.html", ctx)

    result = linkedin_update_active_prompt(payload, db)
    status = {"type": "success", "message": f"Saved as {result.prompt_version}."}
    return templates.TemplateResponse(request, "_prompt_editor.html", _prompt_editor_context(db, status=status))


def _scheduler_context(db: LinkedInDatabase, status: Optional[dict] = None) -> dict:
    s = linkedin_schedule(db)  # ScheduleResponse (creates defaults on first access)
    return {
        "sched": s,
        "last_run_display": _fmt_ts(s.last_run_at),
        "next_run_display": _fmt_ts(s.next_run_at),
        "status": status,
    }


@router.get("/dashboard/linkedin/_scheduler-form", response_class=HTMLResponse)
def scheduler_form(request: Request, db: LinkedInDatabase = Depends(get_db)):
    return templates.TemplateResponse(request, "_scheduler_form.html", _scheduler_context(db))


@router.put("/dashboard/linkedin/_scheduler-form", response_class=HTMLResponse)
def scheduler_form_save(
    request: Request,
    enabled: str = Form(""),          # checkbox: present only when checked
    interval_minutes: int = Form(...),
    max_keywords: int = Form(...),
    max_pages: int = Form(...),
    categories: str = Form(""),
    min_volume: str = Form(...),
    date_posted: str = Form(...),
    sort_by: str = Form(...),
    db: LinkedInDatabase = Depends(get_db),
):
    """Persist via the JSON PUT handler, then re-render the form with status."""
    try:
        payload = UpdateScheduleRequest(
            enabled=bool(enabled),
            interval_minutes=interval_minutes,
            max_keywords=max_keywords,
            max_pages=max_pages,
            categories=categories.strip() or None,  # blank field -> leave unchanged (exclude_none)
            min_volume=min_volume,
            date_posted=date_posted,
            sort_by=sort_by,
        )
    except ValidationError as exc:
        status = {"type": "error", "message": f"Invalid: {exc.errors()[0]['loc'][-1]}: {exc.errors()[0]['msg']}"}
        return templates.TemplateResponse(request, "_scheduler_form.html", _scheduler_context(db, status=status))

    linkedin_update_schedule(payload, db)
    status = {"type": "success", "message": "Schedule saved."}
    return templates.TemplateResponse(request, "_scheduler_form.html", _scheduler_context(db, status=status))


@router.get("/dashboard/linkedin/_run-agent", response_class=HTMLResponse)
def run_agent_panel(request: Request, db: LinkedInDatabase = Depends(get_db)):
    s = linkedin_stats(db)
    last = db.query(
        "SELECT id, status, started_at, completed_at, keywords_queried, "
        "api_calls_made, posts_ingested, posts_classified, error_count, notes "
        "FROM linkedin_runs ORDER BY started_at DESC LIMIT 1"
    )
    last_run = None
    if last:
        r = last[0]
        last_run = {
            **r,
            "started_display": _fmt_ts(r["started_at"]),
            "duration": _duration(r["started_at"], r["completed_at"]) if r["completed_at"] else None,
        }
    context = {"budget": s.monthly_api_budget, "last_run": last_run}
    return templates.TemplateResponse(request, "_run_agent.html", context)


@router.post("/dashboard/linkedin/_run-agent", response_class=HTMLResponse)
def run_agent_trigger(
    request: Request,
    background_tasks: BackgroundTasks,
    db: LinkedInDatabase = Depends(get_db),
):
    """Trigger a default-config sweep via the JSON run-now handler, then return
    the polling status partial. Budget/lock errors render as inline messages."""
    try:
        result = linkedin_run_now(background_tasks, payload=None, db=db)
    except HTTPException as exc:
        if exc.status_code == 429:
            msg = "Monthly budget exhausted"
        elif exc.status_code == 409:
            msg = "A sweep is already in progress"
        else:
            msg = str(exc.detail)
        return HTMLResponse(f'<div id="run-status-poll" class="status status-error">{msg}</div>')

    ctx = {
        "status": "running", "run_id": result.run_id, "just_started": True,
        "keywords_queried": 0, "api_calls_made": 0, "posts_ingested": 0,
        "posts_classified": 0, "duration": None, "notes": None,
    }
    return templates.TemplateResponse(request, "_run_status.html", ctx)


@router.get("/dashboard/linkedin/_run-status/{run_id}", response_class=HTMLResponse)
def run_status_partial(request: Request, run_id: int, db: LinkedInDatabase = Depends(get_db)):
    """HTML adapter over the JSON run-status endpoint. Renders a self-replacing
    poller while running; the terminal states omit hx-trigger so polling stops."""
    rs = linkedin_run_status(run_id, db)
    ctx = {
        "status": rs.status, "run_id": run_id, "just_started": False,
        "keywords_queried": rs.stats.keywords_queried,
        "api_calls_made": rs.stats.api_calls_made,
        "posts_ingested": rs.stats.posts_ingested,
        "posts_classified": rs.stats.posts_classified,
        "duration": _duration(rs.started_at, rs.completed_at) if rs.completed_at else None,
        "notes": rs.notes,
    }
    return templates.TemplateResponse(request, "_run_status.html", ctx)


# --------------------------------------------------------------------------
# Phase 4d — cost summary panel
# --------------------------------------------------------------------------

@router.get("/dashboard/linkedin/_cost-view", response_class=HTMLResponse)
def cost_view(request: Request, db: LinkedInDatabase = Depends(get_db)):
    """Cost panel: reuses the /api/linkedin/cost-summary handler for the totals +
    by-model breakdown, plus a this-month classified count for the average."""
    cs = linkedin_cost_summary(db)  # CostSummaryResponse

    classified_this_month = int(_scalar(
        db,
        "SELECT COUNT(DISTINCT post_id) FROM linkedin_classification_costs "
        "WHERE strftime('%Y-%m', classified_at) = strftime('%Y-%m', 'now')",
    ))
    avg_cost = (cs.this_month_total_usd / classified_this_month) if classified_this_month else None

    context = {
        "this_month_total": cs.this_month_total_usd,
        "all_time_total": cs.all_time_total_usd,
        "post_count": cs.post_count,
        "by_model": cs.by_model,
        "classified_this_month": classified_this_month,
        "avg_cost": avg_cost,
    }
    return templates.TemplateResponse(request, "_cost_view.html", context)
