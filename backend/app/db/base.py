# Import all models here so SQLAlchemy's Base.metadata is aware of them.
# This file is imported in main.py before any table creation or migration.
from app.db.base_class import Base  # noqa: F401
from app.models.category import Category  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
