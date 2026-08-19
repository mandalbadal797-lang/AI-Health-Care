# MindCampus — AI-Assisted Student Mental Health & Motivation Content Platform

MindCampus is a student-focused digital wellness platform delivering educational blog posts, audio podcasts, and visual digital stories supported by non-clinical AI assistance.

> [!IMPORTANT]
> **Safety Boundary**: MindCampus provides educational and motivational content only. It does NOT provide medical diagnoses, psychiatric therapy, or emergency medical services.

---

## Technology Stack

* **Frontend**: React 18, Vite, TypeScript, React Router v6, Lucide Icons, Vanilla CSS (Design Tokens).
* **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, AsyncIO.
* **Database**: PostgreSQL 16 (Production) / SQLite `aiosqlite` (Local Dev), SQLAlchemy 2.0 Async ORM, Alembic.
* **AI Architecture**: Hybrid Intent & Tag Matching Engine + Server-side AI Provider Proxy (Gemini/OpenAI) + Zero-LLM Crisis Scanner.

---

## Project Structure

```text
mindcampus/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # API Routers (/api/v1/health, auth, articles, etc.)
│   │   ├── core/             # Settings, Database, Logging, Exceptions
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── schemas/          # Pydantic Request/Response DTOs
│   │   └── main.py           # FastAPI app entry point
│   ├── tests/                # Pytest unit & integration test suite
│   ├── alembic/              # Database migration scripts
│   └── requirements.txt      # Python package requirements
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/       # Common & Layout UI components
│   │   ├── context/          # Theme & Auth Context providers
│   │   ├── hooks/            # Custom hooks (useHealth, useTheme)
│   │   ├── pages/            # Verification Dashboard & Placeholder pages
│   │   ├── services/         # APIClient & HealthService
│   │   ├── styles/           # CSS Tokens, Typography, Utility styles
│   │   └── App.tsx           # React Router v6 route catalog
│   └── package.json          # Node dependencies
├── docs/                     # Technical specifications & phase reports
├── .env.example              # Environment variables template
├── .env                      # Local development environment configuration
├── .gitignore                # Git untracked pattern specification
└── README.md                 # Project documentation
```

---

## Environment Variables

Copy `.env.example` to `.env` in the root directory:

```bash
# Application Environment
APP_NAME=MindCampus API
APP_ENV=development
DEBUG=True
API_V1_STR=/api/v1

# Security & CORS
SECRET_KEY=dev_secret_key_change_in_production_9f8e7d6c5b4a321
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database Connection (SQLite local dev default)
DATABASE_URL=sqlite+aiosqlite:///./mindcampus_dev.db
```

---

## Running the Application

### 1. Backend Setup & Startup
```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run FastAPI development server with auto-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be accessible at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup & Startup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend web application will be accessible at `http://localhost:5173`.

---

## Verifying Backend & Database Health

To verify backend server operation and database connectivity:
* Open `http://127.0.0.1:8000/api/v1/health` in your browser or HTTP client.
* Expected JSON response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "app_name": "MindCampus API",
    "environment": "development",
    "version": "1.0.0",
    "database_connected": true
  },
  "meta": {}
}
```

---

## Running Automated Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

---

## Roadmap & Milestone Status

- [x] **Phase 1**: Project Planning, Architecture & Technical Specification
- [x] **Phase 2**: Project Foundation, Development Environment & Application Skeleton
- [ ] **Phase 3**: Design System & Frontend Foundation
- [ ] **Phase 4**: Homepage & Public UI
- [ ] **Phase 5**: Complete Blog System
- [ ] **Phase 6**: Podcast System
- [ ] **Phase 7**: Digital Storytelling System
- [ ] **Phase 8**: Authentication, Profiles & Bookmarks
- [ ] **Phase 9**: AI Features
- [ ] **Phase 10**: Admin Dashboard & Content Management
- [ ] **Phase 11**: Testing, Security, Accessibility & Performance
- [ ] **Phase 12**: Final Integration, Polish & Project Documentation
