# MindCampus — Component Library Reference

## 1. Component Overview

The MindCampus component library contains modular, accessible, and responsive UI components created during **Phase 3**.

---

## 2. Component Catalog

### 2.1 Buttons & Controls
* **`<Button />`**:
  * **Props**: `variant` ('primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'), `size` ('sm' | 'md' | 'lg'), `isLoading`, `leftIcon`, `rightIcon`.
  * **Accessibility**: Supports keyboard focus ring, `:disabled` state, loading spinner.
* **`<IconButton />`**:
  * **Props**: `icon`, `aria-label` (Mandatory), `variant`, `size`.

### 2.2 Form System
* **`<Input />`**: Text input with label, helperText, error state, left/right icons, and `aria-describedby` error association.
* **`<Textarea />`**: Multi-line textarea for feedback or admin draft editing.
* **`<Select />`**: Option dropdown for category or stress factor choices.
* **`<Checkbox />`**: Checkbox input with explicit label element association.
* **`<RadioGroup />`**: Accessible radio button list wrapped in `fieldset` and `legend`.
* **`<SearchInput />`**: Search control with clear (`X`) button affordance.

### 2.3 Cards & Previews
* **`<Card />`**: Base elevation card supporting `glass` blur and `hoverable` translation styles.
* **`<ArticleCardPreview />`**: Blog article card displaying thumbnail, category, title, excerpt, reading time, author, and bookmark action.
* **`<PodcastCardPreview />`**: Podcast episode card showing episode artwork, title, duration, and play affordance.
* **`<StoryCardPreview />`**: Visual digital story card displaying quote callout and chapter count.
* **`<RecommendationCard />`**: AI matched content recommendation card with match score badge.
* **`<CategoryCard />`**: Category selection card with icon and item count.

### 2.4 Navigation & Layout
* **`<Navbar />`**: Main header navigation with brand logo, active route indicators, API status badge, theme switcher, and mobile menu trigger.
* **`<MobileNavDrawer />`**: Accessible slide-out mobile menu with focus trapping and `Escape` key listener.
* **`<Footer />`**: Page footer containing mandatory non-clinical safety notice and links.
* **`<Pagination />`**: Page navigation bar.
* **`<FilterBar />`**: Chip-based filter bar for categories and tags.

### 2.5 Content & Reading Experience
* **`<ReadingContainer />`**: 720px max-width container optimizing line length for article reading.
* **`<QuoteBlock />`**: Highlighted blockquote for motivational quotes.
* **`<CalloutBlock />`**: Info, warning, or success callout box.
* **`<KeyTakeawayBlock />`**: Actionable points summary block.
* **`<SafetyNotice />`**: Non-clinical disclaimer banner.

### 2.6 Feedback & Dialogs
* **`<Modal />`**: Accessible dialog with backdrop blur, `aria-modal="true"`, focus trap, and `Escape` key listener.
* **`<Toast />`**: Alert notification banner (success, error, warning, info).
* **`<Skeleton />`**: Shimmering loading placeholders (`CardSkeleton`, `TextSkeleton`).
* **`<Tooltip />`**: Hover/focus assistance popup.

### 2.7 AI Primitives
* **`<AIMessage />`**: Mascot chat response container with mascot badge and non-clinical disclaimer.
* **`<UserMessage />`**: Student prompt message bubble.
* **`<AIBadge />`**: "AI Generated" / "AI Assisted" tag.
* **`<AIResponseCard />`**: Summary / draft preview wrapper.
