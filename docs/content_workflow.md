# MindCampus — Content Lifecycle & Workflow Guide

## 1. Content Lifecycle States

| Status | Description | Allowed Next States |
| :--- | :--- | :--- |
| `draft` | Content created by author or AI Content Studio. | `submitted_for_review` |
| `submitted_for_review` | Submitted to moderation queue. Automated safety scan runs. | `under_review` |
| `under_review` | In moderation queue waiting for human reviewer inspection. | `approved`, `changes_requested`, `rejected`, `escalated` |
| `approved` | Reviewed and approved by human administrator. | `published` |
| `changes_requested` | Returned to author with reviewer notes for edits. | `draft` |
| `rejected` | Permanently rejected content. Excluded from public platform. | None |
| `published` | Published on public platform for student discovery. | `archived` |
| `archived` | Archived content no longer visible in public discovery. | `draft` |
