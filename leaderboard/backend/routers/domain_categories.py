import os
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import DomainCategory, Leaderboard

router = APIRouter(tags=["domain-categories"])

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


def verify_admin(x_admin_password: str = Header(...)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")


def category_to_dict(cat: DomainCategory, db: Session) -> dict:
    q = db.query(Leaderboard)
    if cat.include_domains:
        q = q.filter(Leaderboard.domain.in_(cat.include_domains))
    elif cat.exclude_domains:
        q = q.filter(Leaderboard.domain.notin_(cat.exclude_domains))
    return {
        "id": cat.id,
        "slug": cat.slug,
        "name": cat.name,
        "icon": cat.icon or "📊",
        "description": cat.description,
        "include_domains": cat.include_domains or [],
        "exclude_domains": cat.exclude_domains or [],
        "display_order": cat.display_order,
        "is_builtin": bool(cat.is_builtin),
        "accent_color": cat.accent_color or "indigo",
        "leaderboard_count": q.count(),
    }


@router.get("/domain-categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(DomainCategory).order_by(DomainCategory.display_order).all()
    return [category_to_dict(c, db) for c in cats]


@router.get("/domain-categories/{slug}")
def get_category(slug: str, db: Session = Depends(get_db)):
    cat = db.query(DomainCategory).filter(DomainCategory.slug == slug).first()
    if not cat:
        raise HTTPException(404, "Domain category not found")
    return category_to_dict(cat, db)


@router.post("/admin/domain-categories")
def add_category(data: dict, db: Session = Depends(get_db), _=Depends(verify_admin)):
    slug = data.get("slug", "").strip().lower().replace(" ", "-")
    if not slug:
        raise HTTPException(400, "Slug is required")
    if db.query(DomainCategory).filter(DomainCategory.slug == slug).first():
        raise HTTPException(400, f"Slug '{slug}' already exists")
    max_order = db.query(DomainCategory).count()
    cat = DomainCategory(
        slug=slug,
        name=data.get("name", slug),
        icon=data.get("icon", "📊"),
        description=data.get("description"),
        include_domains=data.get("include_domains", []),
        exclude_domains=data.get("exclude_domains", []),
        display_order=data.get("display_order", max_order),
        accent_color=data.get("accent_color", "indigo"),
        is_builtin=0,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return category_to_dict(cat, db)


@router.put("/admin/domain-categories/{cat_id}")
def update_category(cat_id: int, data: dict, db: Session = Depends(get_db), _=Depends(verify_admin)):
    cat = db.query(DomainCategory).filter(DomainCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Not found")
    for field in ["name", "icon", "description", "include_domains", "exclude_domains", "display_order", "accent_color"]:
        if field in data:
            setattr(cat, field, data[field])
    db.commit()
    return category_to_dict(cat, db)


@router.delete("/admin/domain-categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_db), _=Depends(verify_admin)):
    cat = db.query(DomainCategory).filter(DomainCategory.id == cat_id).first()
    if not cat:
        raise HTTPException(404, "Not found")
    db.delete(cat)
    db.commit()
    return {"deleted": cat_id}
