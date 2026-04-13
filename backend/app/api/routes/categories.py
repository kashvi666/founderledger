from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryRead

router = APIRouter()


@router.get("", response_model=List[CategoryRead], summary="List all categories")
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.type, Category.name).all()


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED, summary="Create a custom category")
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    existing = db.query(Category).filter(Category.name == payload.name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A category with this name already exists")

    cat = Category(name=payload.name.strip(), type=payload.type, is_default=False)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
