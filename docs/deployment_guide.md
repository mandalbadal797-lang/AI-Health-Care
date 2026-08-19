# MindCampus — Deployment Guide (Render.com)

This guide provides step-by-step instructions to deploy both the **MindCampus Backend API** (FastAPI) and **Frontend Web Application** (React + Vite) for free on [Render](https://render.com).

---

## Method 1: Render Blueprint Deployment (Recommended — 1-Click)

The repository includes a pre-configured `render.yaml` Blueprint file.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right corner and select **Blueprint**.
3. Connect your GitHub repository: `mandalbadal797-lang/AI-Health-Care`.
4. Render will automatically detect `render.yaml` and configure:
   - **`mindcampus-backend`** (Python Web Service)
   - **`mindcampus-frontend`** (Static Site)
5. Click **Apply**. Render will automatically build, deploy, and issue free SSL/TLS HTTPS certificates for both services.

---

## Method 2: Manual Web Service Setup on Render

If you prefer setting up services individually:

### 1. Deploy Backend (FastAPI Web Service)
* **Type**: Web Service
* **Repository**: `https://github.com/mandalbadal797-lang/AI-Health-Care`
* **Root Directory**: `backend`
* **Runtime**: `Python 3`
* **Build Command**: `pip install -r requirements.txt`
* **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* **Environment Variables**:
  - `ENVIRONMENT`: `production`
  - `SECRET_KEY`: `<Generate a random string>`
  - `ALGORITHM`: `HS256`
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
  - `DATABASE_URL`: `sqlite+aiosqlite:///./mindcampus_prod.db`
  - `CORS_ORIGINS`: `["https://your-frontend-name.onrender.com"]`

### 2. Deploy Frontend (Static Site)
* **Type**: Static Site
* **Repository**: `https://github.com/mandalbadal797-lang/AI-Health-Care`
* **Root Directory**: `frontend`
* **Build Command**: `npm install && npm run build`
* **Publish Directory**: `dist`
* **Redirect / Rewrite Rules**:
  - Add Rule: `/*` $\to$ `/index.html` (Action: Rewrite)
* **Environment Variables**:
  - `VITE_API_BASE_URL`: `https://your-backend-name.onrender.com/api/v1`

---

## Post-Deployment Verification

1. Access Backend Health Check: `https://your-backend-name.onrender.com/api/v1/health`
2. Access Interactive API Docs: `https://your-backend-name.onrender.com/docs`
3. Access Frontend Application: `https://your-frontend-name.onrender.com`
