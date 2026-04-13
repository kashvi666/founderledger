from pydantic import BaseModel, field_validator, condecimal
from datetime import date
from decimal import Decimal
from typing import Optional
from app.models.transaction import TransactionType
from app.schemas.category import CategoryRead


class TransactionBase(BaseModel):
    amount: Decimal
    type: TransactionType
    category_id: int
    date: date
    note: Optional[str] = None


class TransactionCreate(TransactionBase):
    @field_validator("amount")
    @classmethod
    def amount_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be greater than zero")
        return v


class TransactionRead(TransactionBase):
    id: int
    category: CategoryRead

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    total: int
    items: list[TransactionRead]
