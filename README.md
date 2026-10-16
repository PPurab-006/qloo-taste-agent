# VELLUM · Cultural Intelligence Engine

> **Qloo Agentic Hackathon 2026 Submission**  
> *A personal cultural-intelligence engine discovering cross-domain affinities and curating coherent cultural experiences backed by Qloo’s 250M+ entity Taste Graph.*

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-FCC72B?logo=vitest)](https://vitest.dev/)
[![Qloo API](https://img.shields.io/badge/Qloo_API-v2_Insights-6C5CE7)](https://docs.qloo.com)

---

## 1. Executive Summary & Core Differentiation

Generic Large Language Models (LLMs) hallucinate cultural connections: they confuse popularity with affinity, regurgitate high-probability internet tropes, and invent non-existent venues or fictional correlations.

**Vellum** inverts this paradigm. Rather than asking an ungrounded LLM to guess what a cinephile who loves *In the Mood for Love* and *Brian Eno* might enjoy for dinner or literature, Vellum queries **Qloo’s Taste Graph**—a multi-dimensional cultural intelligence matrix mapping real-world behavioral affinities across 250M+ entities spanning cinema, music, literature, dining, design, and travel.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE VELLUM ADVANTAGE                            │
├───────────────────────────────────┬────────────────────────────────────┤
│ Generic LLM Approach              │ Vellum + Qloo Taste Graph          │
├───────────────────────────────────┼────────────────────────────────────┤
│ ❌ Guesses based on text token co- │ ✅ Queries empirical behavioral    │
│    occurrence on the public web   │    affinity graph (250M+ entities) │
│ ❌ Fabricates scores and reasons  │ ✅ Mathematical explainability     │
│    in opaque stream of text       │    weights via feature.explainability│
│ ❌ High risk of inventing venues, │ ✅ Strict anti-fabrication: checks │
│    addresses, or fake metadata    │    canonical entity IDs & properties│
│ ❌ Fails to quantify multi-anchor │ ✅ Multi-vector signal correlation │
│    attribution (opaque blending)  │    per individual input anchor     │
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 2. System Architecture & Data Flow

Vellum is built with a serverless **Next.js 15** architecture in TypeScript, featuring an editorial interface crafted in custom Vanilla CSS (warm obsidian `--bg-deep: #0b0d10`, aged brass accent `--accent: #d8a25e`, Newsreader serif typography, and JetBrains Mono metrics).

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            USER INTERACTION                             │
 │  1. Select 2-5 Cultural Anchors (Films, Artists, Books, Places, Brands) │
 │  2. Tune Context: City (e.g. New York), Mood, and Discovery Dial        │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                   VELLUM BACKEND API LAYER (Next.js)                   │
 │                                                                         │
 │  POST /api/curate                                                       │
 │  ├── Zod Schema Validation (Anchor limits, duplicate ID rejection)      │
 │  ├── QlooClient with Bounded LRU Cache & Exponential Backoff Retries    │
 │  │   ├── Direct GET https://hackathon.api.qloo.com/v2/insights          │
 │  │   │   ├── filter.type: urn:entity:movie, urn:entity:place, etc.     │
 │  │   │   ├── signal.interests.entities: <anchor_uuid_1>,<anchor_uuid_2>│
 │  │   │   ├── feature.explainability: true                               │
 │  │   │   └── Headers: X-Api-Key: <token>                                │
 │  │   └── Graceful Fallback: Canonical high-fidelity mock if offline/no key│
 │  └── ExperienceCurator: Grounded temporal stop synthesis                │
 └────────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                     PRESENTATION & EXPLAINABILITY                       │
 │  ├── Curated Experience: Temporal Itinerary (Afternoon, Twilight, Night)│
 │  ├── Cross-Domain Discovery Deck: Normalized affinity & genre tags      │
 │  ├── Visual Relationship Explorer: SVG Lineage between Anchors & Recs   │
 │  └── Deep Evidence Modal: Strict API signal vs. AI narrative breakdown  │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. End-to-End User Journey

Vellum answers three fundamental questions for cultural explorers:
1. **What should I discover next?** Cross-domain recommendations across categories that traditional algorithms never bridge (e.g., cinema $\rightarrow$ fragrance & design $\rightarrow$ atmospheric gastronomy).
2. **Why is this recommendation connected to my taste?** Uncompromised explainability via Qloo's `query.explainability` vector, showing exactly what percentage each anchor contributed.
3. **What coherent experience can I build?** A curated temporal experience (Afternoon Prelude, Twilight Dining, and Nocturnal Sound) calibrated for a specific city, mood, and discovery dial.

---

## 4. Quickstart & Local Installation

### Prerequisites
- Node.js `v18.17+` or `v20+` or `v22+`
- npm `v9+` or `v10+`

### 1. Clone the repository
```bash
git clone https://github.com/PPurab-006/qloo-taste-agent.git
cd qloo-taste-agent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` file from the provided `.env.example`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```ini
# Official Qloo Hackathon Base URL
QLOO_BASE_URL=https://hackathon.api.qloo.com

# Your Qloo Hackathon API Key (X-Api-Key header)
# If omitted or left as placeholder, Vellum seamlessly activates its offline
# demonstration mode with high-fidelity canonical fixtures.
QLOO_API_KEY=your_qloo_hackathon_api_key_here

# Network resilience parameters
QLOO_TIMEOUT_MS=10000
QLOO_CACHE_TTL_MS=300000
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 5. Automated Test Suite

Vellum includes a comprehensive automated test suite built with **Vitest**. The test suite validates schema boundaries, client resilience, error translation, exponential retries, and experience synthesis without consuming live API quota:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/validation.test.ts`**:
  - Validates profile constraints (strictly 2 to 5 anchors).
  - Rejects duplicate anchor IDs to prevent artificial signal skewing.
  - Rejects empty/whitespace search queries.
  - Gracefully parses partial entities with missing optional metadata.
- **`tests/qloo-client.test.ts`**:
  - Validates `X-Api-Key` header injection and official `/search` and `/v2/insights` parameters.
  - Verifies HTTP 401 translation to `QlooAuthError`.
  - Verifies HTTP 429 exponential backoff retries and `QlooRateLimitError`.
  - Verifies `AbortController` request timeouts and `QlooTimeoutError`.
  - Verifies detection and rejection of malformed upstream responses (`QlooApiError`).
  - Verifies in-memory LRU caching of repeated requests.
- **`tests/curator.test.ts`**:
  - Tests multi-category cross-domain discovery.
  - Verifies strict anchor deduplication (anchors are never recommended to themselves).
  - Verifies parsing of `query.explainability` weights into percentage attributions.
  - Verifies category failure resilience (single category timeout does not abort overall discovery).
  - Verifies 3-stop temporal experience synthesis.
- **`tests/api-routes.test.ts`**:
  - Tests Next.js serverless route handlers: `GET /api/health`, `GET /api/qloo/search`, and `POST /api/curate`.

---

## 6. Judge Demo Script (3-Minute Tour)

For hackathon judges evaluating the product live:

1. **Visit the Homepage**:
   - Notice the operational badge in the masthead indicating the active engine status.
   - Read the transparency banner outlining the distinction between Qloo empirical graph signals and AI narration.

2. **Load a Curated Starting Point**:
   - In the **Curated Starting Points (Judges)** section, click **"A24 Cinephile & Ambient Sound Explorer"**.
   - Watch the 4 cultural anchors populate instantly (*Everything Everywhere All at Once*, *Brian Eno*, *Balthazar*, *A24*).
   - Alternatively, use the typeahead search to find and add any entity (e.g., search *"Blade Runner"* or *"Past Lives"*).

3. **Configure Experience Context**:
   - Confirm Location is set to **New York**.
   - Select Mood as **Avant-Garde** and Discovery Dial as **Balanced**.

4. **Trigger Experience Synthesis**:
   - Click **"Synthesize Cultural Experience"**.
   - Inspect the **Curated Cultural Experience**:
     - *16:00 Afternoon Cultural Prelude* (Literature or Design Brand)
     - *19:30 Twilight Gastronomy & Atmosphere* (Grounded Dining or Cinematic Centerpiece)
     - *22:00 Nocturnal Sound & Reflection* (Sonic immersion)

5. **Examine Deep Evidence & Grounding**:
   - Scroll to the **Cross-Domain Discoveries Deck**.
   - Hover over any card to view the affinity percentage and contributing anchor tags.
   - Click **"Inspect Evidence"** on a discovery card (e.g., *Neuromancer* or *Jon Hopkins*).
   - In the modal, examine:
     - The exact empirical weights per anchor.
     - The distinction between `[Qloo Taste Graph Empirical Signal]` and `[Grounded Contextual Narrative]`.
     - The anti-fabrication statement confirming no fake scores or fictitious venue claims.

6. **Explore Visual Lineage**:
   - View the **Visual Relationship Explorer** illustrating how input anchors connect to newly discovered domains with relative influence weighting.

---

## 7. Known Limitations & Technical Disclosure

In strict adherence to the competition's truthfulness principles:
- **Exploratory Affinity, Not Guarantees:** Qloo taste correlations reflect empirical cross-domain co-affinity patterns across large cultural cohorts. They are exploratory instruments for discovery rather than predictive guarantees of individual personal satisfaction.
- **Physical Venue Data Freshness:** Vellum surfaces place entities verified in Qloo's graph. To avoid hallucination, Vellum intentionally does **not** fabricate real-time booking availability, live table inventory, dynamic ticket pricing, or fluctuating opening hours.
- **Hackathon Base URL Isolation:** In accordance with official Qloo documentation, hackathon API keys are routed through `https://hackathon.api.qloo.com` (`X-Api-Key` header). Using the production endpoint with hackathon credentials returns HTTP 401.
- **Offline / Demonstration Mode:** If an API key is not supplied in `.env.local` or upstream connectivity fails, Vellum automatically degrades into offline demonstration mode backed by a comprehensive canonical dataset of verified entities, ensuring judges can evaluate the interface and synthesis logic reliably under any network condition.

---

## 8. License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.
