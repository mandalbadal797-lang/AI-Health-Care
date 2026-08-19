# MindCampus — Admin Architecture & Platform Control Specification

## 1. Executive Overview

The MindCampus Admin Content Management and Moderation System provides a secure, role-protected control portal for platform administrators. Authorized administrators can manage Blogs, Podcasts, Digital Stories, Categories, Content Moderation Queues, and Audit Logs without manual database manipulation or seed script execution.

---

## 2. Admin Authentication & Role-Based Access Control (RBAC)

### 2.1 Authentication Precondition
* **Backend JWT Authentication**: Admin authentication (`POST /api/v1/auth/login`) issues signed JWT access tokens containing user claims (`sub`, `email`, `role`).
* **Route Protection**:
  - Frontend: Client-side guard [`ProtectedRoute.tsx`](file:///c:/Users/VICTUS/Documents/AI%20Health%20Care/frontend/src/components/common/ProtectedRoute.tsx) redirects unauthenticated attempts to `/admin/login`.
  - Backend: `Depends(require_admin)` dependency enforces server-side JWT signature validation and verifies `role == "admin"`. Anonymous or student requests receive **401 Unauthorized** or **403 Forbidden**.

```
Admin Client Request
  └── HTTP Header: "Authorization: Bearer <jwt>"
        └── FastAPI require_admin Dependency
              ├── 1. Validate JWT signature against SECRET_KEY
              ├── 2. Extract user_uuid & verify active status in DB
              └── 3. Check role == "admin" (Raise 403 Forbidden if student)
```

---

## 3. Core Admin System Components

| Component / Portal | Route | Primary Responsibilities |
| :--- | :--- | :--- |
| **Admin Login** | `/admin/login` | Secure administrator authentication & token issue. |
| **Admin Dashboard** | `/admin` | Operational metrics (Total/Published/Draft count across Blogs, Podcasts, Stories, and Moderation queue). |
| **Blog Management** | `/admin/articles` | Search, filter, create, edit, preview, publish, unpublish, and archive blog posts. |
| **Blog Editor** | `/admin/articles/new` & `/edit` | Rich content editor with live student platform preview drawer. |
| **Podcast Management** | `/admin/podcasts` | Upload, edit, publish, and delete podcast episode metadata and audio references. |
| **Story Management** | `/admin/stories` | Create, edit, publish, and archive student digital story narratives. |
| **Moderation Queue** | `/admin/moderation` | Content safety & editorial review queue. Human approval mandatory for publication. |
| **Category Manager** | `/admin/categories` | Manage taxonomy categories across Blogs, Podcasts, and Stories. |
| **Audit Logs** | `/admin/audit-logs` | Persistent administrative activity logging (`BLOG_CREATED`, `BLOG_PUBLISHED`, etc.). |

---

## 4. Content Lifecycle & Safety Workflow

```
Draft Content (Default)
  ↓
Content Safety & Editorial Moderation Queue (/admin/moderation)
  ↓
Human Admin Approval Action
  ↓
Published State (Immediately visible on public APIs & homepage)
  ↓ (If unpublished)
Draft State (Public APIs filter out non-published items)
```

---

## 5. Audit Logging Principles

Every administrative mutation (`create`, `update`, `publish`, `unpublish`, `archive`) creates an immutable record in the `audit_logs` database table. Audit entries capture:
- `user_id`: Administrator identity.
- `action`: Standardized event code (e.g. `BLOG_PUBLISHED`).
- `content_type`: Entity category (`article`, `podcast`, `story`, `category`).
- `content_id`: Target entity UUID.
- `details`: Non-sensitive human-readable summary.
- `created_at`: UTC timestamp.
