# MindCampus — Student Feedback & Content Quality Architecture

## 1. Architectural Principles

The Student Feedback, Content Rating, and Content Quality Improvement System provides a privacy-first, non-intrusive feedback loop for college students consuming wellness blogs, podcasts, and digital stories.

```
+-----------------------------------------------------------------------+
|                       STUDENT CONTENT FEEDBACK                        |
|                                                                       |
|  +--------------------+   +-------------------+   +----------------+  |
|  | Was it helpful?    |   | Optional Rating   |   | Quick Tags &   |  |
|  | (👍 Yes / 👎 No)   |   | (1 - 5 Stars)     |   | Private Comment|  |
|  +---------+----------+   +---------+---------+   +-------+--------+  |
+------------|------------------------|---------------------|-----------+
             |                        |                     |
             v                        v                     v
+-----------------------------------------------------------------------+
|                        FEEDBACK REST API LAYER                        |
|                                                                       |
|  POST /api/v1/content/{id}/feedback     GET /api/v1/content/{id}/summary|
|  GET /api/v1/content/{id}/feedback/me   DELETE /api/v1/content/{id}/me |
|  GET /api/v1/admin/feedback             PATCH /api/v1/admin/feedback/mod|
+----------------------------------- +----------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------+
|                       PERSISTENCE & MODERATION (SQLite)               |
|                                                                       |
|  - ContentFeedback (user_id, content_id, content_type, is_helpful)    |
|  - Operational AI Classifier (Positive, Suggestion, Technical, etc.)  |
|  - Admin Moderation Queue (pending, approved, rejected, flagged)      |
+-----------------------------------------------------------------------+
```

---

## 2. Core Models & Constraints

1. **`ContentFeedback`**:
   - `user_id` (UUID, FK -> `users.id` ON DELETE CASCADE)
   - `content_id` (String: Article, Podcast, or Story ID)
   - `content_type` (String: `article`, `podcast`, `story`)
   - `is_helpful` (Boolean: True for YES, False for NO)
   - `rating` (Integer: 1 to 5, Nullable)
   - `category_tags` (JSON: Array of content tags e.g. `["Easy to understand", "Practical"]`)
   - `comment` (Text: Optional written feedback, max 1000 characters)
   - `ai_category` (String: `Positive`, `Suggestion`, `Technical Issue`, `Content Issue`, `General`)
   - `moderation_status` (String: `pending`, `approved`, `rejected`, `flagged`)
   - Constraint: `UniqueConstraint("user_id", "content_id", "content_type", name="uq_user_content_feedback")`

---

## 3. Helpful Rate & Quality Calculation Formulae

$$\text{Helpful Rate (\%)} = \frac{\text{helpful\_yes\_count}}{\text{helpful\_yes\_count} + \text{helpful\_no\_count}} \times 100$$

$$\text{Average Rating} = \frac{\sum_{i=1}^{N} \text{rating}_i}{N} \quad (1 \le \text{rating} \le 5)$$

---

## 4. Privacy & Safety Guardrails

- **Zero Mental-Health Diagnostic Profiling**: Written feedback is categorized strictly into operational content quality buckets (*Positive*, *Suggestion*, *Technical Issue*, *Content Issue*). It is NEVER analyzed to infer anxiety, depression, or psychological health conditions.
- **Private Written Feedback**: Student written comments remain strictly private to authorized platform administrators and are not published on public pages.
- **User-Controlled Deletion**: Students can modify or delete their feedback at any time via `/content/{id}/feedback/me`.
