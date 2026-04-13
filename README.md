#  FounderLedger

**FounderLedger** is a startup-focused financial tracking platform designed to help founders monitor expenses, analyze burn rate, and gain AI-powered financial insights.

Unlike traditional expense trackers, FounderLedger provides **startup-centric analytics** such as burn rate calculation and an **AI financial assistant** that answers questions using real transaction data.

---

#  Features

##  Transaction Management
- Add, delete, and view transactions
- Categorize income and expenses
- Filter by date, category, and type

## Dashboard Analytics
- Total income, expenses, and balance
- Category-wise breakdown (Pie Chart)
- Income vs Expense trends (Bar Chart)

## Burn Rate Analysis
- Monthly burn rate calculation
- Helps estimate startup runway

## AI Financial Assistant (Groq)
- Ask:
  - "Where am I overspending?"
  - "What is my burn rate?"
- Uses real transaction data for context-aware answers

## Smart Filtering
- Date presets (7 days, 30 days, etc.)
- Custom date range
- Category and type filters

---

#  Tech Stack & Justification

| Layer       | Technology | Reason |
|------------|------------|--------|
| Backend     | FastAPI    | Fast, async, auto Swagger docs |
| Database    | PostgreSQL | Reliable, relational, scalable |
| ORM         | SQLAlchemy | Clean abstraction, production-ready |
| Frontend    | React + Vite | Fast SPA development |
| Styling     | TailwindCSS | Clean and responsive UI |
| Charts      | Recharts   | Interactive data visualization |
| AI          | Groq API   | Real-time AI insights |
| DevOps      | Docker     | Easy local setup |

---

# Project Structure
founderledger/
├── backend/
├── frontend/
├── docker-compose.yml
├── .gitignore
└── README.md

---

# Setup Instructions (Run Locally)

## Prerequisites
- Docker installed
- Python 3.10+
- Node.js (v16+)

---

# Start Up

## 1. Clone Repository
git clone https://github.com/kashvi666/founderledger.git
cd founderledger

## 2. Start Database (PostgreSQL via Docker)
docker-compose up db -d

## 3. Backend Setup
cd backend
pip install -r requirements.txt

## Copy environment file
copy .env.example .env

## Seed database
python scripts/seed.py

## Start API server
uvicorn app.main:app --reload

Backend runs at:
http://127.0.0.1:8000

 Swagger Docs:
http://127.0.0.1:8000/docs

## 4. Frontend Setup
1. cd ../frontend
2. npm install
3. npm run dev

Frontend runs at:
http://localhost:5173

## Environment Variables
1. Create .env file in /backend:
2. DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/founderledger
3. ALLOWED_ORIGINS=["http://localhost:5173"]
4. GROQ_API_KEY=your_api_key_here

# Database Schema
| Field | Type    | Description      |
| ----- | ------- | ---------------- |
| id    | Integer | Primary key      |
| name  | String  | Category name    |
| type  | String  | income / expense |

# Transactions Table
| Field       | Type     | Description          |
| ----------- | -------- | -------------------- |
| id          | Integer  | Primary key          |
| amount      | Float    | Transaction amount   |
| category_id | Integer  | Foreign key          |
| type        | String   | income / expense     |
| note        | String   | Optional description |
| created_at  | DateTime | Timestamp            |

# Design Decisions
1. Normalized schema with separate category table
2. Foreign key ensures data integrity
3. Indexed timestamps for fast filtering
4. Backend handles validation (amount > 0, valid type)
#  API Endpoints
## Transactions
```
GET /transactions
Fetch all transactions
POST /transactions
Request:
{
  "amount": 500,
  "category_id": 1,
  "type": "expense",
  "note": "AWS bill"
}
Response:
{
  "id": 1,
  "amount": 500,
  "type": "expense"
}
DELETE /transactions/{id}
Deletes a transaction
```
## Categories
```
GET /categories
Fetch all categories
POST /categories
Create new category
```

## Dashboard
```
GET /dashboard
Returns:
Total income
Total expenses
Burn rate
Time-series data
```

## Health
```
GET /health
{
  "status": "ok"
}
```
# AI Feature
The AI assistant:
1. Uses Groq API
2. Reads transaction data
3. Generates financial insights in natural language

# UI Overview
1. Dashboard with charts
2. Transactions table
3. Category manager
4. AI Chat interface

# Known Limitations
1. No authentication (single-user system)
2. CSV import not implemented (planned)
AI responses depend on API quality
3. No deployment (runs locally)
   
# Future Improvements
1. Add JWT authentication
2. Multi-user support
3. CSV upload & auto categorization
4. Deploy on AWS / Render
5. Improve AI recommendations
   
# Security Note
.env is NOT committed
.env.example provided for setup

# Author
Kashvi Ruhela
B.Tech – Full Stack Development

# Final Note
This project demonstrates:
1. Full-stack development
2. REST API design
3. Database modeling
4. AI integration
5. Real-world debugging and system design
