# MindCampus — Podcast Platform Architecture & Specification

## 1. Executive Summary

The Podcast Platform provides database-backed audio episodes, student resilience narratives, campus counselor discussions, and structured transcripts for college students.

---

## 2. Database Schema (`podcasts`)

* **`podcasts`**: Audio episode metadata (`id` UUID, `title`, `slug` unique indexed, `description`, `audio_url`, `thumbnail_url`, `duration_seconds`, `episode_number`, `category_id` FK -> categories.id, `transcript`, `publication_status` ['draft', 'published', 'archived'], `created_at`).

---

## 3. Backend Architecture & Published-Only Privacy

The Podcast module follows a clean four-tier architecture:

```
Router (FastAPI /api/v1/podcasts)
  ↓
Service Layer (PodcastService)
  ↓
Repository Layer (PodcastRepository)
  ↓
Database Layer (SQLAlchemy ORM + SQLite / PostgreSQL)
```

Public API endpoints enforce `publication_status == 'published'` at the repository query level. Draft episodes are strictly isolated and return HTTP 404 Not Found if queried directly.

---

## 4. Audio Engine & Global Player Architecture

```
HTML5 <audio> Element (Managed by AudioPlayerProvider)
  ↓
AudioPlayerContext (Exposes playEpisode, togglePlay, seek, changeVolume, toggleMute)
  ↓
GlobalPodcastPlayer (Fixed bottom sticky UI with progress scrubber & keyboard controls)
```

### Key Player Features
* **Single Active Audio Stream**: Enforces that starting a new podcast episode automatically pauses any currently playing episode.
* **HTML5 Native Events**: Listens to `loadedmetadata`, `timeupdate`, `ended`, `error`, `waiting`, and `canplay`.
* **Keyboard Accessible**: Scrubber slider `<input type="range">`, skip buttons (+10s / -10s), and screen-reader aria labels (`Play podcast episode`, `Mute volume`).

---

## 5. API Endpoints Reference

### 5.1 `GET /api/v1/podcasts`
* **Query Parameters**: `page` (default 1), `limit` (default 10), `category` (category slug filter), `search` (keyword search).
* **Response**:
```json
{
  "items": [
    {
      "id": "7b8e91a0-1234-4567-8901-abcdef123456",
      "title": "Navigating Midterm Anxiety & Resetting Your Mindset",
      "slug": "navigating-midterm-anxiety-resetting-mindset",
      "description": "In this opening episode...",
      "audio_url": "https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg",
      "duration_seconds": 860,
      "duration_formatted": "14:20",
      "episode_number": 1,
      "category_id": 2,
      "category_name": "Academic Stress",
      "category_slug": "academic-stress",
      "publication_status": "published",
      "created_at": "2026-08-18T11:00:00Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 10,
  "total_pages": 1
}
```

### 5.2 `GET /api/v1/podcasts/{slug}`
* **Path Parameters**: `slug` (string).
* **Response**: Returns full episode metadata, audio URL, full audio `transcript`, category object, and 3 `related_podcasts`.
