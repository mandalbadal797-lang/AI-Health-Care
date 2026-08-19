# MindCampus — Student Personalization & Engagement Architecture

## 1. Executive Summary

The MindCampus Student Personalization & Engagement System provides student-controlled resource bookmarking, reading/listening progress tracking, recently viewed history, topic interest selection, and deterministic content recommendations across Blogs, Podcasts, and Digital Stories.

---

## 2. Architecture & Storage Model (Case B — Local Storage)

Since user authentication is scheduled for Phase 10, personalization is implemented using a versioned, safe local browser storage abstraction (`personalizationStorage` under key `mindcampus_personalization_v1`):

```
Personalization Engine
  ├── personalizationStorage.ts (Versioned JSON Storage Abstraction)
  │     ├── Bookmarks (Blog, Podcast, Story)
  │     ├── Recently Viewed (Max 20 items with timestamp)
  │     ├── Progress Tracking (Percentage & Completion status)
  │     └── Selected Topic Interests
  │
  └── recommendationEngine.ts (Deterministic Scoring Model)
        ├── Interest Match: +5
        ├── Saved Category Match: +3
        ├── Freshness: +1
        ├── Already Saved: -5
        └── Already Viewed: -2
```

---

## 3. Core Personalization Features

### 3.1 Bookmarks & Saved Library (`/saved` & `/bookmarks`)
* **Bookmark Button** ([`BookmarkButton.tsx`](file:///c:/Users/VICTUS/Documents/AI%20Health%20Care/frontend/src/components/buttons/BookmarkButton.tsx)): Reusable component with accessible ARIA toggle state. Saves articles, podcasts, and digital stories.
* **Saved Library** ([`SavedLibraryPage.tsx`](file:///c:/Users/VICTUS/Documents/AI%20Health%20Care/frontend/src/pages/SavedLibraryPage.tsx)): Allows filtering by content format (`All`, `Blogs`, `Podcasts`, `Stories`), sorting (`Recently Saved`, `Oldest Saved`, `Alphabetical`), and individual/bulk resource deletion.

### 3.2 Reading & Listening Progress (`ContentProgress.tsx`)
* Automatically tracks reading position and audio playback progress.
* Marks content as `Completed` when progress reaches >= 90%.
* Renders `<ContinueSection />` on the homepage when incomplete progress exists.

### 3.3 Topic Preferences & Data Controls (`/preferences`)
* Interactive interest selection grid (e.g. `Academic Stress`, `Failure & Resilience`, `Study Habits`, `Confidence`, `Mental Wellness`, `College Life`, `Career Stress`, `Self-Care`).
* Clear & Reset Controls: Allows students to clear bookmarks, recent history, progress, or execute a total data reset via confirmation modal.

---

## 4. Privacy Principles

1. **No Psychological Profiling**: Personalization reflects **explicit content preferences**, not mental health diagnoses or psychological assumptions.
2. **Local Control & Zero Exfiltration**: Browsing history and saved items remain in local browser storage and are **NOT** transmitted to external AI LLM providers or backend servers.
3. **Transparent Explanations**: Recommendations display clear badges explaining why content was suggested (e.g. *"Because you selected Failure & Resilience"*).
