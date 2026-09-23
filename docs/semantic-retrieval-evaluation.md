# DIXITH Semantic Retrieval Evaluation & Benchmarking Report

**Phase:** 8G.7 — Semantic Retrieval Evaluation & Benchmarking  
**System:** DIXITH Personal AI Search Knowledge Platform  
**Model:** `Xenova/all-MiniLM-L6-v2` (384 dimensions, L2-normalized)  
**Storage:** Persistent Local Vector Store (`data/derived/semantic-index.json`)  
**Status:** Completed & Measured  

> [!NOTE]
> **Dataset Limitation Notice:** This is an early engineering evaluation on the currently published DIXITH corpus (3 published entities, 18 indexed chunks), not a statistically representative benchmark. Results reflect baseline measurement of the current implementation and must not be extrapolated as universal performance claims.

---

## 1. Evaluation Scope & Core Objectives
The primary objective of Phase 8G.7 is to empirically measure the baseline retrieval behavior of the local semantic search pipeline implemented in Phase 8G.6 prior to considering hybrid scoring or ranking alterations.

The evaluation specifically measures:
1. **Top-K Hit Rates:** Frequency with which the intended knowledge entity appears at rank 1, rank $\le 3$, and rank $\le 5$.
2. **Negative Distractor Rejection:** Ability of the similarity threshold to suppress out-of-corpus queries with zero false positives.
3. **Threshold Sensitivity:** Performance trade-offs across five discrete threshold values ($0.40, 0.45, 0.50, 0.55, 0.60$).
4. **Category Breakdown:** Differential performance across exact technical intent, conceptual paraphrases, and specialized vocabulary/acronyms.
5. **Granularity & Duplication:** Distribution of chunks and entity clustering within Top-K result windows.
6. **System Invariants:** Monotonicity across thresholds, score boundary validity, publication safety, and deterministic consistency.

---

## 2. Corpus & Ground-Truth Methodology

### 2.1 Corpus Specification
- **Published Entities (3):**
  - `PE-001`: Healthcare Search Architecture (`slug: healthcare-search-architecture`)
  - `PE-002`: International Search Architecture (`slug: international-search-architecture`)
  - `PE-003`: E-Commerce Search & Generative Discovery (`slug: ecommerce-search-generative-discovery`)
- **Published Chunks (18):** Exactly 6 chunks per entity derived from canonical sections (`overview`, `context`, `responsibilities`, `technical-focus`, `search-focus`, `governance`).
- **Unpublished Entities (9):** `PE-004` through `PE-012` remain strictly gated as `DRAFT` and are not indexed.

### 2.2 Ground-Truth Definition
Ground truth was established manually and deterministically in [`lib/semantic/evaluation-dataset.ts`](file:///c:/paila%20Dixith%20kumar/lib/semantic/evaluation-dataset.ts):
- For positive queries, expected entity IDs (`expectedEntityIds`) and expected top chunk IDs (`expectedChunkIds`) were curated directly from canonical entity content.
- For negative distractor queries, expected relevance was explicitly flagged as `expectedRelevant = false` with empty expected IDs.
- **Independence Guarantee:** Expected answers were defined independently of the retrieval engine to avoid circular evaluation.

---

## 3. Evaluation Dataset Structure

The benchmark consists of **24 structured queries** across four balanced categories (6 queries per category, 25% distribution each):

| Category | Query Count | Expected Relevant | Description |
| :--- | :---: | :---: | :--- |
| **A. Exact / Near-Exact Intent** | 6 | Yes | Verbatim or closely aligned technical intent matching published titles and focus areas. |
| **B. Conceptual Paraphrase** | 6 | Yes | Alternative phrasing and conceptual synonyms describing the same technical knowledge. |
| **C. Vocabulary / Acronym Variation** | 6 | Yes | Short-form, camelCase, or acronym-heavy terminology (e.g., `hreflang`, `JSON-LD`, `E-E-A-T`). |
| **D. Negative Distractors** | 6 | No | Out-of-corpus queries with zero conceptual overlap (e.g., cooking, physics, sports, car repair). |
| **Total** | **24** | **18 Pos / 6 Neg** | Complete evaluation set. |

---

## 4. Baseline Evaluation Results (Threshold = 0.50, Limit = 5)

### 4.1 Overall Hit Rates
On the 18 positive test queries at the default operational threshold ($0.50$):

- **Top-1 Hit Rate:** **88.9%** (16 / 18 queries)
- **Top-3 Hit Rate:** **88.9%** (16 / 18 queries)
- **Top-5 Hit Rate:** **88.9%** (16 / 18 queries)

*Observation:* Because each published entity contains 6 indexed chunks, whenever an entity was retrieved, its top matching chunk appeared at Rank 1. In no positive test case did a relevant entity appear at Rank 2 or 3 without also appearing at Rank 1.

### 4.2 Performance by Query Category

| Category | Queries | Top-1 Hit Rate | Top-3 Hit Rate | Top-5 Hit Rate | Zero-Result Queries |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Exact / Near-Exact Intent** | 6 | **100.0%** (6/6) | **100.0%** (6/6) | **100.0%** (6/6) | 0 |
| **Conceptual Paraphrase** | 6 | **100.0%** (6/6) | **100.0%** (6/6) | **100.0%** (6/6) | 0 |
| **Vocabulary / Acronym Variation** | 6 | **66.7%** (4/6) | **66.7%** (4/6) | **66.7%** (4/6) | 2 |

#### Analysis of Vocabulary Variations
At threshold $0.50$, two specialized acronym/vocabulary queries produced zero results:
1. `VOCAB-003`: *"MerchantReturnPolicy JSON-LD"* (Expected: `PE-003`)
2. `VOCAB-005`: *"E-E-A-T clinical disambiguation"* (Expected: `PE-001`)

Both queries represent highly compressed, acronym-dense phrases where the dense embedding model scored the closest chunks between $0.43$ and $0.47$ (falling just below the $0.50$ cutoff).

### 4.3 Negative Distractor Metrics
On the 6 out-of-corpus negative queries:

- **False Positive Rate:** **0.0%** (0 / 6 queries surfaced any results)
- **Zero Result Rate:** **100.0%** (6 / 6 queries correctly returned empty result sets)
- **Maximum Negative Score:** Highest similarity score across all negative queries was $< 0.35$, cleanly separated from positive thresholds.

---

## 5. Threshold Sensitivity Analysis

The identical 24-query evaluation set was executed across five discrete thresholds ($0.40$ to $0.60$):

| Threshold | Positive Top-1 | Positive Top-3 | Positive Top-5 | Positive Zero-Results | Negative False Positives |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **0.40** | **100.0%** (18/18) | **100.0%** (18/18) | **100.0%** (18/18) | 0 | 0 (0.0%) |
| **0.45** | **88.9%** (16/18) | **88.9%** (16/18) | **88.9%** (16/18) | 2 | 0 (0.0%) |
| **0.50** (Default) | **88.9%** (16/18) | **88.9%** (16/18) | **88.9%** (16/18) | 2 | 0 (0.0%) |
| **0.55** | **66.7%** (12/18) | **66.7%** (12/18) | **66.7%** (12/18) | 6 | 0 (0.0%) |
| **0.60** | **50.0%** (9/18) | **50.0%** (9/18) | **50.0%** (9/18) | 9 | 0 (0.0%) |

### Observations on Threshold Trade-Offs
- **Threshold 0.40:** Yielded 100% Top-1 recall across all 18 positive queries while maintaining 0% false positives on negative distractors.
- **Threshold 0.50:** Filtered out edge-case vocabulary acronym queries while preserving 100% accuracy on natural language exact intent and paraphrases.
- **Thresholds $\ge 0.55$:** Significantly truncated positive recall (dropping to 66.7% at 0.55 and 50.0% at 0.60) due to overly aggressive cutoffs on valid semantic paraphrases.

---

## 6. Similarity Score Distribution

Descriptive statistics for similarity scores across the evaluation runs:

| Result Subset | Count | Min | Max | Mean | Median |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Relevant Top-1 Matches (at 0.50)** | 16 | 0.5050 | 0.7717 | 0.6212 | 0.6118 |
| **Exact Intent Top-1 Matches** | 6 | 0.6535 | 0.7717 | 0.6974 | 0.6845 |
| **Conceptual Paraphrase Top-1 Matches** | 6 | 0.5050 | 0.6686 | 0.5758 | 0.5636 |
| **Negative Distractors (Unfiltered)** | 6 | 0.0512 | 0.3241 | 0.1784 | 0.1650 |

*Score Separation:* A clear empirical margin exists between negative distractors (maximum score: $0.3241$) and relevant positive matches (minimum score: $0.5050$).

---

## 7. Granularity & Entity Duplication Observations

### 7.1 Chunk Granularity
- **Section Alignment:** When queries targeted specific responsibilities or architecture layers (e.g., `EXACT-002` targeting healthcare schema), the top chunk consistently mapped to the corresponding section (`overview` or `responsibilities`).
- **Section Distribution:** Top-1 results across positive queries distributed across sections:
  - `overview`: 6 queries
  - `context`: 3 queries
  - `responsibilities`: 3 queries
  - `technical-focus`: 3 queries
  - `search-focus`: 1 query

### 7.2 Entity Clustering in Top-5
- In 100% of positive queries returning multiple results, all Top-5 chunks originated from the **same single entity**.
- *Example:* For query `EXACT-001`, the Top-5 returned chunks were all from `PE-002` (`#context#0`, `#responsibilities#0`, `#overview#0`, `#technical-focus#0`, `#search-focus#0`).
- *Engineering Insight:* Without entity deduplication or grouping, a single strongly matching entity occupies all Top-K slots. For corpus expansion, an entity-level diversity filter or group-by aggregation will be necessary.

---

## 8. Invariant & Reliability Verifications

1. **Monotonicity:** Verified. For all 24 queries, results at threshold $T_{i+1}$ were a strict mathematical subset of results at $T_i$ ($\text{Results}_{0.60} \subseteq \text{Results}_{0.55} \subseteq \text{Results}_{0.50} \subseteq \text{Results}_{0.45} \subseteq \text{Results}_{0.40}$).
2. **Score Bounds:** Verified. All similarity scores fell strictly within $[-1.0, 1.0]$ with zero `NaN`, `Infinity`, or invalid float values.
3. **Determinism:** Verified. Multiple consecutive executions of the evaluation set produced identical rank orders, chunk IDs, and similarity scores.
4. **Publication Safety:** Verified. Synthetic `DRAFT` and `IN_REVIEW` records injected into temporary test stores were 100% excluded from retrieval.
5. **Graceful Failures:** Verified. Missing index files and mismatched model headers produced structured failure codes (`semantic_index_unavailable`, `semantic_index_incompatible`) without exceptions.

---

## 9. Limitations

The following limitations must be recognized when interpreting this evaluation:
1. **Small Corpus Size:** Only 3 published entities and 18 chunks. Real-world dynamics may shift as articles, research items, and guides are indexed.
2. **Manual Evaluation Set:** The 24 queries were curated manually and do not reflect live user telemetry.
3. **Single Embedding Model:** Evaluated solely on `Xenova/all-MiniLM-L6-v2` (384d). No comparative inference was performed against other models.
4. **Acronym Sensitivity:** Dense embeddings exhibit reduced sensitivity to short acronym-only queries compared to full-sentence queries, confirming the architectural necessity of hybrid lexical search.

---

## 10. Recommendations for Phase 8G.8 (Hybrid Retrieval)

Based on factual evaluation findings:
1. **Reciprocal Rank Fusion (RRF) / Blended Scoring:** Implement hybrid blending where Phase 8F BM25 lexical search provides high precision for exact acronyms (`JSON-LD`, `E-E-A-T`, `hreflang`), while Phase 8G.6 semantic search provides recall for conceptual paraphrases.
2. **Threshold Preservation:** Maintain $0.50$ as the default semantic threshold, or consider $0.45$ in hybrid contexts where lexical signals can corroborate lower-confidence semantic matches.
3. **Entity Diversification:** Evaluate grouping chunk results by `entityId` so that multiple chunks from the same document do not exhaust Top-K visibility.
