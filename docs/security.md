# MindCampus — Security Architecture & Threat Model

## 1. Security Architecture Overview

Security and privacy are fundamental in MindCampus. Given that the platform deals with student wellness context, strict controls prevent unauthorized access, data leakage, API abuse, and malicious prompt injections.

---

## 2. Threat Model & Countermeasures

| Threat Vector | Severity | Risk Description | Defense Countermeasure |
| :--- | :--- | :--- | :--- |
| **SQL Injection (SQLi)** | Critical | Attacker manipulates SQL queries through search or input parameters to exfiltrate user data. | **SQLAlchemy 2.0 ORM**: All queries use parameterized statements. Raw SQL strings are strictly forbidden. |
| **Cross-Site Scripting (XSS)** | High | Attacker injects malicious JS into article content or story text executing in readers' browsers. | **Strict Output Sanitization**: React auto-escapes standard JSX. Raw HTML content is sanitized on the backend using `Bleach` before storage. |
| **Broken Authentication** | Critical | Attacker guesses weak passwords or hijacks session tokens to access student/admin accounts. | **Argon2id Hashing & JWT**: Passwords hashed with strong salt. JWT tokens expire in 24 hours with cryptographic HMAC-SHA256 signature verification. |

---

## 14. Community Security & IDOR Protections

1. **IDOR Ownership Verification**: `PATCH /api/v1/community/comments/{id}` and `DELETE /api/v1/community/comments/{id}` verify server-side that `comment.user_id == current_user.id`. Attempts by User A to edit or delete User B's comment return HTTP 403 Forbidden ([`test_edit_and_delete_comment_ownership_idor_protection`](file:///c:/Users/VICTUS/Documents/AI%20Health%20Care/backend/tests/test_community_api.py#L98-L125)).
2. **Comment Input Sanitization**: Script tags (`<script>`) and executable protocol prefixes (`javascript:`, `data:text/html`) are neutralized server-side before database storage.
3. **Published Content Restriction**: Comments can only be posted on resources with `publication_status == "published"`. Commenting on drafts returns HTTP 400.
4. **Unique Reaction Constraints**: Database-level unique constraint `uq_user_comment_helpful` prevents duplicate helpful reactions.
