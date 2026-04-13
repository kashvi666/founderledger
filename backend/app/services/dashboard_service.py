from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from decimal import Decimal
from datetime import date
from typing import Optional

from app.models.transaction import Transaction, TransactionType
from app.models.category import Category
from app.schemas.dashboard import (
    DashboardSummary, CategoryBreakdown, TimeSeriesPoint, BurnRateStats
)


def get_summary(
    db: Session,
    *,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    granularity: str = "monthly",   # "weekly" or "monthly"
) -> DashboardSummary:

    base_query = db.query(Transaction)
    if date_from:
        base_query = base_query.filter(Transaction.date >= date_from)
    if date_to:
        base_query = base_query.filter(Transaction.date <= date_to)

    # ── Totals ────────────────────────────────────────────────────────────────
    totals = base_query.with_entities(
        func.coalesce(
            func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)),
            0,
        ).label("total_income"),
        func.coalesce(
            func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)),
            0,
        ).label("total_expenses"),
    ).one()

    total_income = Decimal(str(totals.total_income))
    total_expenses = Decimal(str(totals.total_expenses))
    net_balance = total_income - total_expenses

    # ── Burn Rate ─────────────────────────────────────────────────────────────
    # Estimate months spanned by the data to calculate average monthly burn
    date_range = base_query.with_entities(
        func.min(Transaction.date).label("min_date"),
        func.max(Transaction.date).label("max_date"),
    ).one()

    months_spanned: float = 1.0
    if date_range.min_date and date_range.max_date:
        delta_days = (date_range.max_date - date_range.min_date).days
        months_spanned = max(delta_days / 30.0, 1.0)

    monthly_burn = total_expenses / Decimal(str(months_spanned))
    runway_months = float(net_balance / monthly_burn) if monthly_burn > 0 else None

    burn_rate = BurnRateStats(
        monthly_burn=monthly_burn.quantize(Decimal("0.01")),
        total_cash=net_balance.quantize(Decimal("0.01")),
        runway_months=round(runway_months, 1) if runway_months is not None else None,
    )

    # ── Category Breakdown (expenses only) ────────────────────────────────────
    breakdown_rows = (
        base_query.filter(Transaction.type == TransactionType.expense)
        .join(Category, Transaction.category_id == Category.id)
        .with_entities(Category.name, func.sum(Transaction.amount).label("total"))
        .group_by(Category.name)
        .order_by(func.sum(Transaction.amount).desc())
        .all()
    )
    category_breakdown = [
        CategoryBreakdown(category=row.name, total=Decimal(str(row.total)))
        for row in breakdown_rows
    ]

    # ── Time Series ───────────────────────────────────────────────────────────
    if granularity == "weekly":
        period_expr = func.to_char(Transaction.date, "IYYY-IW")  # ISO year + week
    else:
        period_expr = func.to_char(Transaction.date, "YYYY-MM")

    ts_rows = (
        base_query.with_entities(
            period_expr.label("period"),
            func.coalesce(
                func.sum(case((Transaction.type == TransactionType.income, Transaction.amount), else_=0)),
                0,
            ).label("income"),
            func.coalesce(
                func.sum(case((Transaction.type == TransactionType.expense, Transaction.amount), else_=0)),
                0,
            ).label("expenses"),
        )
        .group_by("period")
        .order_by("period")
        .all()
    )
    time_series = [
        TimeSeriesPoint(
            period=row.period,
            income=Decimal(str(row.income)),
            expenses=Decimal(str(row.expenses)),
        )
        for row in ts_rows
    ]

    return DashboardSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_balance=net_balance,
        burn_rate=burn_rate,
        category_breakdown=category_breakdown,
        time_series=time_series,
    )
