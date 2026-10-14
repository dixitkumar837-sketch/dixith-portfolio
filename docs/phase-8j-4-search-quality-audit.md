# Phase 8J.4 — Search Quality Audit & Retrieval Integrity Report

**Date:** 2026-09-28  
**Auditor:** Antigravity AI Engineering  
**Scope:** Complete DIXITH Search & Retrieval Subsystem Audit  
**Execution Mode:** Offline Only (Zero external APIs, zero live AI research, zero CDP / browser connections)

---

## 1. Search Architecture

The DIXITH search subsystem implements a layered, dual-retrieval pipeline designed for high precision, complete publication safety, and explainable ranking:

```
                      Canonical Content Repositories
(Research, Experiments, Articles, Guides, Professional Experience)
                                 │
                                 ▼
                     Publication Safety Boundary
                       (isIndexable() Filter)
                                 │
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
  Phase 8F Lexical Retrieval              Phase 8G.6 Dense Semantic Retrieval
 (Title, Summary, Headings, Topics,      (Local MiniLM 384d Cosine Similarity
   Taxonomy Expansion, Deduplication)       Filtered by status: PUBLISHED)
             │                                       │
             ▼                                       ▼
Phase 8G.9 Lexical Quality Gate          Chunk-to-Entity Consolidation
(Rejects Generic Stopword Overlaps)     (Collapses 18 Chunks into Unique Entities)
             │                                       │
             └───────────────────┬───────────────────┘
                                 ▼
                  Phase 8G.8 Hybrid RRF Fusion
                    RRF(e) = Σ [1 / (k + rank)]
                                 │
                                 ▼
                   Canonical Safety Re-Verification
                     (resolveCanonicalEntity())
                                 │
                                 ▼
                UnifiedSearchResult Presentation Contract
                       (/search Route & UI Card)
```

### Retrieval Components
- **`lib/search.ts` (Phase 8F Lexical Engine):** Tokenizes queries, applies normalized taxonomy expansion, evaluates multi-field weighted scoring (`SEARCH_WEIGHTS`), deduplicates candidates by entity ID, and sorts deterministically (`score DESC`, `title ASC`).
- **`lib/search/hybrid.ts` (Phase 8G.8 Hybrid Retrieval Layer):** Combines Phase 8F lexical candidates and Phase 8G.6 semantic candidates using Reciprocal Rank Fusion ($k=60$). Consolidates multi-chunk semantic matches into single entity candidates and enforces defense-in-depth publication safety.
- **`lib/search/lexical-quality.ts` (Phase 8G.9 Quality Gate):** Vets lexical candidate results to eliminate false positives arising from generic conversational token overlap while preserving 100% recall on genuine domain queries.
- **`lib/search/mode.ts` (Phase 8G.10 Multi-Mode Router):** Routes requests between deterministic `keyword` mode (default) and opt-in `hybrid` mode (`mode=hybrid`). Provides graceful fallback to keyword search if hybrid retrieval fails.
- **`lib/semantic/retrieval.ts` (Phase 8G.6 Dense Vector Retrieval):** Server-side embedding using local `Xenova/all-MiniLM-L6-v2` (384 dimensions) and in-memory cosine similarity over `LocalVectorStore`.
- **`app/search/page.tsx`:** Accessible React Server Component rendering search controls, mode toggles, type filter tabs, and unified search result cards. Configured with `robots: { index: false, follow: true }` (`noindex, follow`).

---

## 2. Lexical Retrieval Audit

### Observed Implementation Behavior
- **Query Normalization (`normalizeText`):**
  - Lowercases all characters.
  - Strips quotes (`'`, `"`, `’`, `` ` ``) cleanly.
  - Replaces non-alphanumeric punctuation and hyphens with spaces (`replace(/[^\w\s]/g, " ")`).
  - Collapses repeated whitespace.
- **Tokenization (`tokenizeQuery`):**
  - Splits on `\s+` into unique non-empty tokens.
- **Field Relevance Hierarchy (`SEARCH_WEIGHTS`):**
  - Multi-word phrase matches: Title (25), Summary (14), Headings (10), Content (6).
  - Base token matches: Title (10), Summary (6), Topics (5), Headings (4), Content (3), Sources (2), Related (2).
  - Taxonomy alias matches: 5 bonus points.
- **Exact & Partial Phrase Matching:**
  - Tested `"E-Commerce Search & Generative Discovery"`: PE-003 received top rank with score `121` (including `title-phrase` match).
  - Tested `"Generative Discovery"`: PE-003 received top rank with score `76` (including `title-phrase` match).
- **Normalization Invariance:**
  - Case variations: `"TECHNICAL SEO"`, `"technical seo"`, and `"TeChNiCaL sEo"` yielded bit-exact identical scores and result arrays.
  - Whitespace variations: `"   technical     seo   "` matched standard spacing identically.
  - Punctuation variations: `"technical, seo!"` matched standard tokens identically.
- **Edge Cases:**
  - Empty query (`""`) and whitespace-only query (`"   "`): Returns `[]` immediately without loading documents.
  - Nonsense query (`"xyzabc12345nonexistenttoken"`): Returns `[]` safely.
- **Determinism:**
  - Executed 5 repeated runs of identical queries: 100% bit-exact ordering and score reproducibility.

---

## 3. Semantic Retrieval Audit

### Observed Implementation Behavior
- **Local Index Verification:**
  - Stored index: `data/derived/semantic-index.json`.
  - Model: `Xenova/all-MiniLM-L6-v2` (384 dimensions).
  - Record count: Exactly **18 chunks**, all tagged with `status: "PUBLISHED"`.
  - Entities indexed: Exclusively `PE-001`, `PE-002`, and `PE-003`. Zero unpublished content chunks exist.
- **Store & Model Compatibility Check:**
  - `semanticSearch()` checks physical index file existence, verifies model identifier match, and confirms dimension equality (384d) prior to vector search.
- **Thresholding & Result Limiting:**
  - Enforces minimum cosine similarity threshold (default `0.30`).
  - Limits chunk results to `limit` (bounded between 1 and 20).
- **Chunk-to-Entity Consolidation (`consolidateSemanticChunks`):**
  - Correctly collapses multiple matching chunks belonging to the same entity into a single consolidated candidate.
  - Preserves the best semantic rank, highest similarity score, and strongest chunk excerpt.
- **Publication Safety:**
  - Vector search query passes `{ status: "PUBLISHED" }` filter, followed by an explicit double-check: `searchResults.filter(item => item.metadata.status && isIndexable(item.metadata.status))`.

---

## 4. Hybrid Retrieval Audit

### Observed Implementation Behavior
- **Reciprocal Rank Fusion (RRF):**
  - Blending formula: $RRF(entity) = \sum \frac{1}{k + rank}$ where $k = 60$.
  - Rank-based blending prevents uncalibrated mixing of lexical integer scores and cosine similarities.
- **Lexical Quality Gate (`filterLexicalCandidates`):**
  - Intercepts raw Phase 8F lexical results before RRF fusion.
  - Filters out candidates matching only generic conversational filler words (e.g., "how", "to", "for", "in") when no substantive domain terms match.
- **Result Ordering & Tie-Breaking:**
  - Primary sort: `rrfScore DESC`.
  - Tie-breaker 1: `entityId ASC`.
  - Tie-breaker 2: `slug ASC`.
  - Determinism: 100% reproducible across all repeated executions.
- **Mode Fallback Behavior:**
  - Unrecognized modes (e.g., `mode=custom_mode`) safely default to Phase 8F deterministic keyword search.
  - Simulated vector store failure: Hybrid retrieval caught the error and gracefully degraded to keyword results with `fallbackToKeyword: true`.

---

## 5. Publication Safety Audit

### Multi-Layer Defense-in-Depth

| Boundary Layer | Implementation | Verification Status |
|---|---|:---:|
| 1. Lexical Index Construction | `buildSearchIndex()` filters each entity collection with `if (!isIndexable(item.status)) continue;` | **VERIFIED** |
| 2. Semantic Index Construction | `indexPublishedContent()` processes only entities where `isIndexable(entity.status) === true` | **VERIFIED** |
| 3. Vector Search Gating | `store.search({ filter: { status: "PUBLISHED" } })` | **VERIFIED** |
| 4. Semantic Double-Gate | `searchResults.filter(item => item.metadata.status && isIndexable(item.metadata.status))` | **VERIFIED** |
| 5. Hybrid Entity Resolution | `resolveCanonicalEntity()` rejects any entity where `!isIndexable(canonical.status)` | **VERIFIED** |

### Status Gating Verification
All content statuses were tested against the universal publication gate:
- `DRAFT` $\rightarrow$ **REJECTED** (GUI-001, GUI-002, INS-001..003 excluded)
- `IN_REVIEW` $\rightarrow$ **REJECTED** (EXP-012..014 excluded)
- `EVIDENCE_READY` $\rightarrow$ **REJECTED**
- `ACTIVE` $\rightarrow$ **REJECTED** (EXP-001 excluded)
- `COMPLETED` $\rightarrow$ **REJECTED**
- `ARCHIVED` $\rightarrow$ **REJECTED**
- `PUBLISHED` $\rightarrow$ **ACCEPTED** (PE-001, PE-002, PE-003 retrievable)

---

## 6. Taxonomy & Acronym Alias Audit

### Controlled Vocabulary Audit
The controlled alias dictionary (`DIXITH_TAXONOMY_ALIASES`) was audited for bidirectional mapping:

| Acronym / Term | Target Expansion | Reverse Mapping Present? | Audit Finding |
|---|---|:---:|---|
| `aeo` | `answer engine optimization` | Yes (`answer engine optimization` $\rightarrow$ `aeo`) | **PASSED** |
| `geo` | `generative engine optimization` | Yes (`generative engine optimization` $\rightarrow$ `geo`) | **PASSED** |
| `seo` | `technical seo`, `search engine optimization` | Yes (`technical seo` / `search engine optimization` $\rightarrow$ `seo`) | **PASSED** |
| `rag` | `retrieval augmented generation`, `retrieval grounding` | Yes (`retrieval augmented generation` $\rightarrow$ `rag`) | **PASSED** |
| `knowledge graph(s)` | `entities`, `knowledge graph(s)` | Yes (`entities` / `entity recognition` $\rightarrow$ `knowledge graphs`) | **PASSED** |
| `schema` / `schema.org` | `structured data`, `schema org` | Yes (`structured data` $\rightarrow$ `schema`, `schema org`) | **PASSED** |
| `ai search` / `ai-search` | `generative search`, `ai-search` | Yes (`ai-search` $\rightarrow$ `ai search`) | **PASSED** |
| `hreflang` | `international search`, `cross-border` | **MISSING initially** (reverse did not map to `hreflang`) | **DEFECT RESOLVED** |

### Defect Identified & Corrected
- **Defect:** `hreflang` expanded to `international search` and `cross-border`, but queries for `"international search"` or `"cross-border"` did not expand to `"hreflang"`.
- **Correction:** Added bidirectional mapping entries:
  - `"international search": ["hreflang", "cross-border"]`
  - `"cross-border": ["hreflang", "international search"]`
  - `"cross border": ["hreflang", "international search"]`
- **Result:** Querying `"international search"` or `"cross-border"` now correctly expands to include `"hreflang"` and boosts technical taxonomy alignment for PE-002.

---

## 7. Negative Query & Quarantine Safety Audit

### Negative Query Rejection
Tested against the expanded 16-query distractor suite (queries completely outside search engineering and technical architecture, e.g., baking sourdough bread, topological quantum computers, football drills, car maintenance, Roman history, etc.):
- **Pure Keyword Search:** Surface false positives due to weak unigram overlap with common terms in text.
- **Hybrid Search (with Lexical Quality Gate):** Successfully rejected **16 out of 16** negative distractor queries (**0.0% False Positive Rate**).
- **Representative Negative Tests:**
  - `"how to bake sourdough bread"` $\rightarrow$ 0 results
  - `"capital of France"` $\rightarrow$ 0 results
  - `"quantum computing"` $\rightarrow$ 0 results

### Quarantine Safety
- **Quarantined Artifact:** `RUN-001-20260927-Q001-gemini-01`
- **Verification:**
  - Direct search for `"RUN-001-20260927-Q001-gemini-01"` yielded **0 lexical results** and **0 hybrid results**.
  - Search indexes do not read from raw evidence directories.
  - `gemini-01` remains strictly quarantined and cannot leak into any public retrieval layer.

---

## 8. Search Type Filters Audit

The `/search` endpoint and retrieval APIs support filtering by `SearchableEntityType`:

| Filter Value | Published Corpus Entities of Type | Lexical Results | Hybrid Results | Finding |
|---|:---:|:---:|:---:|---|
| `all` | 3 (`PE-001`, `PE-002`, `PE-003`) | 3 | 3 | **PASSED** |
| `professional-experience` | 3 (`PE-001`, `PE-002`, `PE-003`) | 3 | 3 | **PASSED** |
| `research` | 0 (`EXP-012..014` are `IN_REVIEW`) | 0 | 0 | **PASSED** (fail-closed) |
| `experiment` | 0 (`EXP-001` is `ACTIVE`) | 0 | 0 | **PASSED** (fail-closed) |
| `article` | 0 (`INS-001..003` are `DRAFT`) | 0 | 0 | **PASSED** (fail-closed) |
| `guide` | 0 (`GUI-001..002` are `DRAFT`) | 0 | 0 | **PASSED** (fail-closed) |

**Conclusion:** Requesting a filter for any content type without published assets safely returns **0 results**. Ineligible draft/in-review content is never leaked to satisfy a filter.

---

## 9. Duplicate & Collision Audit

### Deduplication Mechanisms
1. **Lexical Deduplication:** In `searchContent()`, raw results are deduplicated via `Map<string, SearchResult>` keyed by `res.id`. If multiple fields or relationships trigger the same entity, scores are merged (`Math.max`) and matched fields are united.
2. **Semantic Deduplication:** In `consolidateSemanticChunks()`, chunk-level results are deduplicated via `Map<string, ConsolidatedSemanticCandidate>` keyed by `chunk.entityId`. Multiple matching chunks collapse to one candidate preserving the highest similarity score.
3. **Hybrid RRF Deduplication:** In `hybridSearch()`, candidate entity IDs are collected into `Set<string>([ ...lexicalKeys, ...semanticKeys ])`. Each entity ID is fused exactly once.
4. **Measured Duplicate Rate:** **0.0%** across all 34 benchmark queries and all test executions.

---

## 10. Determinism Audit

- **Ranking Determinism:** Every retrieval stage enforces explicit deterministic tie-breaking:
  - Lexical: `b.score - a.score`, then `a.title.localeCompare(b.title)`.
  - Semantic: `b.similarity - a.similarity`, then `a.entityId.localeCompare(b.entityId)`, then `a.chunkId.localeCompare(b.chunkId)`.
  - Hybrid: `b.rrfScore - a.rrfScore`, then `a.entityId.localeCompare(b.entityId)`, then `a.slug.localeCompare(b.slug)`.
- **Reproducibility Test:** 5 repeated executions produced bit-exact identical rankings, identical floating-point RRF scores, and identical matched field arrays.

---

## 11. Measured Benchmark Results

Measured using the standard Phase 8G.10 34-query benchmark suite (18 positive domain queries + 16 negative distractors):

```
--------------------------------------------------------------------------------------------------------
Mode                        | Top-1  | Top-3  | MRR   | Canon FP (6) | Full FP (16) | Dupl % | Avg Latency
----------------------------+--------+--------+-------+--------------+--------------+--------+------------
Keyword Mode (Phase 8F)     | 100.0% | 100.0% | 1.000 |   6/6 (100%) | 16/16 (100%) |     0% |     0.5 ms
Hybrid Mode (Phase 8G.10)   | 100.0% | 100.0% | 1.000 |     0/6 (0%) |    0/16 (0%) |     0% |     4.0 ms
--------------------------------------------------------------------------------------------------------
```

### Benchmark Metrics Summary
- **Top-1 Hit Rate (Positive Queries):**
  - Keyword: **100.0%**
  - Hybrid: **100.0%**
- **Mean Reciprocal Rank (MRR):**
  - Keyword: **1.000**
  - Hybrid: **1.000**
- **Negative Distractor False-Positive Rate:**
  - Keyword: **100.0%** (unfiltered conversational token matches)
  - Hybrid: **0.0%** (**0 of 16** false positives, protected by `LexicalQualityGate`)
- **Entity Duplication Rate:**
  - Keyword: **0.0%**
  - Hybrid: **0.0%**
- **Average Query Latency:**
  - Keyword: **0.5 ms**
  - Hybrid: **4.0 ms** (in-memory local MiniLM embedding + RRF fusion)

---

## 12. Discovered Issues

1. **Taxonomy Asymmetry in `hreflang` Aliases:**
   - In `lib/search.ts`, `hreflang` was mapped forward to `["international search", "cross-border"]`, but reverse mappings for `"international search"` and `"cross-border"` were absent from `DIXITH_TAXONOMY_ALIASES`.
   - Furthermore, normalization converts `"cross-border"` into `"cross border"`, requiring both representations in the alias dictionary.

---

## 13. Fixes Made

1. **Bidirectional Taxonomy Aliases Added (`lib/search.ts`):**
   ```ts
   // Added reverse mappings to ensure symmetric expansion
   "international search": ["hreflang", "cross-border"],
   "cross-border": ["hreflang", "international search"],
   "cross border": ["hreflang", "international search"],
   ```
   - Regression tested via assertion 24 in `scratch/test-phase8j4.ts`.
   - Verified that `expandQueryTokens(["international", "search"], "international search")` now includes `"hreflang"`.

---

## 14. Remaining Limitations

1. **Corpus Size:**
   - The public search corpus currently contains exactly 3 published Professional Experience entities (`PE-001`, `PE-002`, `PE-003`).
   - Research protocols (`EXP-012..014`), implementation guides (`GUI-001..002`), and analytical articles (`INS-001..003`) remain in `IN_REVIEW` or `DRAFT` states and are properly excluded until evidence packs are attached and reviewed.
2. **Local MiniLM Cold-Start:**
   - First-run model initialization takes ~300ms in Node runtime to instantiate ONNX session weights. Subsequent warm evaluations run in ~4ms.
3. **Pure Keyword Negative Query Precision:**
   - Keyword mode without the quality gate matches unigram tokens in text; users querying conversational negative distractors should use Hybrid mode (`mode=hybrid`) for 0% false-positive rejection.

---

## 15. Verification Results

All test suites and verification commands passed cleanly:

1. **Phase 8J.4 Comprehensive Test Suite (`scratch/test-phase8j4.ts`):**
   - **44 passed, 0 failed** across all 8 verification categories.
2. **Phase 8G.10 Benchmark Regression (`scratch/test-phase8g10.ts`):**
   - **22 passed, 0 failed**; Top-1 100%, MRR 1.000, FP 0%, Duplication 0%.
3. **Phase 8I.6 Research Pipeline Test (`scratch/test-phase8i6.ts`):**
   - **20 passed, 0 failed**.
4. **TypeScript Typecheck (`npx tsc --noEmit`):**
   - **0 errors**.
5. **Next.js Production Build (`npm run build`):**
   - **Exit Code 0**; all 26 static pages rendered cleanly.
6. **Historical Evidence Integrity:**
   - `RUN-001-20260927-Q001-gemini-05.txt`: SHA-256 `fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c` (**100% UNTOUCHED**).
   - `RUN-001-20260927-Q001-gemini-01.txt`: Preserved as quarantined incident artifact; completely isolated from all search indexes.
