# MindCampus — UI/UX & Design System Specification

## 1. Visual Style & Aesthetic Principles

MindCampus is designed to feel **calm, uplifting, modern, student-friendly, human, supportive, professional, and accessible**. It strikes a careful balance between an inviting wellness portal and a sleek academic platform.

### Design Principles
1. **Calm & Welcoming Color Palette**: Soft indigo, teal, warm amber, and glassmorphic surfaces create a serene digital environment.
2. **Modern Typography**: Clear font hierarchy using **Outfit** for headings and **Inter** for readable body text.
3. **Responsive & Alive**: Smooth micro-interactions, subtle hover elevations, and dynamic visualizer states.
4. **Accessible First**: WCAG 2.2 AA compliant contrast ratios in both Light and Dark themes.

---

## 2. Implemented Design System Tokens & CSS Variables

```css
/* MindCampus Root Design Tokens (Vanilla CSS) */
:root {
  /* Color Palette - HSL Tailored Tokens */
  --color-primary: hsl(224, 76%, 48%);
  --color-primary-hover: hsl(224, 76%, 40%);
  --color-primary-active: hsl(224, 76%, 35%);
  --color-primary-light: hsl(224, 76%, 95%);

  --color-secondary: hsl(215, 20%, 93%);
  --color-secondary-hover: hsl(215, 20%, 86%);

  --color-accent-teal: hsl(174, 72%, 40%);
  --color-accent-amber: hsl(38, 92%, 50%);
  --color-accent-rose: hsl(340, 75%, 55%);

  --color-success: hsl(145, 65%, 42%);
  --color-warning: hsl(38, 92%, 50%);
  --color-danger: hsl(355, 78%, 56%);
  --color-info: hsl(200, 85%, 48%);

  /* Light Theme Defaults */
  --bg-app: hsl(210, 40%, 98%);
  --bg-surface: hsl(0, 0%, 100%);
  --bg-surface-elevated: hsl(0, 0%, 100%);
  --bg-surface-glass: rgba(255, 255, 255, 0.85);

  --text-main: hsl(222, 47%, 11%);
  --text-secondary: hsl(215, 25%, 30%);
  --text-muted: hsl(215, 16%, 47%);
  --border-color: hsl(214, 32%, 91%);
  --focus-ring: hsl(224, 76%, 48%);

  /* Spacing Scale */
  --space-xs: 0.25rem;  /* 4px */
  --space-sm: 0.5rem;   /* 8px */
  --space-md: 1rem;     /* 16px */
  --space-lg: 1.5rem;   /* 24px */
  --space-xl: 2rem;     /* 32px */
  --space-2xl: 3rem;    /* 48px */
  --space-3xl: 4rem;    /* 64px */

  /* Elevation Shadows */
  --shadow-none: none;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.12);
  --shadow-glass: 0 8px 32px 0 rgba(31, 38, 135, 0.12);

  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Container Widths */
  --width-reading: 720px;
  --width-standard: 1200px;
  --width-wide: 1440px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Theme Overrides */
[data-theme="dark"] {
  --bg-app: hsl(222, 47%, 10%);
  --bg-surface: hsl(222, 47%, 14%);
  --bg-surface-elevated: hsl(222, 47%, 18%);
  --bg-surface-glass: rgba(22, 30, 46, 0.85);

  --text-main: hsl(210, 40%, 98%);
  --text-secondary: hsl(215, 20%, 80%);
  --text-muted: hsl(215, 20%, 65%);
  --border-color: hsl(217, 33%, 22%);
  --color-secondary: hsl(217, 33%, 20%);
  --color-secondary-hover: hsl(217, 33%, 26%);
  --color-primary-light: hsl(224, 40%, 20%);
}
```

---

## 3. Atomic Component System Categories

MindCampus components are organized into 10 modular categories:

1. **Buttons & Controls** (`Button`, `IconButton`)
2. **Form System** (`Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `SearchInput`)
3. **Card System** (`Card`, `ArticleCardPreview`, `PodcastCardPreview`, `StoryCardPreview`, `RecommendationCard`, `CategoryCard`, `FeatureCard`)
4. **Typography Primitives** (`Hero`, `SectionHeader`)
5. **Badges & Avatars** (`Badge`, `Tag`, `AIBadge`, `Avatar`)
6. **Feedback & Dialogs** (`Modal`, `Toast`, `Skeleton`, `Tooltip`)
7. **Navigation** (`Navbar`, `Footer`, `MobileNavDrawer`, `Pagination`, `FilterBar`)
8. **Content Primitives** (`ReadingContainer`, `QuoteBlock`, `CalloutBlock`, `KeyTakeawayBlock`, `SafetyNotice`)
9. **Media Foundations** (`PodcastPlayerPreview`, `StorySectionPreview`)
10. **AI Primitives** (`AIMessage`, `UserMessage`, `AIMascotBadge`, `AIResponseCard`)

---

## 5. Homepage Section Hierarchy (Phase 4 Implemented)

The public homepage (`HomePage.tsx`) implements the following 11-part visual section hierarchy:

1. **Hero Section** (`HeroSection.tsx`): Primary CTA ("Explore Articles" -> `/blog`), Secondary CTA ("Listen to Podcasts" -> `/podcasts`), non-clinical badge.
2. **Student Need / Mood Selector** (`StudentNeedSection.tsx`): Interactive mood chips (`Exam Pressure`, `Feeling Stressed`, `Low Motivation`, `Feeling Tired`, `Career Confusion`, `Building Confidence`, `Personal Growth`) driving static content recommendation previews.
3. **Featured Content** (`FeaturedContentSection.tsx`): 3 featured article preview cards.
4. **Explore Topics & Categories** (`CategorySection.tsx`): Grid of taxonomy cards (`Mental Wellness`, `Academic Stress`, `Exam Pressure`, `Study Habits`, `Time Management`, `Confidence`, `College Life`, `Career Stress`, `Failure & Resilience`, `Self-Care`).
5. **Motivation Section** (`MotivationSection.tsx`): Quote callout block (*"A small step still counts..."*).
6. **Latest Articles** (`LatestArticlesSection.tsx`): 3 latest blog cards + "View All Articles" CTA -> `/blog`.
7. **Podcast Preview** (`PodcastPreviewSection.tsx`): 3 podcast episode preview cards + "Explore Podcasts" CTA -> `/podcasts`.
8. **Digital Stories Preview** (`StoryPreviewSection.tsx`): 3 interactive student story preview cards + "Read All Stories" CTA -> `/stories`.
9. **AI Discovery Preview** (`AIDiscoverySection.tsx`): Natural language query interface preview (*"Tell MindCampus what you're going through"*) with safety disclaimer.
10. **Student Support Message** (`SupportSection.tsx`): Reassurance banner (*"You Don't Have to Figure Everything Out at Once"*).
11. **Safety Notice Banner** (`SafetySection.tsx`): Non-clinical disclaimer banner (`<SafetyNotice />`).
