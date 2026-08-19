# MindCampus — Database Schema & Entity Relationship Model

## 1. Relational Database Overview

MindCampus uses a highly normalized relational database design. It supports PostgreSQL 16 for production and SQLite for local development. Data access is managed asynchronously via **SQLAlchemy 2.0 ORM** with **Alembic** handling database migrations.

---

## 7. Personal Library & Progress Tables

### 7.1 Table `saved_contents`
Stores student saved bookmarks across articles, podcasts, and digital stories.

---

## 8. Content Feedback & Quality Tables

### 8.1 Table `content_feedback`
Stores student helpfulness feedback, 1-5 star ratings, quick feedback tags, written comments, and administrative moderation states.

---

## 9. Admin Analytics Query Optimization & Aggregations

Analytics queries execute database-level SQL aggregations (`COUNT`, `COUNT(DISTINCT user_id)`, `SUM`, `AVG`) without loading raw event records into application memory.

---

## 10. AI Draft History Table `ai_generations`

Stores AI-generated content drafts, side-by-side revisions, analysis results, and CMS conversion states.

---

## 11. Content Moderation Tables

### 11.1 Table `content_reviews`
Stores moderation review lifecycle, priority, origin (`is_ai_generated`), and human decisions.

---

## 12. Student Community & Discussion Tables

### 12.1 Table `comments`
Stores student comments and 2-level replies on published resources.

| Column | Data Type | Nullable | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | UUID | No | Primary Key | Comment identifier |
| `content_id` | VARCHAR(100) | No | Index | Target content resource ID |
| `content_type` | VARCHAR(30) | No | Index | `'article'`, `'podcast'`, `'story'` |
| `user_id` | UUID | No | Foreign Key (`users.id`), Index | Author user ID |
| `parent_comment_id` | UUID | Yes | Foreign Key (`comments.id`), Index | Parent comment link (2-level limit) |
| `body` | TEXT | No | None | Comment body text |
| `status` | VARCHAR(20) | No | Default 'approved', Index | `'approved'`, `'pending'`, `'hidden'`, `'rejected'`, `'deleted'` |
| `helpful_count` | INT | No | Default 0 | Helpful reaction count |
| `is_edited` | BOOL | No | Default False | Edited indicator |
| `created_at` | TIMESTAMPTZ | No | Default NOW(), Index | Creation timestamp |
| `deleted_at` | TIMESTAMPTZ | Yes | None | Soft deletion timestamp |

### 12.2 Table `comment_helpfuls`
Stores helpful reactions on comments (`user_id + comment_id` unique constraint).

### 12.3 Table `community_reports`
Stores reports submitted for comments or content resources.
