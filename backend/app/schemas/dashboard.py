from pydantic import BaseModel
from decimal import Decimal
from typing import List


class CategoryBreakdown(BaseModel):
    category: str
    total: Decimal


class TimeSeriesPoint(BaseModel):
    period: str          # e.g. "2025-03" for monthly, "2025-W12" for weekly
    income: Decimal
    expenses: Decimal


class BurnRateStats(BaseModel):
    monthly_burn: Decimal       # average monthly expenses
    total_cash: Decimal         # total income - total expenses (net balance)
    runway_months: float | None # None if burn rate is 0


class DashboardSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_balance: Decimal
    burn_rate: BurnRateStats
    category_breakdown: List[CategoryBreakdown]
    time_series: List[TimeSeriesPoint]
