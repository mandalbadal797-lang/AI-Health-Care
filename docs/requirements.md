# MindCampus — Functional & Technical Requirements Specification

## 1. Executive Summary & Problem Statement

### 1.1 Problem Statement
Higher education students face severe academic pressure, anxiety, burnout, time-management challenges, and personal growth hurdles. Traditional campus counseling centers are often understaffed, overwhelmed, or stigmatized, preventing students from seeking early motivational and wellness support. Furthermore, digital content online is fragmented, unverified, or overly clinical.

### 1.2 Proposed Solution
**MindCampus** is a digital wellness and student motivation platform providing curated educational articles, audio podcasts, and visual digital stories. Powered by safe, non-clinical AI assistance, MindCampus helps students naturally discover relevant coping strategies, study habits, failure resilience stories, and wellness techniques, while empowering site administrators with AI-assisted drafting tools.

> [!IMPORTANT]
> **Scope & Safety Boundary**: MindCampus is strictly an educational, motivational, and self-care content platform. It is **NOT** a medical diagnosis system, **NOT** a clinical therapy platform, and **NOT** a substitute for professional mental health care or emergency medical services.

---

## 2. Target User Personas

### 2.1 Persona 1: Student (End User)
* **Demographics**: Undergraduate & Postgraduate students (ages 17–25).
* **Goals**: Overcome exam stress, improve focus, manage time, gain resilience from student stories, listen to motivational audio during commutes.
* **Key Tasks**:
  * Browse articles, podcasts, and digital stories by category/mood.
  * Search using natural language queries (e.g., *"I feel overwhelmed by finals"*).
  * Save favorite content to personal bookmarks.
  * Interact with a safe AI Conversational Assistant for guidance and resource discovery.
  * Receive personalized content recommendations based on mood or search history.

### 2.2 Persona 2: Administrator / Content Manager
* **Demographics**: Campus wellness leads, content creators, student advisors.
* **Goals**: Create high-quality motivational content quickly, manage content publishing, monitor student interaction metrics.
* **Key Tasks**:
  * Create, edit, publish, and archive articles, podcasts, and digital stories.
  * Manage taxonomy (categories, tags).
  * Utilize AI Content Assistant to generate initial drafts for wellness articles.
  * Review and approve AI-generated content before public release (Mandatory Human-in-the-Loop).
  * View aggregate non-sensitive platform usage analytics.

---

## 3. Core Objectives & Non-Goals

### 3.1 Primary Objectives
1. **Curated Content Delivery**: Provide multi-format wellness content (Blogs, Audio Podcasts, Digital Interactive Stories).
2. **AI-Assisted Natural Discovery**: Enable intent-based natural language search and smart content recommendations without relying solely on rigid keywords.
3. **Safe AI Engagement**: Deliver supportive, guarded conversational AI guidance adhering to strict non-clinical boundaries.
4. **Content Lifecycle Management**: Provide administrators with robust tools including AI draft generation and editorial approval workflows.

### 3.2 Secondary & Academic Objectives
1. Demonstrate clean 3-tier architecture suitable for a B.Tech Computer Science viva project.
2. Achieve high accessibility standards (WCAG 2.2 AA compliance).
3. Implement responsive, modern aesthetic UI with dark/light theme support.

### 3.3 Non-Goals (Explicitly Out of Scope)
* Clinical diagnosis or psychiatric evaluation.
* Real-time emergency crisis management or live therapy chat.
* Prescribing medical treatments or medications.
* Peer-to-peer social networking, public commenting, or chat rooms.
* Microservices, complex Kubernetes clusters, or multi-tenant enterprise architectures.

---

## 4. Requirements Matrix

| ID | Requirement Description | Type | Priority | Target Phase |
| :--- | :--- | :--- | :--- | :--- |
| **FR-001** | User can browse articles by category, tag, and publication date | Functional | High | Phase 5 |
| **FR-002** | User can view article detail page with estimated reading time | Functional | High | Phase 5 |
| **FR-003** | User can play podcast audio with full player controls (play/pause, seek, speed) | Functional | High | Phase 6 |
| **FR-004** | User can read interactive Digital Stories with visual quotes and reflections | Functional | High | Phase 7 |
| **FR-005** | User can register, login, view, and update student profile | Functional | High | Phase 8 |
| **FR-006** | Student can bookmark/unbookmark content for quick access | Functional | Medium | Phase 8 |
| **FR-007** | Admin can create, edit, delete, publish, and unpublish content | Functional | High | Phase 10 |
| **FR-008** | Admin can manage categories and tags | Functional | Medium | Phase 10 |
| **AIR-001**| System generates smart content recommendations based on student mood/intent | AI | High | Phase 9 |
| **AIR-002**| System supports natural language content search (semantic query parser) | AI | High | Phase 9 |
| **AIR-003**| System generates AI article summaries and key takeaways on-demand | AI | Medium | Phase 9 |
| **AIR-004**| Admin can generate article drafts using AI assistant with prompt guidelines | AI | High | Phase 9 |
| **AIR-005**| Student can chat with safe AI assistant for resource recommendations | AI | High | Phase 9 |
| **AIR-006**| AI system enforces strict human-in-the-loop approval before publishing | AI | High | Phase 9 |
| **NFR-001**| Initial page load under 1.5 seconds on standard broadband | Non-Functional | High | Phase 11 |
| **NFR-002**| Responsive layout supporting Mobile (360px+), Tablet, Desktop (1920px) | Non-Functional | High | Phase 3/4 |
| **NFR-003**| Database queries executed under 50ms for standard page views | Non-Functional | High | Phase 11 |
| **SEC-001**| Password hashing using Argon2id / Bcrypt | Security | High | Phase 8 |
| **SEC-002**| JWT session tokens with 24-hour expiration and secure HTTP headers | Security | High | Phase 8 |
| **SEC-003**| Strict Role-Based Access Control (RBAC: Student vs Admin) | Security | High | Phase 8 |
| **SEC-004**| Protection against SQLi, XSS, CSRF, and Prompt Injection | Security | High | Phase 11 |
| **ACC-001**| WCAG 2.2 AA compliance (min 4.5:1 contrast, keyboard navigation) | Accessibility | High | Phase 11 |
| **ACC-002**| Full transcript availability for all podcast episodes | Accessibility | High | Phase 6 |

---

## 5. Feature Priority Matrix (MVP vs. V1 vs. Future)

```
+-----------------------------------------------------------------------------------+
| MVP (Must Have - Phase 1 to 10)                                                   |
| - Core Portal Layout (Navbar, Hero, Footer, Mood Selector)                        |
| - Blog System (Browse, View, Filter by Category/Tag)                              |
| - Podcast System (Audio Player, Episode Listing, Transcripts)                     |
| - Digital Storytelling System (Sectioned Visual Stories)                          |
| - Student Authentication (Register, Login, JWT Profile)                           |
| - Bookmarks System                                                                |
| - Hybrid Content Recommendation Engine                                            |
| - Natural Language Search Parser                                                  |
| - AI Student Conversational Assistant (Guarded non-clinical)                      |
| - Admin AI Article Draft Generator (Human Review Workflow)                        |
| - Admin Management Dashboard (CRUD for Articles, Podcasts, Stories)               |
| - Mental Health Safety & Medical Disclaimer Architecture                          |
+-----------------------------------------------------------------------------------+
| V1 (Should Have - Phase 11 & 12)                                                  |
| - On-demand AI Article Summarization & Key Takeaways                              |
| - Dark / Light Mode Toggle with custom CSS variables                              |
| - Basic Analytics Dashboard (Total views, popular articles)                       |
| - Podcast speed controls (0.75x, 1x, 1.25x, 1.5x)                                 |
+-----------------------------------------------------------------------------------+
| Future (Out of Scope / Post-Project)                                             |
| - Real-time WebSockets notification system                                       |
| - Mobile Native App (React Native / Flutter)                                      |
| - Community discussion forum / User comments                                      |
| - Vector database integration (pgvector / Qdrant) for high-scale embeddings       |
+-----------------------------------------------------------------------------------+
```

---

## 6. Over-Engineering Risk Analysis & Safeguards

| Component | Potential Over-Engineering Risk | Recommended Simple Alternative | Justification |
| :--- | :--- | :--- | :--- |
| **Search Engine** | Integrating Elasticsearch / Pinecone vector DB | PostgreSQL full-text search (`tsvector`) + Weighted Keyword/Intent matching | Eliminates third-party infrastructure overhead; fast and sufficient for academic demo scale. |
| **Architecture** | Microservices with Kafka event streaming | Clean Modular Monolith (FastAPI + SQLAlchemy + React) | Simplifies deployment, debugging, and academic viva explanation. |
| **AI Integration** | Fine-tuning custom LLM models on GPU servers | Standard API calls (Gemini API / OpenAI API) with system prompt engineering | Cost-effective, immediate reliability, zero training infrastructure required. |
| **State Management** | Redux Toolkit / Zustand with complex saga middleware | React Context + TanStack Query (React Query) | Eliminates boilerplate while managing async server state cleanly. |
