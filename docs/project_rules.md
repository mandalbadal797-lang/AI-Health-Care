# MindCampus — Coding Standards & Project Rules

## 1. Naming & Formatting Conventions

### 1.1 Python (Backend)
* **Style Guide**: PEP 8 compliance enforced by `black` or `ruff`.
* **Functions & Variables**: `snake_case` (e.g. `calculate_reading_time`, `user_id`).
* **Classes & Models**: `PascalCase` (e.g. `ArticleService`, `UserModel`).
* **Constants**: `UPPER_SNAKE_CASE` (e.g. `MAX_PODCAST_DURATION_SECONDS`).
* **Type Annotations**: Mandatory type hints for all parameters and return types.

```python
# Standard Python Function Example
async def get_published_article_by_slug(
    db: AsyncSession, slug: str
) -> Optional[ArticleResponse]:
    """Fetch published article by slug with author and category joins."""
    ...
```

### 1.2 TypeScript & React (Frontend)
* **Component Files**: `PascalCase.tsx` (e.g. `ArticleCard.tsx`, `AudioPlayer.tsx`).
* **Hooks**: `camelCase.ts` prefixed with `use` (e.g. `useAudioPlayer.ts`, `useAuth.ts`).
* **Variables & Functions**: `camelCase` (e.g. `formatDuration`, `handleBookmarkToggle`).
* **Interfaces & Types**: `PascalCase` (e.g. `ArticleDTO`, `UserRole`). No `I` prefixes.
* **Strict Type Safety**: TypeScript `strict: true`. Avoid `any` type at all costs.

```typescript
// Standard Component Example
interface ArticleCardProps {
  article: ArticleDTO;
  onBookmarkToggle?: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onBookmarkToggle }) => {
  ...
};
```

### 1.3 Database & REST API Rules
* **Database Tables**: Plural `snake_case` (e.g. `users`, `article_tags`, `ai_interactions`).
* **Database Columns**: Singular `snake_case` (e.g. `created_at`, `publication_status`).
* **REST Endpoints**: Plural nouns, kebab-case (e.g. `GET /api/v1/article-tags`).

---

## 2. Mandatory AI Development Commandments

1. **API Key Isolation**: AI provider API keys MUST remain strictly on the backend inside environment variables. Never expose keys in frontend code or Git repositories.
2. **No Automatic Publishing**: AI-generated mental health or motivational articles MUST default to `publication_status = "draft"`. Automatic publishing is strictly forbidden.
3. **Mandatory Human Review**: Every AI-generated draft requires explicit human review, editing, and approval before public release.
4. **No Medical Diagnosis**: AI MUST NOT perform psychiatric evaluations, diagnose conditions, or prescribe treatments.
5. **No Fake Credentials**: AI MUST NOT pretend to be a doctor, licensed therapist, or medical professional.
6. **Supportive Scope**: AI interactions must clearly remain general, educational, and supportive.
7. **Output Validation**: All AI responses must be validated for schema compliance and sanitized before display.
8. **Graceful Fallbacks**: AI service failures (API timeouts, rate limits) MUST trigger graceful static fallbacks without crashing the application.
9. **Data Minimization**: AI interaction logs must strip personally identifiable health information.
10. **Zero Clinical Claims**: Platform documentation and UI elements must maintain clear disclaimer notices.

---

## 3. Antigravity Agent Execution Guidelines

* **Read Specifications First**: Autonomous coding agents must inspect `docs/` before making architectural modifications.
* **Preserve Working Code**: Refactor thoughtfully without destroying tested features.
* **Follow Folder Structure**: Place files strictly in designated directories (`frontend/src/components/`, `backend/app/services/`, etc.).
* **Test Before Completion**: Never declare a task complete without running relevant unit/integration tests or build verification commands.
