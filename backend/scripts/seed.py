"""
Seed script — populates the DB with default categories and realistic
startup transaction data spanning the last 6 months.

Run:
    python scripts/seed.py
"""
import sys
import os
import random
from datetime import date, timedelta
from decimal import Decimal

# Allow running from the backend/ root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal, engine
from app.db import base  # registers all models with Base.metadata
from app.db.base_class import Base
from app.models.category import Category, CategoryType
from app.models.transaction import Transaction, TransactionType

# ── Default Categories ─────────────────────────────────────────────────────────

DEFAULT_EXPENSE_CATEGORIES = [
    "Technical Infrastructure",
    "APIs & Third-Party Services",
    "Marketing & Advertising",
    "Salaries & Payroll",
    "Legal & Compliance",
    "Office & Operations",
    "Miscellaneous",
]

DEFAULT_INCOME_CATEGORIES = [
    "Revenue",
    "Investment / Funding",
    "Grants",
]

# ── Seed Data Templates ────────────────────────────────────────────────────────

EXPENSE_SEEDS = [
    ("Technical Infrastructure", 180, "AWS monthly bill"),
    ("Technical Infrastructure", 45, "GitHub Teams subscription"),
    ("Technical Infrastructure", 299, "Vercel Pro plan"),
    ("APIs & Third-Party Services", 99, "Stripe fees"),
    ("APIs & Third-Party Services", 49, "SendGrid email API"),
    ("APIs & Third-Party Services", 150, "Twilio SMS credits"),
    ("Marketing & Advertising", 500, "Google Ads campaign"),
    ("Marketing & Advertising", 200, "LinkedIn Ads"),
    ("Marketing & Advertising", 120, "Canva Pro + design assets"),
    ("Salaries & Payroll", 3500, "Contractor payment - backend dev"),
    ("Salaries & Payroll", 2800, "Contractor payment - designer"),
    ("Legal & Compliance", 800, "Legal retainer"),
    ("Legal & Compliance", 250, "Annual compliance filing"),
    ("Office & Operations", 90, "Notion + Slack subscriptions"),
    ("Office & Operations", 60, "Office supplies"),
    ("Miscellaneous", 75, "Team lunch"),
    ("Miscellaneous", 30, "Domain renewal"),
]

INCOME_SEEDS = [
    ("Revenue", 2500, "Client invoice - Project Alpha"),
    ("Revenue", 4000, "Client invoice - Project Beta"),
    ("Revenue", 1200, "SaaS subscription renewals"),
    ("Investment / Funding", 25000, "Seed round tranche"),
    ("Grants", 5000, "Startup India grant"),
]


def random_date_in_last_n_months(n_months: int = 6) -> date:
    today = date.today()
    start = today - timedelta(days=n_months * 30)
    delta = (today - start).days
    return start + timedelta(days=random.randint(0, delta))


def run():
    print("Creating tables if they don't exist...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ── Categories ─────────────────────────────────────────────────────────
        if db.query(Category).count() > 0:
            print("Categories already seeded — skipping.")
        else:
            print("Seeding categories...")
            for name in DEFAULT_EXPENSE_CATEGORIES:
                db.add(Category(name=name, type=CategoryType.expense, is_default=True))
            for name in DEFAULT_INCOME_CATEGORIES:
                db.add(Category(name=name, type=CategoryType.income, is_default=True))
            db.commit()
            print(f"  ✓ {len(DEFAULT_EXPENSE_CATEGORIES)} expense + {len(DEFAULT_INCOME_CATEGORIES)} income categories")

        # ── Transactions ───────────────────────────────────────────────────────
        if db.query(Transaction).count() > 0:
            print("Transactions already seeded — skipping.")
        else:
            print("Seeding transactions...")
            cat_map = {c.name: c for c in db.query(Category).all()}

            txns_added = 0
            # Repeat each expense seed ~6 times (monthly-ish)
            for cat_name, base_amount, note in EXPENSE_SEEDS:
                for _ in range(6):
                    # Add ±15% variance so data looks realistic
                    variance = Decimal(str(random.uniform(0.85, 1.15)))
                    amount = (Decimal(str(base_amount)) * variance).quantize(Decimal("0.01"))
                    db.add(Transaction(
                        amount=amount,
                        type=TransactionType.expense,
                        category_id=cat_map[cat_name].id,
                        date=random_date_in_last_n_months(6),
                        note=note,
                    ))
                    txns_added += 1

            # Repeat each income seed ~4 times
            for cat_name, base_amount, note in INCOME_SEEDS:
                for _ in range(4):
                    variance = Decimal(str(random.uniform(0.9, 1.1)))
                    amount = (Decimal(str(base_amount)) * variance).quantize(Decimal("0.01"))
                    db.add(Transaction(
                        amount=amount,
                        type=TransactionType.income,
                        category_id=cat_map[cat_name].id,
                        date=random_date_in_last_n_months(6),
                        note=note,
                    ))
                    txns_added += 1

            db.commit()
            print(f"  ✓ {txns_added} transactions seeded")

        print("\n✅ Seed complete!")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
