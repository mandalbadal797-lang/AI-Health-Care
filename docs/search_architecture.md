# MindCampus — Search, Content Discovery & Advanced Navigation Architecture

## 1. Executive Overview

The MindCampus Search and Discovery System delivers unified, multi-format content retrieval across published articles, podcasts, and digital stories. It combines database-backed text search with deterministic relevance scoring, autocomplete suggestions, topic taxonomy browsing, and AI-assisted natural language query translation.

---

## 2. Core Architectural Components

```
+-----------------------------------------------------------------------+
|                         SEARCH UI & NAVIGATION                        |
|                                                                       |
|  +---------------------+   +---------------------+   +-------------+  |
|  |  GlobalSearchBar    |   |     SearchPage      |   |  Categories |  |
|  | (Debounced 250ms)   |   |   (/search?q=...)   |   | (/categories)|  |
|  +----------+----------+   +----------+----------+   +------+------+  |
+-------------|-------------------------|---------------------|---------+
              |                         |                     |
              v                         v                     v
+-----------------------------------------------------------------------+
|                          BACKEND SEARCH REST API                      |
|                                                                       |
|  GET /api/v1/search                 GET /api/v1/search/suggestions    |
|  GET /api/v1/search/related         POST /api/v1/search/ai-translate  |
+----------------------------------- +----------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------+
|                         SEARCH SERVICE & ENGINE                       |
|                                                                       |
|  - Draft Isolation (publication_status == 'published')                |
|  - Deterministic Relevance Scoring Algorithm                          |
|  - Eager Relation Loading (joinedload(category), joinedload(author))  |
|  - Pagination & Multi-Sort Engine                                     |
+-----------------------------------------------------------------------+
```

---

## 3. Deterministic Relevance Scoring Algorithm

Each search candidate item (Article, Podcast, Story) receives a relevance score based on query terms:

$$\text{Score} = \sum_{t \in \text{terms}} \left( 10 \cdot \mathbb{I}_{\text{title}}(t) + 5 \cdot \mathbb{I}_{\text{title\_start}}(t) + 4 \cdot \mathbb{I}_{\text{category}}(t) + 3 \cdot \mathbb{I}_{\text{excerpt}}(t) + 1 \cdot \mathbb{I}_{\text{content}}(t) \right)$$

- **Title Match**: +10 points (Starts with term: +5 bonus)
- **Category Match**: +4 points
- **Excerpt/Description Match**: +3 points
- **Body Content Match**: +1 point

---

## 4. Sorting & Pagination Modes

- `relevance` (Default): Ranked by score (DESC), then creation date (DESC).
- `newest`: Ordered by creation timestamp (DESC).
- `oldest`: Ordered by creation timestamp (ASC).
- `alphabetical`: Ordered by title string (ASC).
- **Pagination**: Server-side `page` (default 1) and `limit` (default 10, max 50).

---

## 5. Security & Public Content Isolation

1. **Draft & Archived Isolation**: All search queries strictly filter `publication_status == "published"`. Draft, unapproved, or rejected items are strictly excluded.
2. **Input Validation**: Search queries are capped at 200 characters to prevent SQL payload or resource exhaustion attacks.
3. **SQL Injection Protection**: All queries utilize parameterized SQLAlchemy ORM statements.
