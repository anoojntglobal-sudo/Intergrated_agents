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

from fastapi import APIRouter, Depends, Query

from agents.brand_visibility.x.db import Database

router = APIRouter()


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
