# MindCampus — Digital Storytelling Platform Architecture & Specification

## 1. Executive Summary

The Digital Storytelling Platform provides database-backed narrative student stories, peer experiences, reflections, and key takeaways for college students.

---

## 2. Database Schema (`stories`)

* **`stories`**: Digital story entity (`id` UUID, `title`, `slug` unique indexed, `subtitle`, `content`, `cover_image`, `author_name`, `reading_time_minutes`, `category_id` FK -> categories.id, `reflection_question`, `key_takeaway`, `publication_status` ['draft', 'published', 'archived'], `created_at`).

---

## 3. Backend Architecture & Draft Isolation Security

The Digital Storytelling module follows a clean four-tier architecture:

```
Router (FastAPI /api/v1/stories)
  ↓
Service Layer (StoryService)
  ↓
Repository Layer (StoryRepository)
  ↓
Database Layer (SQLAlchemy ORM + SQLite / PostgreSQL)
```

Public API endpoints enforce `publication_status == 'published'` at the repository query level. Draft stories are strictly isolated and return HTTP 404 Not Found if queried directly.

---

## 4. Frontend Story Reader Experience

```
Story Landing Page (/stories)
  ├── Hero Banner & Demonstration Disclaimer
  ├── Dynamic Category Filter Chips & Keyword Search Bar
  ├── Featured Story Card Presentation
  ├── Story Card Grid (StoryCardPreview)
  └── Pagination Controls

Story Detail Reader (/stories/:slug)
  ├── Editorial Narrative Header & Metadata
  ├── Structured Chapter Reader (01 — The Beginning, 02 — What Went Wrong...)
  ├── Reflection Question Highlight Card
  ├── Key Takeaway Block
  ├── Non-Clinical Safety Disclaimer Notice
  └── Related Student Stories Grid (3 related stories)
```

---

## 5. API Endpoints Reference

### 5.1 `GET /api/v1/stories`
* **Query Parameters**: `page` (default 1), `limit` (default 10), `category` (category slug filter), `search` (keyword search).
* **Response**:
```json
{
  "items": [
    {
      "id": "e9a8f765-4321-4876-8901-abcdef654321",
      "title": "I Failed My First Midterm — And Found My Voice",
      "slug": "failed-first-midterm-found-my-voice",
      "subtitle": "How receiving an F on my first college exam forced me to change my study habits...",
      "cover_image": null,
      "author_name": "Student Story — Demonstration",
      "reading_time_minutes": 6,
      "category_id": 9,
      "category_name": "Failure & Resilience",
      "category_slug": "failure-resilience",
      "publication_status": "published",
      "created_at": "2026-08-19T10:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 10,
  "total_pages": 1
}
```

### 5.2 `GET /api/v1/stories/{slug}`
* **Path Parameters**: `slug` (string).
* **Response**: Returns full story narrative content, reflection question, key takeaway, category object, and 3 `related_stories`.
