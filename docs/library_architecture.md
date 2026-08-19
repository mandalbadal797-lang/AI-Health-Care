# MindCampus — Student Personal Library & Progress Architecture

## 1. Executive Overview

The MindCampus Student Personal Library & Progress System provides a centralized personal hub for college students at `/library`. It enables students to save articles, podcasts, and digital stories, track reading and audio playback progress, resume unfinished content, view recently accessed resources, and review completed learning achievements.

---

## 2. Core Architectural Models

```
+-----------------------------------------------------------------------+
|                         STUDENT PERSONAL LIBRARY                      |
|                                                                       |
|  +-------------------+   +--------------------+   +----------------+  |
|  |  Saved Resources  |   | Continue Learning  |   | RecentlyViewed |  |
|  |  (saved_contents) |   | (content_progress) |   | (max 20 items) |  |
|  +---------+---------+   +---------+----------+   +-------+--------+  |
+------------|-----------------------|----------------------|-----------+
             |                       |                      |
             v                       v                      v
+-----------------------------------------------------------------------+
|                         LIBRARY REST API LAYER                        |
|                                                                       |
|  GET /api/v1/library               POST /api/v1/library               |
|  DELETE /api/v1/library/{id}       GET /api/v1/library/progress       |
|  PUT /api/v1/library/progress/{id} POST /api/v1/library/recently-viewed|
+----------------------------------- +----------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------+
|                       DATABASE PERSISTENCE (SQLite)                   |
|                                                                       |
|  - SavedContent (user_id, content_id, content_type) [UQ]             |
|  - ContentProgress (user_id, content_id, progress_percent, pos, dur)  |
|  - RecentlyViewed (user_id, content_id, viewed_at) [Capped at 20]     |
+-----------------------------------------------------------------------+
```

---

## 3. Database Schema Models

1. **`SavedContent`**:
   - `user_id` (UUID, FK -> `users.id`)
   - `content_id` (String, article/podcast/story UUID string)
   - `content_type` (String: `article`, `podcast`, `story`)
   - `saved_at` (UTC Datetime)
   - Constraint: `UniqueConstraint("user_id", "content_id", "content_type")`

2. **`ContentProgress`**:
   - `user_id` (UUID, FK -> `users.id`)
   - `content_id` (String)
   - `content_type` (String: `article`, `podcast`, `story`)
   - `progress_percent` (Float: 0.0 to 100.0)
   - `position_seconds` (Float: audio playback position)
   - `duration_seconds` (Float: total audio duration)
   - `is_completed` (Boolean: `True` if progress $\ge 90.0\%$)
   - `last_accessed_at` (UTC Datetime)
   - `completed_at` (Optional UTC Datetime)
   - Constraint: `UniqueConstraint("user_id", "content_id", "content_type")`

3. **`RecentlyViewed`**:
   - `user_id` (UUID, FK -> `users.id`)
   - `content_id` (String)
   - `content_type` (String)
   - `viewed_at` (UTC Datetime)
   - Constraint: `UniqueConstraint("user_id", "content_id", "content_type")`

---

## 4. Progress Tracking & Completion Logic

- **Progress Range**: Validated between $0.0\%$ and $100.0\%$. Negative values or values $> 100$ are rejected with HTTP 400.
- **Completion Threshold**: Content reaching $\ge 90.0\%$ progress is automatically marked `is_completed = True` and receives a timestamp `completed_at`.
- **Resume Playback**: For podcast episodes, `position_seconds` is recorded during playback and restored when opening the episode player.

---

## 5. Security & Privacy Safeguards

1. **Strict User Scoping & IDOR Prevention**: All library query operations derive user identity directly from the authenticated JWT session (`current_user.id`). Request bodies and parameters cannot override user ownership.
2. **Draft Content Isolation**: When rendering saved items or progress lists, content details are joined against published records (`publication_status == "published"`). Admin-unpublished content is cleanly omitted.
3. **Zero Mental Health Inference**: Library save events and progress timestamps are strictly personal organization tools and are never analyzed to infer psychological conditions or diagnostic labels.
