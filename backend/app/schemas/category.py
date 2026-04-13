from pydantic import BaseModel, field_validator
from app.models.category import CategoryType


class CategoryBase(BaseModel):
    name: str
    type: CategoryType


class CategoryCreate(CategoryBase):
    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Category name must not be blank")
        return v.strip()


class CategoryRead(CategoryBase):
    id: int
    is_default: bool

    model_config = {"from_attributes": True}
