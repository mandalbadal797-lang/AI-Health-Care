# MindCampus — AI Prompt Architecture & System Safety Specification

## 1. System Prompt Principles

All AI content generation prompts enforce non-clinical student wellness guardrails:

1. **Non-Clinical Focus**: AI must adopt supportive, educational, and motivational tones suitable for college students.
2. **Zero Medical/Clinical Advice**: AI must NOT attempt to diagnose health conditions, prescribe treatments, or promise psychological outcomes.
3. **Prompt Injection Protection**: System prompts strictly isolate user topic inputs from system control instructions. Direct injection phrases (e.g. *"Ignore previous instructions"*) are sanitized server-side before execution.

---

## 2. Output Schemas

### 2.1 Blog Article Schema
```json
{
  "title": "Navigating Exam Stress: A Student Guide",
  "summary": "Practical strategies for managing study fatigue.",
  "introduction": "College life brings unique challenges...",
  "outline": ["1. Recognizing Overwhelm", "2. Actionable Micro-Habits"],
  "body": "### 1. Recognizing Overwhelm...",
  "conclusion": "Managing stress is an ongoing journey.",
  "tags": ["blog", "study-tips"],
  "seo_title": "Navigating Exam Stress - MindCampus",
  "meta_description": "Student-tested tips for overcoming midterm stress."
}
```

### 2.2 Podcast Script Schema
```json
{
  "title": "Episode Draft: Master Your Mindset",
  "description": "Practical non-clinical podcast guide.",
  "intro_script": "HOST: Welcome back to MindCampus...",
  "sections": [
    {"section_title": "Section 1", "script": "HOST: Let's talk about..."}
  ],
  "outro_script": "HOST: That wraps up today's episode!",
  "call_to_action": "Subscribe and share!"
}
```
