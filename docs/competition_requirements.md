# Qloo Agentic Hackathon: Competition Requirements & Implementation Traceability

This document records the official requirements of the **Qloo Agentic Hackathon 2026** and maps how the **Vellum** codebase satisfies each criterion.

---

## 1. Hackathon Details & Official Parameters

- **Competition Host:** Qloo via [Devpost](https://qloo.devpost.com/)
- **Submission Deadline:** October 30, 2026 at 8:45 PM PDT
- **Total Prize Pool:** $25,000 USD
- **Target Repository:** `PPurab-006/qloo-taste-agent`
- **Core Requirement:** Build an application where Qloo's Cultural Taste Graph and API materially improve recommendations, personalization, or decision-making beyond what an ungrounded LLM can achieve alone.

---

## 2. Evaluation Criteria & Vellum Alignment

| Judging Criterion | Weight | Vellum Architectural Implementation |
| :--- | :---: | :--- |
| **Technological Implementation** | High | Dedicated `QlooClient` implementing direct calls to `/search` and `/v2/insights` with `feature.explainability=true`. Features request timeouts (`AbortController`), bounded LRU in-memory caching, exponential backoff retries on 429/5xx, structured typed error hierarchy, strict Zod schema validation, and graceful fallback to verified canonical mock fixtures when credentials are absent. |
| **Design & User Experience** | High | Bespoke editorial aesthetic inspired by premium cultural journals. Built with responsive Vanilla CSS (custom design tokens, warm obsidian `--bg-deep: #0b0d10`, aged brass accent `--accent: #d8a25e`, Newsreader serif typography, JetBrains Mono metrics). Features taste anchor chips, 1-click judge presets, interactive visual relationship explorer, and deep evidence inspection modals. |
| **Potential Impact & Differentiation** | High | Direct contrast against ungrounded LLM guessing. Vellum proves why empirical multi-domain taste graphs are necessary: LLMs hallucinate scores and popular tropes, whereas Qloo provides real behavioral affinity matrices across 250M+ entities spanning film, music, literature, fashion, and dining. |
| **Quality of Idea & Execution** | High | Clear end-to-end user journey: anchor resolution $\rightarrow$ cross-domain graph query $\rightarrow$ curated temporal experience $\rightarrow$ transparent mathematical attribution. Built with zero fabricated numbers or fake live data. |

---

## 3. Qloo API Integration Verification

### Verified Endpoint Schemas
1. **Search Endpoint**:
   - `GET /search?query=<query>&types=<type>&take=<n>`
   - Authenticated via `X-Api-Key: <token>` header against `https://hackathon.api.qloo.com`.
   - Used for typeahead entity resolution to canonical Qloo UUIDs.

2. **Insights Endpoint**:
   - `GET /v2/insights?filter.type=<urn>&signal.interests.entities=<id1,id2>&feature.explainability=true&take=<n>`
   - Parameters:
     - `filter.type`: Destination entity URN (e.g., `urn:entity:movie`, `urn:entity:artist`, `urn:entity:book`, `urn:entity:place`, `urn:entity:brand`, `urn:entity:video_game`).
     - `signal.interests.entities`: Comma-separated list of resolved anchor UUIDs.
     - `feature.explainability=true`: Requests mathematical attribution weights per input anchor.
     - `signal.location.query`: Filters spatial recommendations by city (e.g. `New York`, `London`, `Tokyo`).
   - Deprecations: `/recs` and `/recommendations` are deprecated and strictly avoided.

---

## 4. Anti-Fabrication & Truthfulness Principle

- **No Invented Scores:** All affinity scores and explainability weights derive directly from Qloo API signals (`query.affinity`, `query.explainability`). In mock demonstration mode, weights derive mathematically from canonical taste overlap algorithms.
- **No Fictitious Venues or Hours:** Vellum only presents real venues present in the graph. It explicitly avoids fabricating real-time booking availability, table inventory, live ticket prices, or opening hours.
- **Clear Attribution:** Every recommendation explicitly delineates `[Qloo Taste Graph Empirical Signal]` (API-derived fact) from `[Grounded Contextual Narrative]` (AI synthesis).
