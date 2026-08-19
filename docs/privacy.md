# MindCampus — Privacy Policy & Data Minimization Specification

## 1. Core Privacy Guarantees

MindCampus is designed with a **privacy-first, non-clinical architecture**. Personalization and AI interaction operate under strict data minimization principles:

1. **Zero Psychological Profiling**: MindCampus does **NOT** infer mental health conditions, assign diagnostic labels (e.g. "anxious student"), or track psychological health states. Personalization reflects only explicit user-selected content topics (e.g. "Study Habits").
2. **Local Storage First**: In the absence of user authentication, all bookmarks, reading progress, and interest selections remain exclusively inside the user's browser local storage (`mindcampus_personalization_v1`).
3. **No Browsing History Exfiltration**: Personal reading history is **NEVER** sent to external AI API providers (such as Gemini or OpenAI). Only non-sensitive search query strings are transmitted when explicitly requested.
4. **Student Control & Instant Deletion**: Students can clear individual bookmarks, reset topic interests, or execute a total data purge via `/preferences` at any time.

---

## 9. Community Reporter Privacy & Data Minimization

1. **Reporter Anonymity**: Student reporter IDs and description details are administrative data used for moderation inspection only. Reporter identities are strictly omitted from public APIs and reported student views.
2. **No Student Popularity Profiles**: Public student profiles, follower lists, top commenter leaderboards, and public mental-health scores do NOT exist.
3. **Comment Content Privacy**: Raw comment text is excluded from public analytics engines. Only aggregate counts (`COMMENT_CREATED`, `COMMENT_HELPFUL`) are recorded.
