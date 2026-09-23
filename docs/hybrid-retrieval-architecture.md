# DIXITH Hybrid Retrieval Architecture & Benchmarking

**Phase:** 8G.8 — Hybrid Retrieval Foundation + Evaluation  
**System:** DIXITH Personal AI Search Knowledge Platform  
**Status:** Implemented & Evaluated (Backend / Search Subsystem Only)  

---

## 1. Architectural Overview & Design Philosophy

Phase 8G.8 introduces a server-side **Hybrid Retrieval Layer** (`lib/search/hybrid.ts`) that fuses deterministic Phase 8F lexical search with Phase 8G.6 dense semantic search.

```
USER QUERY
    │
    ├───► Phase 8F Lexical Retrieval (searchContent)
    │         └── Weighted BM25-style tokens, phrases, taxonomy aliases
    │         └── Returns Entity-level SearchResult[] (Rank 1..N)
    │
    └───► Phase 8G.6 Semantic Retrieval (semanticSearch)
              └── Local ONNX embeddings (Xenova/all-MiniLM-L6-v2)
              └── Cosine similarity over L2-normalized 384d chunk vectors
              └── Returns Chunk-level SemanticSearchResult[]
                        │
                        ▼
            Entity-Level Consolidation
              └── Groups semantic chunks by entityId
              └── Selects top-scoring chunk & excerpt
              └── Assigns consolidated semanticRank (1..M)
                        │
                        ▼
            Reciprocal Rank Fusion (RRF)
              └── RRF(e) = (1 / (K + r_lex)) + (1 / (K + r_sem))
              └── K = 60 (configurable)
                        │
                        ▼
            Publication Safety & Canonical Verification
              └── isIndexable(canonicalEntity.status)
              └── Mandatory exclusion of DRAFT / IN_REVIEW / ARCHIVED
                        │
                        ▼
            Deterministic Ordering & Entity Limit (Top-5)
              └── rrfScore DESC, entityId ASC, slug ASC
```

> [!IMPORTANT]
> **Canonical Source of Truth:** The Git repository data files remain the absolute source of truth. The vector store is a derived artifact, and the hybrid retrieval layer is an orchestration pipeline. Hybrid retrieval never overrides canonical publication state.
> **Public UI Independence:** The public `/search` route remains 100% on Phase 8F lexical search. Phase 8G.8 is an isolated server-side retrieval engine evaluated under test harness before any user-facing integration.

---

## 2. Core Architectural Mechanisms

### 2.1 Why Lexical and Semantic Retrieval are Decoupled
1. **Complementary Strengths:**
   - **Lexical Search (Phase 8F):** High precision for exact technical keywords, camelCase tokens, Schema.org types (`MerchantReturnPolicy`, `LocalBusiness`), and domain acronyms (`JSON-LD`, `E-E-A-T`, `hreflang`).
   - **Semantic Search (Phase 8G.6):** High recall for natural language phrasing, conceptual intent, and exploratory vocabulary where exact tokens are not present.
2. **Failure Isolation:** If the ONNX runtime or local vector index is missing or incompatible, lexical search functions unimpeded without throwing errors.

### 2.2 Why Raw Scores are NOT Combined Directly
- Lexical scores are unbounded integers derived from field weights ($Title=25, Summary=14, Content=6$).
- Semantic scores are cosine similarity floats bounded between $-1.0$ and $1.0$ (typically $0.40 - 0.77$).
- Linear interpolation ($0.5 \times S_{lex} + 0.5 \times S_{sem}$) suffers from scale mismatch, query length variance, and arbitrary coefficient tuning.

### 2.3 Reciprocal Rank Fusion (RRF)
Instead of blending raw scores, Phase 8G.8 implements rank-based fusion:
$$\text{RRF}(e) = \sum_{m \in \{\text{lexical}, \text{semantic}\}} \frac{1}{K + r_m(e)}$$
- **$K = 60$** (`RRF_DEFAULT_K`): Standard smoothing constant dampening the impact of high outlier ranks.
- **Single-system presence:** If an entity appears only in lexical results, its semantic contribution is $0$; if only in semantic results, its lexical contribution is $0$.
- **Corroborated presence:** When an entity is surfaced by both systems, its RRF score doubles, providing an automatic boost for corroborated relevance.

### 2.4 Entity-Level Consolidation
Phase 8G.6 semantic retrieval indexes multiple chunks per entity (6 chunks per Professional Experience entity). Direct chunk-to-entity fusion would cause a single entity to flood the Top-5 ranks.
Phase 8G.8 introduces `consolidateSemanticChunks()`:
1. Semantic chunks are grouped by `entityId`.
2. The chunk with the highest cosine similarity is selected as the representative evidence.
3. The entity is assigned a single 1-based `semanticRank` reflecting the earliest rank of its strongest chunk.
4. The winning chunk's ID, excerpt, and section are preserved for transparency and future RAG citation.
5. **Result Guarantee:** An entity appears at most ONCE in the final hybrid result set.

### 2.5 Defense-in-Depth Publication Safety
Publication safety is enforced at three distinct layers:
1. **Lexical Gate:** `buildSearchIndex()` filters documents with `isIndexable(status)`.
2. **Semantic Gate:** `semanticSearch()` filters with `{ status: "PUBLISHED" }` and double-checks `isIndexable(metadata.status)`.
3. **Hybrid Consolidation Gate:** For every candidate entity, `hybridSearch()` resolves the canonical entity directly from `data/` and enforces `isIndexable(canonical.status)`. `DRAFT`, `IN_REVIEW`, and `ARCHIVED` entities are unconditionally excluded.

### 2.6 Graceful Degradation & Fallbacks
- **Lexical OK + Semantic OK:** Full hybrid RRF fusion (`retrievalSignals: "both" | "lexical" | "semantic"`).
- **Lexical OK + Semantic Unavailable:** Automatically falls back to lexical ranking with `retrievalSignals: "lexical"`.
- **Lexical Error + Semantic OK:** Automatically falls back to semantic ranking with `retrievalSignals: "semantic"`.
- **Both Unavailable:** Returns deterministic empty response with diagnostic telemetry; never throws.

---

## 3. Comparative Benchmark Results

Evaluation was executed across the standardized **24-query evaluation dataset** (`lib/semantic/evaluation-dataset.ts`):
- 18 positive queries (6 Exact Intent, 6 Conceptual Paraphrase, 6 Vocabulary / Acronym)
- 6 negative distractor queries

### 3.1 Primary Performance Matrix

| System | Top-1 Hit Rate | Top-3 Hit Rate | Top-5 Hit Rate | MRR | Positive Zero-Results | Negative False Positive Rate | Entity Duplication in Top-5 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Phase 8F Lexical** | **100.0%** (18/18) | **100.0%** (18/18) | **100.0%** (18/18) | **1.000** | 0 | 100.0% (6/6) | **0.0%** |
| **Phase 8G.6 Semantic (0.50)** | **88.9%** (16/18) | **88.9%** (16/18) | **88.9%** (16/18) | **0.889** | 2 | **0.0%** (0/6) | 55.6% |
| **Hybrid (Threshold 0.40)** | **100.0%** (18/18) | **100.0%** (18/18) | **100.0%** (18/18) | **1.000** | 0 | 100.0% (6/6) | **0.0%** |
| **Hybrid (Threshold 0.45)** | **100.0%** (18/18) | **100.0%** (18/18) | **100.0%** (18/18) | **1.000** | 0 | 100.0% (6/6) | **0.0%** |
| **Hybrid (Threshold 0.50)** | **100.0%** (18/18) | **100.0%** (18/18) | **100.0%** (18/18) | **1.000** | 0 | 100.0% (6/6) | **0.0%** |

### 3.2 Category-Level Breakdown (Top-1 Hit Rate)

| System | Exact Intent (n=6) | Conceptual Paraphrase (n=6) | Vocabulary / Acronym (n=6) | Negative Distractor (n=6) |
| :--- | :---: | :---: | :---: | :---: |
| **Phase 8F Lexical** | 100.0% (6/6) | 100.0% (6/6) | 100.0% (6/6) | 0.0% (6/6 false positives) |
| **Phase 8G.6 Semantic (0.50)** | 100.0% (6/6) | 100.0% (6/6) | 66.7% (4/6) | **100.0%** (0 false positives) |
| **Hybrid (0.40)** | **100.0%** (6/6) | **100.0%** (6/6) | **100.0%** (6/6) | 0.0% (6/6 false positives) |
| **Hybrid (0.45)** | **100.0%** (6/6) | **100.0%** (6/6) | **100.0%** (6/6) | 0.0% (6/6 false positives) |
| **Hybrid (0.50)** | **100.0%** (6/6) | **100.0%** (6/6) | **100.0%** (6/6) | 0.0% (6/6 false positives) |

---

## 4. Key Engineering Insights

### 4.1 Hybrid Closes the Semantic Acronym Gap
- In Phase 8G.7, semantic retrieval dropped to 66.7% on specialized vocabulary queries (`MerchantReturnPolicy JSON-LD`, `E-E-A-T clinical disambiguation`) because the dense embedding model scored them around $0.45$.
- Hybrid retrieval restores **100% Top-1 accuracy** across all vocabulary queries because Phase 8F lexical token matching immediately surfaces the exact Schema.org types, which RRF fuses into the top rank.

### 4.2 Entity Duplication is Completely Solved
- In Phase 8G.6 semantic retrieval, 55.6% of result sets contained multiple chunks from the same entity, exhausting Top-5 result slots.
- Hybrid consolidation reduced duplicate entities in Top-5 to **0.0%**, ensuring every returned slot represents a distinct canonical entity.

### 4.3 Negative Distractor Vulnerability & Phase 8G.9 Resolution
- Pure semantic retrieval achieved a **0.0% false positive rate** on negative queries because cosine distances ($< 0.35$) were cleanly suppressed by the 0.50 threshold.
- In Phase 8G.8, pure lexical retrieval exhibited a **100.0% false positive rate** on negative queries because conversational words ("how", "to", "for", "in") matched token occurrences in the corpus, and standard RRF propagated these uncorroborated single-signal lexical matches into the hybrid output.
- **Phase 8G.9 Resolution**: Implemented a dedicated **Lexical Quality Gate** (`lib/search/lexical-quality.ts`). The gate evaluates substantive domain token overlap, multi-factor phrase provenance, and taxonomy alias matching before RRF fusion, successfully reducing the hybrid negative false positive rate from **100.0% to 0.0%** across both canonical and expanded negative distractor suites while maintaining 100% recall on genuine positive queries.

---

## 5. Architectural Status Matrix

| Component | Status | Details |
| :--- | :---: | :--- |
| **Reciprocal Rank Fusion (RRF)** | **IMPLEMENTED** | Configurable $K=60$, rank-based fusion across lexical and semantic candidates. |
| **Entity Consolidation** | **IMPLEMENTED** | Groups chunks by `entityId`, preserves highest similarity score and top chunk excerpt. |
| **Lexical Quality Gate (8G.9)** | **IMPLEMENTED** | Multi-factor substantive token gating; rejects generic conversational noise and eliminates negative false positives (100% -> 0%). |
| **Defense-in-Depth Safety** | **IMPLEMENTED** | 3-layer publication check (`isIndexable`). Draft/review content 100% blocked. |
| **Graceful Degradation** | **IMPLEMENTED** | Seamless fallback if semantic index or lexical search is unavailable. |
| **Controlled UI Integration (8G.10)** | **IMPLEMENTED** | Opt-in via `/search?q=...&mode=hybrid` while preserving `/search?q=...` keyword default. Server-side only, accessible mode toggle, signal badges, canonical excerpts. |
| **RAG / Ask DIXITH Context** | **FUTURE** | Grounded context generation, LLM synthesis, citation extraction. Strictly reserved for future phases. |
