from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional

from app.db.session import get_db
from app.schemas.dashboard import DashboardSummary
from app.services import dashboard_service

router = APIRouter()


@router.get("", response_model=DashboardSummary, summary="Get dashboard summary")
def get_dashboard(
    date_from: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    granularity: str = Query("monthly", description="Time series granularity: 'weekly' or 'monthly'"),
    db: Session = Depends(get_db),
):
    return dashboard_service.get_summary(
        db,
        date_from=date_from,
        date_to=date_to,
        granularity=granularity,
    )
