"""
X (KA017) API endpoints — Sub-phase X1 (reads only).

Mirrors api/routers/linkedin.py: GET endpoints under /api/x backed by the
existing X `Database`. No writes, no schedule, no prompt editing, no run-now in
this sub-phase — those land in X3/X4. Endpoints return the DB read-helper dicts
directly (FastAPI serializes), which are the single source of truth the HTML
dashboard partials also consume.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from agents.brand_visibility.x.db import Database

router = APIRouter()


class UpdatePromptRequest(BaseModel):
    """Body for POST /api/x/active-prompt. Length bounds match the DB validation;
    whitespace-only content is rejected by db.set_active_prompt (-> 422)."""
    prompt_text: str = Field(min_length=1, max_length=50_000)
    prompt_version: str = Field(min_length=1, max_length=64)


class UpdateScheduleRequest(BaseModel):
    """Body for PUT /api/x/schedule — any subset of editable sweep-config fields.
    Field-level validation (ranges, enums) lives in db.update_schedule (-> 422).
    Only fields actually sent are updated (exclude_unset)."""
    mode: Optional[str] = None
    sweep_type: Optional[str] = None
    max_pages: Optional[int] = None
    max_keywords: Optional[int] = None
    class_filter: Optional[str] = None
    since_hours: Optional[int] = None
    max_api_calls: Optional[int] = None


def get_x_db() -> Database:
    """One X Database per request. skip_schema_init=True: the X tables already
    exist in Turso, so dashboard reads never replay schema DDL (mirrors the
    LinkedIn get_db dependency)."""
    return Database(skip_schema_init=True)


@router.get("/stats")
def stats(db: Database = Depends(get_x_db)) -> dict:
    return db.kpi_stats()


@router.get("/posts")
def posts(
    db: Database = Depends(get_x_db),
    cls: Optional[list[str]] = Query(None, alias="class"),
    search: Optional[str] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("priority_then_quality"),
) -> list[dict]:
    return db.list_posts(
        class_filter=cls or None, search=search or None,
        offset=offset, limit=limit, sort_by=sort_by,
    )


@router.get("/runs")
def runs(db: Database = Depends(get_x_db), limit: int = Query(20, ge=1, le=100)) -> list[dict]:
    return db.get_recent_runs(limit=limit)


@router.get("/cost-summary")
def cost_summary(db: Database = Depends(get_x_db)) -> dict:
    return db.cost_summary()


@router.get("/active-prompt")
def active_prompt(db: Database = Depends(get_x_db)) -> dict:
    return db.get_active_prompt()


@router.post("/active-prompt")
def update_active_prompt(payload: UpdatePromptRequest, db: Database = Depends(get_x_db)) -> dict:
    """Save a new active prompt version (Sub-phase X3). Mirrors LinkedIn's
    POST /api/linkedin/active-prompt: deactivates the current active row and
    inserts a new active version. Returns the new row."""
    try:
        return db.set_active_prompt(payload.prompt_version, payload.prompt_text)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


@router.get("/schedule")
def schedule(db: Database = Depends(get_x_db)) -> dict:
    return db.get_schedule()


@router.put("/schedule")
def update_schedule(payload: UpdateScheduleRequest, db: Database = Depends(get_x_db)) -> dict:
    """Partial update of the single-row sweep config (Sub-phase X4). Config-only —
    Render Cron owns cadence. Only fields present in the body are changed."""
    fields = payload.model_dump(exclude_unset=True)
    try:
        return db.update_schedule(**fields)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
