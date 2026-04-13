from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from app.db.session import get_db
from app.schemas.transaction import TransactionCreate, TransactionRead, TransactionListResponse
from app.services import transaction_service

router = APIRouter()


@router.get("", response_model=TransactionListResponse, summary="List transactions")
def list_transactions(
    type: Optional[str] = Query(None, description="Filter by 'income' or 'expense'"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    date_from: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    total, items = transaction_service.get_all(
        db,
        type=type,
        category_id=category_id,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit,
    )
    return TransactionListResponse(total=total, items=items)


@router.post("", response_model=TransactionRead, status_code=status.HTTP_201_CREATED, summary="Create a transaction")
def create_transaction(payload: TransactionCreate, db: Session = Depends(get_db)):
    return transaction_service.create(db, payload)


@router.get("/{transaction_id}", response_model=TransactionRead, summary="Get a single transaction")
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    return transaction_service.get_by_id(db, transaction_id)


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a transaction")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction_service.delete(db, transaction_id)
