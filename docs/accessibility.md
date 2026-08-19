# MindCampus — Accessibility (a11y) Specification

## 1. Compliance Standard Target

MindCampus targets full compliance with **WCAG 2.2 Level AA** standards. Accessibility is integrated into the core architecture to ensure students with visual, auditory, cognitive, or motor impairments can navigate and benefit from all wellness content seamlessly.

---

## 2. Accessibility Guidelines & Core Requirements

### 2.1 Keyboard Navigation & Focus Management
* **Focus Indicators**: Every interactive control (buttons, links, inputs, cards) exhibits a high-contrast focus ring (`outline: 3px solid var(--color-primary); outline-offset: 2px`).
* **Logical Tab Sequence**: HTML structure mirrors visual reading order. No positive `tabindex` values.
* **Skip to Main Content Link**: A hidden skip link (`<a href="#main-content" class="skip-link">Skip to content</a>`) appears on tab focus at the top of every page.
* **Modal Dialog Trapping**: When a modal opens (e.g. AI Assistant or Login Modal), keyboard focus is trapped within the dialog container until closed via `Escape` key or Close button.

### 2.13 Community Component Accessibility Guidelines
* **Keyboard Accessible Discussion Controls**: Comment inputs, reply triggers, helpful reaction buttons, report modals, and edit/delete actions are fully operable via keyboard `Tab` and `Enter/Space` keys.
* **Accessible Thread Visual Structure**: 2-level reply threads use structured indentation and semantic border markers with explicit `Reply` labels.
* **Accessible Community Guidelines Alert**: Community guidelines banner uses high-contrast text and ARIA landmark containers.
