from sqlalchemy import Column, Integer, String, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base


class CategoryType(str, enum.Enum):
    income = "income"
    expense = "expense"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    type = Column(SAEnum(CategoryType), nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)

    # One category → many transactions
    transactions = relationship("Transaction", back_populates="category")

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name!r} type={self.type}>"
