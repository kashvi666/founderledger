from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import transactions, categories, dashboard
from app.core.config import settings
from app.db.session import engine
from app.db import base  # noqa: F401 — imports all models so Base.metadata knows them

app = FastAPI(
    title="FounderLedger API",
    description="Financial tracking API for startups",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["Transactions"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "FounderLedger API"}
@app.get("/")
def root():
    return {"message": "FounderLedger API is running "}