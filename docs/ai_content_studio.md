# MindCampus — AI-Assisted Content Intelligence & Content Creation Studio Architecture

## 1. Executive Overview

The MindCampus AI Content Studio provides authorized administrators and content creators with an AI-assisted creation workspace at `/admin/ai-content`. It enables creators to draft Blogs, Podcast scripts, and Digital Stories, generate alternative titles/summaries, perform side-by-side text improvements, analyze readability and safety, and generate analytics-informed content opportunity ideas.

---

## 2. Core Architectural Principles & Workflow

```
+-----------------------------------------------------------------------+
|                       ADMIN AI CONTENT STUDIO UI                      |
|                                                                       |
|  [Tab 1: Generate]  [Tab 2: Side-by-Side]  [Tab 3: Readability/Safety]|
|  [Tab 4: Ideas]     [Tab 5: History & Send to CMS Draft]              |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                      REST API & AI STUDIO SERVICE                     |
|                                                                       |
|  - Prompt Injection Interception & Input Sanitization                 |
|  - Automated Safety Review (Medical Claim Detection)                  |
|  - AI Provider Integration & Output Structuring                       |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------+
|                    HUMAN REVIEW & ADMIN CMS WORKFLOW                  |
|                                                                       |
|  - AI Draft stored in `ai_generations` table (status='generated')     |
|  - Human Admin reviews, edits, and clicks "Send to CMS Draft"         |
|  - Article/Podcast/Story created with `publication_status = "draft"`  |
|  - Mandatory Human Review & Approval before final Publication         |
+-----------------------------------------------------------------------+
```

---

## 3. Mandatory Human Review Policy

**AUTOMATIC PUBLISHING IS STRICTLY FORBIDDEN.**
1. AI-generated content is created strictly as an administrative draft (`publication_status = "draft"`).
2. Content creators must inspect, edit, and approve drafts before changing publication status to `published`.
3. Automated content safety reviews scan output text for clinical/medical terms (e.g. *cure*, *diagnose*, *prescribe*). If detected, status is set to `needs_human_review` with explicit source verification flags.
