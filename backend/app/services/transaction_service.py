from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from datetime import date
from typing import Optional
from fastapi import HTTPException, status

from app.models.transaction import Transaction
from app.models.category import Category
from app.schemas.transaction import TransactionCreate


def get_all(
    db: Session,
    *,
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
) -> tuple[int, list[Transaction]]:
    """Return (total_count, paginated_items) with optional filters."""
    query = db.query(Transaction).options(joinedload(Transaction.category))

    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if date_from:
        query = query.filter(Transaction.date >= date_from)
    if date_to:
        query = query.filter(Transaction.date <= date_to)

    total = query.count()
    items = query.order_by(desc(Transaction.date), desc(Transaction.id)).offset(skip).limit(limit).all()
    return total, items


def get_by_id(db: Session, transaction_id: int) -> Transaction:
    txn = (
        db.query(Transaction)
        .options(joinedload(Transaction.category))
        .filter(Transaction.id == transaction_id)
        .first()
    )
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return txn


def create(db: Session, payload: TransactionCreate) -> Transaction:
    # Validate category exists and type matches
    category = db.query(Category).filter(Category.id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category not found")
    if category.type != payload.type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' is a {category.type} category, but transaction type is {payload.type}",
        )

    txn = Transaction(**payload.model_dump())
    db.add(txn)
    db.commit()
    db.refresh(txn)

    # Reload with relationship
    return get_by_id(db, txn.id)


def delete(db: Session, transaction_id: int) -> None:
    txn = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    db.delete(txn)
    db.commit()
