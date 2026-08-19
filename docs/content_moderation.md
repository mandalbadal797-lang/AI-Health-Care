# MindCampus — Content Moderation, Safety Review & Human Approval Architecture

## 1. Executive Overview

The MindCampus Content Moderation System guarantees that every Blog article, Podcast episode, and Digital Story undergoes a mandatory human review and automated safety evaluation before being published to students.

---

## 2. Moderation Lifecycle & State Machine

```
+-------------------+
|       DRAFT       |
+---------+---------+
          |
          v (Submit for Review)
+-------------------+
| SUBMITTED_REVIEW  |
+---------+---------+
          |
          v (Automated Safety Check)
+-------------------+
|   UNDER_REVIEW    |
+---------+---------+
          |
          +-----------------------+-----------------------+
          | (Human Decision)      | (Human Decision)      | (Human Decision)
          v                       v                       v
+-------------------+   +-------------------+   +-------------------+
|     APPROVED      |   | CHANGES_REQUESTED |   |     REJECTED      |
+---------+---------+   +---------+---------+   +-------------------+
          |                       |
          v (Publish API)         v (Resubmitted)
+-------------------+   +-------------------+
|     PUBLISHED     |   |       DRAFT       |
+-------------------+   +-------------------+
```

---

## 3. Server-Side Publish Protection

**AUTOMATED OR UNAPPROVED PUBLISHING IS STRICTLY IMPOSSIBLE.**
1. Endpoint `POST /api/v1/admin/moderation/{content_id}/publish` verifies that `ContentReview.status == "approved"`.
2. Attempts to publish content in `draft`, `under_review`, `changes_requested`, or `rejected` state return HTTP 400 Bad Request with `"Publishing denied: Content must have an approved moderation status before publication."`
3. Verified via Pytest (`test_publish_unapproved_content_blocked`).
