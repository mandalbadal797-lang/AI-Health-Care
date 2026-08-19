# MindCampus — Blog Platform Architecture & Specification

## 1. Executive Summary

The Blog Platform is the core content delivery module of **MindCampus**, providing database-backed educational blog posts, study strategies, resilience guides, and self-care articles for college students.

---

## 2. Database Entities & ER Schema

* **`categories`**: Taxonomy topics (`id`, `name`, `slug`, `description`, `icon_name`, `created_at`).
* **`users`**: Authors and administrators (`id`, `email`, `password_hash`, `full_name`, `role`, `is_active`, `created_at`, `updated_at`).
* **`tags`**: Keyword tags (`id`, `name`, `slug`).
* **`articles`**: Blog posts (`id` UUID, `title`, `slug` unique indexed, `excerpt`, `content`, `cover_image`, `author_id` FK, `category_id` FK, `reading_time_minutes`, `publication_status` ['draft', 'pending_review', 'published', 'archived'], `is_ai_generated`, `review_notes`, `created_at`, `updated_at`).
* **`article_tags`**: Junction table for many-to-many tag relationships.

---

## 3. Backend Architecture & Clean Separation

The blog module implements a strict four-tier architecture:

```
Router (FastAPI /api/v1/articles)
  ↓
Service Layer (ArticleService, CategoryService)
  ↓
Repository Layer (ArticleRepository, CategoryRepository)
  ↓
Database Layer (SQLAlchemy ORM + SQLite / PostgreSQL)
```

### Published-Only Privacy Enforcement
Public endpoints (`GET /api/v1/articles`, `GET /api/v1/articles/{slug}`) strictly query `publication_status == 'published'`. Draft or unpublished articles are isolated at the repository level and return HTTP 404 if requested.

---

## 4. API Endpoints Reference

### 4.1 `GET /api/v1/articles`
* **Query Parameters**: `page` (default 1), `limit` (default 10, max 50), `category` (category slug filter), `search` (keyword filter).
* **Response**:
```json
{
  "items": [
    {
      "id": "6af3f84e-209f-4d97-86eb-87de677e5afe",
      "title": "How to Stay Calm During Exam Week",
      "slug": "how-to-stay-calm-during-exam-week",
      "excerpt": "Finals week can feel overwhelming...",
      "category_id": 3,
      "category_name": "Exam Pressure",
      "category_slug": "exam-pressure",
      "reading_time_minutes": 5,
      "author_name": "Dr. Sarah Jenkins",
      "publication_status": "published",
      "is_ai_generated": false,
      "created_at": "2026-08-19T11:20:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 12,
  "total_pages": 2
}
```

### 4.2 `GET /api/v1/articles/{slug}`
* **Path Parameters**: `slug` (string).
* **Response**: Includes full `content`, category object, author name, tags, and 3 `related_articles` from the same category.

### 4.3 `GET /api/v1/categories`
* **Response**: Returns category objects with dynamic `article_count`.

---

## 5. Frontend Discovery & Reading Experience

* **Blog Discovery Page** (`/blog`): Dynamic category filter chips, search input, prominent featured article presentation, 3-column article card grid, and pagination controls.
* **Article Detail Reader Page** (`/blog/:slug`): 720px narrow reading width, structured heading and quote renderer, non-clinical safety disclaimer banner, and related articles grid.
