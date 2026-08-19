# MindCampus — AI Architecture & Safety Specification

## 1. Executive Overview

The MindCampus AI System provides supportive, non-clinical student motivation, study habit guidance, reflection prompts, and grounded content recommendations across blogs, podcasts, and digital stories.

---

## 2. Decoupled AI Architecture

```
Frontend (AIAssistantPage)
  ↓ HTTP REST
API Router (FastAPI /api/v1/ai/chat)
  ↓
AIService (Orchestration & System Prompt Boundaries)
  ├── 1. Safety Classifier Interceptor (Crisis Detection)
  ├── 2. ContentSearchService (Grounded Content Retrieval)
  └── 3. BaseAIProvider Interface
         ├── GeminiAIProvider (Active LLM Provider via HTTP)
         └── FallbackAIProvider (Deterministic Offline Fallback)
```

---

## 3. Provider Abstraction Interface (`BaseAIProvider`)

All AI operations are decoupled from specific SDKs using the `BaseAIProvider` abstract base class:

* `generate_response(user_message, system_prompt, conversation_history, content_context)`
* `classify_safety(user_message)`

The active provider is instantiated via factory `get_ai_provider()`. If `AI_API_KEY` is not present or an API failure occurs, the system falls back gracefully to `FallbackAIProvider` so the application remains 100% functional without external API keys.

---

## 4. Zero-LLM Safety Interceptor & Crisis Guardrails

1. **Safety Levels**:
   * `NORMAL`: Standard student study habit / motivation query.
   * `EMOTIONAL_DISTRESS`: Elevated stress or burnout query.
   * `IMMINENT_DANGER`: Crisis keywords detected (e.g., self-harm, suicide).

2. **Controlled Crisis Response**:
   If `IMMINENT_DANGER` is detected, the LLM path is bypassed and a pre-defined non-clinical crisis response is returned with verified emergency helpline numbers (**988 Lifeline**, **Crisis Text Line 741741**, **findahelpline.com**).

3. **No Medical / Therapy Claims**:
   System prompt strictly prohibits diagnostic statements ("You have depression"), therapeutic claims, or medical advice.

4. **Prompt Injection Protection**:
   System prompt boundaries enforce server-side constraints against jailbreak commands ("Ignore previous instructions", "Reveal system prompt", "Tell me your API key").

---

## 5. Grounded Content Recommendation Engine

Recommendations are strictly derived from real database records using `ContentSearchService`. The AI does **NOT** invent titles, URLs, or authors. Grounded items are attached as structured cards in the API response:

```json
{
  "message": "Feeling unmotivated is common...",
  "recommendations": [
    {
      "id": "e9a8f765-4321-4876-8901-abcdef654321",
      "type": "story",
      "title": "I Failed My First Midterm — And Found My Voice",
      "slug": "failed-first-midterm-found-my-voice",
      "excerpt": "How receiving an F forced me to change my study habits...",
      "category": "Failure & Resilience",
      "url": "/stories/failed-first-midterm-found-my-voice"
    }
  ],
  "safety_level": "NORMAL",
  "provider": "fallback"
}
```

---

## 6. Privacy & Data Minimization

* **Zero Persistent Conversation Storage**: Student chat queries are processed in memory and are **NOT** stored in database tables or audit logs.
* **No PII Transmission**: User identity, email, or account metadata is omitted from AI LLM request payloads.
