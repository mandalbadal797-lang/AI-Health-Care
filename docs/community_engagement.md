# MindCampus — Student Engagement, Comments & Community Interaction Architecture

## 1. Executive Overview

The MindCampus Community Engagement System enables constructive discussion around published Blog articles, Podcasts, and Digital Stories. It enforces strict non-clinical boundaries, prevents social-media competition (no leaderboards or followers), and protects student privacy.

---

## 2. Conceptual Architecture & Lifecycle

```
PUBLISHED CONTENT
       |
       +---> [Helpful Reaction Toggle] (1 per user per comment)
       +---> [Save to Library] (Phase 12)
       +---> [Comment & 2-Level Reply Thread]
       |            |
       |            v
       |     [Automated Safety Scan] -> (Clinical/Script Check)
       |            |
       |            +---> APPROVED -> Rendered in CommentSection
       |            +---> PENDING  -> Queued for Moderation Review
       |
       +---> [Report Content / Comment]
                    |
                    v
             [CommunityReport Queue] (/admin/community/reports)
```

---

## 3. Core Safety Rules & Restrictions

1. **Published Content Only**: Comments can only be posted on content resources with `publication_status == "published"`. Attempts to comment on drafts return HTTP 400.
2. **2-Level Reply Depth**: Nested reply threads support a maximum depth of 2 levels (Top-Level Comment $\to$ Reply).
3. **Helpful Reaction System**: Students mark comments as **Helpful** (single reaction per user per comment, toggleable). No public student popularity scores or leaderboards exist.
4. **Reporter Anonymity**: Reporter identity is strictly hidden from reported students in all API responses.
