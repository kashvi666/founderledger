from sqlalchemy import (
    Column, Integer, String, Numeric, Date,
    Text, ForeignKey, Enum as SAEnum, DateTime, func
)
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class TransactionType(str, enum.Enum):
    income = "income"
    expense = "expense"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    # Core financial fields
    amount = Column(Numeric(precision=12, scale=2), nullable=False)
    type = Column(SAEnum(TransactionType), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    note = Column(Text, nullable=True)

    # FK to categories — RESTRICT prevents orphan deletions silently
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    category = relationship("Category", back_populates="transactions")

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} type={self.type} amount={self.amount} date={self.date}>"
