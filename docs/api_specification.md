# MindCampus — REST API Specification

## 1. REST API Conventions

* **Base URL**: `/api/v1`
* **Content Type**: `application/json` (unless uploading media via `multipart/form-data`)
* **Authentication**: HTTP Bearer Header (`Authorization: Bearer <JWT_TOKEN>`)

---

## 12. Admin Analytics & Intelligent Content Insights Endpoints

### 12.1 Overview KPI Metrics
* **Route**: `GET /api/v1/admin/analytics/overview`
* **Auth Required**: Yes (Admin only - Student token returns `403 Forbidden`)

---

## 13. Admin AI Content Studio Endpoints

### 13.1 Generate Content Draft
* **Route**: `POST /api/v1/admin/ai/content/generate`
* **Auth Required**: Yes (Admin only)

---

## 14. Content Moderation & Approval Endpoints

### 14.1 Get Moderation Queue
* **Route**: `GET /api/v1/admin/moderation`
* **Auth Required**: Yes (Admin only)

---

## 15. Student Community & Discussion Endpoints

### 15.1 Get Published Content Comments
* **Route**: `GET /api/v1/community/content/{content_id}/comments`
* **Auth Required**: Optional
* **Query Parameters**: `type` (`article`, `podcast`, `story`)
* **Response `200 OK`**: Approved top-level comments and 2-level nested replies with author display names and helpful counts.

### 15.2 Create Comment or Reply
* **Route**: `POST /api/v1/community/content/{content_id}/comments`
* **Auth Required**: Yes (Student or Admin)
* **Request Body**: `{"content_type": "article", "body": "Great tips!", "parent_comment_id": "uuid-optional"}`
* **Response `201 Created`**: Creates comment or reply (enforces max 2-level reply depth).

### 15.3 Edit Own Comment
* **Route**: `PATCH /api/v1/community/comments/{comment_id}`
* **Auth Required**: Yes (Student - IDOR Protected)
* **Request Body**: `{"body": "Updated comment text."}`

### 15.4 Soft Delete Own Comment
* **Route**: `DELETE /api/v1/community/comments/{comment_id}`
* **Auth Required**: Yes (Student - IDOR Protected)

### 15.5 Toggle Helpful Reaction
* **Route**: `POST /api/v1/community/comments/{comment_id}/helpful`
* **Auth Required**: Yes (Student)
* **Response `200 OK`**: `{"is_helpful": true, "helpful_count": 5}`

### 15.6 Submit Community Report
* **Route**: `POST /api/v1/community/reports`
* **Auth Required**: Yes (Student)
* **Request Body**: `{"target_type": "comment", "target_id": "comment-uuid", "reason": "inappropriate", "description": "Details"}`
* **Response `201 Created`**: Submits report for administrative moderation review. Deduplicates active reports.
