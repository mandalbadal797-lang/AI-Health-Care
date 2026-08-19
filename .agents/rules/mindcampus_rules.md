# MindCampus Project Agent Rules

## Core Guidelines for AI Coding Agents

When working on the MindCampus codebase, all autonomous agents must strictly follow these instructions:

1. **Read Architectural Documentation First**: Always review the technical specifications in `docs/` before making architectural, API, or database schema modifications.
2. **Do Not Rewrite Working Functionality Unnecessarily**: Respect existing implemented code. Refactor only when explicitly required by a task.
3. **Do Not Introduce Dependencies Without Justification**: Avoid adding external libraries unless necessary and approved. Prefer standard light libraries.
4. **Never Expose Secrets**: Secret keys, JWT secrets, and AI provider API keys MUST remain in server-side environment variables (`.env`). Never put API keys in frontend code or Git repository files.
5. **Follow Folder Structure**: Adhere strictly to the defined project layout (`frontend/src/components/`, `backend/app/services/`, `database/`, `tests/`).
6. **Enforce Security Requirements**: All database calls must use ORM parameterized queries. All inputs must be validated via Pydantic/Zod. All HTML content must be sanitized.
7. **Enforce Accessibility Standards**: Target WCAG 2.2 Level AA compliance (keyboard focus rings, contrast ratios, ARIA landmarks, alt text, podcast transcripts).
8. **No Medical Diagnosis Functionality**: MindCampus is strictly an educational motivational platform. NEVER implement diagnostic, therapeutic, or medical advice features.
9. **No Automatic Publishing of AI Content**: AI-generated content MUST default to `publication_status = "draft"` requiring mandatory human review before publication.
10. **Test Before Completion**: Always run unit, integration, or build verification commands before declaring a phase or task complete.
11. **Do Not Modify Unrelated Files**: Keep edits tightly scoped to the target files requested by the task.
12. **Follow the Milestone System**: Implement features sequentially according to the 12-Phase Roadmap in `docs/development_roadmap.md`.
