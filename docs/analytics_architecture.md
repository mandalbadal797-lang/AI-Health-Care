# MindCampus — Admin Analytics & Intelligent Content Insights Architecture

## 1. Executive Overview

The MindCampus Admin Analytics & Intelligent Content Insights System provides platform administrators with data-driven content performance metrics and operational observations at `/admin/analytics`. It converts student reading, listening, saving, completion, rating, and feedback interactions into actionable content-quality improvement recommendations.

---

## 2. Core Architectural Models

```
+-----------------------------------------------------------------------+
|                    ADMIN ANALYTICS DASHBOARD LAYER                    |
|                                                                       |
|  +--------------------+   +-------------------+   +----------------+  |
|  |  Overview KPIs     |   | Content Table &   |   | Opportunity    |  |
|  | (Views, Saves, Comp|   | Category Breakdown|   | Insights       |  |
|  +---------+----------+   +---------+---------+   +-------+--------+  |
+------------|------------------------|---------------------|-----------+
             |                        |                     |
             v                        v                     v
+-----------------------------------------------------------------------+
|                        ANALYTICS REST API LAYER                       |
|                                                                       |
|  GET /api/v1/admin/analytics/overview  GET /api/v1/admin/analytics/trend|
|  GET /api/v1/admin/analytics/content   GET /api/v1/admin/analytics/cat |
|  GET /api/v1/admin/analytics/insights  (RBAC Protected: Admin Only)   |
+----------------------------------- +----------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------+
|                       SOURCE DATABASE AGGREGATIONS                    |
|                                                                       |
|  - Article, Podcast, Story (Published status filter)                  |
|  - SavedContent (Save metrics & repeat interest signals)              |
|  - ContentProgress (Starts, completions >=90%, average progress)      |
|  - ContentFeedback (Helpful rate, 1-5 average rating, tags)          |
|  - RecentlyViewed (Total views, distinct authenticated viewers)       |
+-----------------------------------------------------------------------+
```

---

## 3. Metric Definitions & Mathematical Calculation Formulae

1. **Total Content Views**: Count of valid content-view events during the selected date range.
2. **Unique Viewers**: Count of distinct authenticated user IDs viewing content during the period.
3. **Total Saves**: Count of content save actions during the period.
4. **Total Completions**: Count of content interactions reaching $\ge 90.0\%$ progress.
5. **Completion Rate**:
   $$\text{Completion Rate (\%)} = \frac{\text{Total Completions}}{\text{Total Started Interactions}} \times 100$$
6. **Helpful Rate**:
   $$\text{Helpful Rate (\%)} = \frac{\text{Helpful YES Responses}}{\text{Total Helpful Responses}} \times 100$$
7. **Average Rating**:
   $$\text{Average Rating} = \frac{\sum_{i=1}^{N} \text{rating}_i}{N} \quad (1 \le \text{rating} \le 5)$$
8. **Percentage Change**:
   $$\text{Percentage Change (\%)} = \frac{\text{Current Period Value} - \text{Previous Period Value}}{\text{Previous Period Value}} \times 100$$

---

## 4. Rule-Based Intelligent Content Improvement Insights

The system evaluates deterministic rules to generate operational insights without clinical or psychological assumptions:

- **High Views + Low Completion**: Triggered when content has $\ge 5$ views and $< 50.0\%$ completion rate. *Recommendation: Shorten introductory sections, clarify headline promises, or break long text into subheadings.*
- **High Saves + High Completion**: Triggered when content has $\ge 3$ saves and $\ge 75.0\%$ completion rate. *Recommendation: High student repeat value. Consider featuring in upcoming podcast episodes or newsletter highlights.*

---

## 5. Security & Privacy Guarantees

1. **Strict Admin Access Control (RBAC)**: All `/api/v1/admin/analytics/*` endpoints enforce `require_admin`. Non-admin student requests are rejected with HTTP 403 Forbidden.
2. **Zero Student Psychological Profiling**: Dashboard metrics aggregate platform health and content quality exclusively. No student stress/anxiety scores, mental-health indexes, or student rankings are calculated.
3. **Data Minimization & Identity Protection**: API responses return aggregate statistics. User IDs, emails, and individual reading histories are never exposed in analytics payloads.
