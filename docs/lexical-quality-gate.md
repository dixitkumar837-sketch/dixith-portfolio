# Phase 8G.9 — Lexical Quality Gate & Negative Query Rejection Architecture

## 1. Executive Summary & Problem Formulation

In Phase 8G.8, the DIXITH Personal AI Search Knowledge Platform implemented hybrid retrieval by fusing deterministic Phase 8F lexical retrieval with Phase 8G.6 dense semantic retrieval via Reciprocal Rank Fusion (RRF):

$$\text{RRF}(e) = \sum_{s \in \{\text{lex}, \text{sem}\}} \frac{1}{k + r_s(e)}$$

While standard RRF yielded optimal performance across positive informational queries (100% Top-1 hit rate, MRR = 1.000), benchmark evaluation exposed a structural vulnerability:

### The Lexical Negative Leakage Problem
1. **Conversational Function Word Overlap**: Natural language negative distractor queries (e.g., *"how to bake sourdough bread with whole wheat flour at high altitude"*, *"how to replace a broken alternator belt in a Honda Civic"*) contain generic conversational tokens (*"how"*, *"to"*, *"with"*, *"at"*, *"high"*, *"in"*, *"a"*).
2. **Phase 8F Lexical Scoring**: In Phase 8F lexical matching, documents receive points whenever any query token matches target fields (e.g., `TOKEN_CONTENT: 3`, `TOKEN_SUMMARY: 6`). Consequently, entities in the published corpus that contain words like *"to"* or *"with"* or *"high"* (e.g. *"high quality"*, *"high volume"*) scored positive lexical points.
3. **Ungated RRF Fusion**: Because standard RRF unconditionally awards $1 / (k + r_{\text{lex}})$ to any entity returned by lexical retrieval, all negative queries surfaced with non-zero hybrid scores ($\approx 0.016393$), resulting in a **100% false positive rate on negative queries**.
4. **Failure of Global Cutoffs**: A naive global score cutoff cannot solve this problem because short, high-value domain queries (e.g., *"SEO"*, *"RAG"*, *"E-E-A-T"*, *"hreflang"*, *"JSON-LD"*) naturally produce lower raw cumulative scores than lengthy conversational negative queries with multiple weak token hits.

Phase 8G.9 introduces a dedicated **Lexical Quality Gate** (`lib/search/lexical-quality.ts`) that intercepts raw Phase 8F candidates before RRF fusion, validating domain substance while preserving 100% recall on genuine queries.

---

## 2. Architectural Boundaries & Non-Negotiable Invariants

```
                             User Query
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       Phase 8F Lexical Search         Phase 8G.6 Semantic Search
       (Deterministic, Unchanged)       (Local all-MiniLM-L6-v2)
                 │                               │
                 ▼                               ▼
      Raw Lexical Candidates              Raw Semantic Chunks
                 │                               │
                 ▼                               ▼
   ┌───────────────────────────┐      Consolidate to Entity Level
   │ Phase 8G.9 Quality Gate   │      (Highest Similarity Chunk)
   │ - Substantive Token Check │                 │
   │ - Multi-Factor Overlap    │                 │
   │ - Rejection of Noise      │                 │
   └─────────────┬─────────────┘                 │
                 │                               │
                 ▼                               ▼
      Vetted Lexical Candidates        Consolidated Semantic Entities
                 │                               │
                 └───────────────┬───────────────┘
                                 ▼
                     Reciprocal Rank Fusion (RRF)
                                 │
                                 ▼
                  Canonical Publication Safety Gate
                        isIndexable(status)
                                 │
                                 ▼
                    Deterministic Tie-Breaking
                     (rrfScore DESC, entityId ASC)
                                 │
                                 ▼
                       Hybrid Search Results
```

### Invariants:
1. **Decoupled Preservation of Phase 8F**: Phase 8F (`lib/search.ts`) scoring weights, taxonomy aliases, tokenization, and ranking logic remain strictly untouched.
2. **Git Canonical Source of Truth**: Data files in `data/` remain the exclusive authority.
3. **Publication Safety**: Defense-in-depth enforcement of `isIndexable(status)` (only `PUBLISHED` content is indexable; `DRAFT` and `IN_REVIEW` are strictly excluded).
4. **Local Execution**: 100% local CPU execution. Zero external AI APIs, zero external vector databases, zero employer or corporate resources.
5. **No Public UI Regression**: The public `/search` route remains decoupled and unaffected.

---

## 3. Lexical Quality Gate Architecture (`lib/search/lexical-quality.ts`)

The gate evaluates candidate documents through a multi-factor decision matrix based on token categorization, structural match provenance, and substantive overlap ratios.

### 3.1 Token Categorization

#### A. Generic Conversational Tokens (`GENERIC_CONVERSATIONAL_TOKENS`)
A curated set of function words, interrogatives, prepositions, auxiliary verbs, and conversational filler words:
- **Interrogatives**: *how, what, where, when, why, who, which, whom, whose*
- **Auxiliary/State Verbs**: *is, are, was, were, be, been, being, do, does, did, have, has, had, can, could, will, would, shall, should, may, might, must*
- **Articles & Prepositions**: *the, a, an, to, for, of, in, on, at, by, with, from, about, into, through, during, before, after, above, below, up, down, out, off, over, under, between, against*
- **Conjunctions & Pronouns**: *and, or, but, so, if, then, because, as, until, while, it, its, this, that, these, those, they, them, their, we, us, our, you, your, he, him, his, she, her*
- **Generic Modifiers**: *not, no, nor, none, all, any, both, each, every, few, more, most, other, some, such, only, same, than, too, very, just, best, good, better, great, high, low, new, old, many, much*

#### B. Protected Domain Terms (`PROTECTED_DOMAIN_TERMS`)
Core terms and acronyms that must NEVER be discarded as stopwords or noise:
- `seo`, `aeo`, `geo`, `rag`, `eeat`, `e-e-a-t`, `hreflang`, `jsonld`, `json-ld`, `schema`, `taxonomy`
- `crawl`, `crawler`, `crawling`, `index`, `indexing`, `indexation`, `sitemap`, `sitemaps`
- `entity`, `entities`, `search`, `retrieval`, `chunking`, `vector`, `vectors`, `embedding`, `embeddings`
- `llm`, `discovery`, `structured`, `data`, `canonical`, `canonicalization`, `catalog`, `catalogs`
- `ecommerce`, `e-commerce`, `healthcare`, `clinical`, `medical`, `hospital`, `merchant`, `offer`, `product`
- `dixith`, `google`, `chatgpt`, `perplexity`, `claude`, `gemini`, `copilot`, `citations`, `overviews`, `grounding`

#### C. Substantive Token Extraction (`extractSubstantiveTokens`)
Given query tokens, substantive tokens are defined as:
1. Compact domain acronyms (e.g., query `"E-E-A-T"` yields compact token `"eeat"`).
2. Explicitly protected terms in `PROTECTED_DOMAIN_TERMS`.
3. Non-generic tokens with length $\ge 2$.

---

### 3.2 Multi-Factor Decision Matrix

For each candidate result $(R, Q, D)$:

```
                                 Evaluate Candidate
                                         │
                   Is query empty or has 0 substantive tokens?
                                 ├── YES ──► REJECT (generic_conversational_query)
                                 │
                         Is high-value phrase match?
                    (title-phrase, summary-phrase, headings-phrase)
                                 ├── YES ──► ACCEPT (phrase_match_high_confidence)
                                 │
                       Did 0 substantive tokens match doc?
                                 ├── YES ──► REJECT (zero_substantive_tokens_matched)
                                 │
                   Is short query (1-2 substantive tokens)?
                                 ├── YES ──► ACCEPT (short_query_substantive_match)
                                 │
               Is multi-token query (>= 3 substantive tokens)?
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
Ratio >= 0.33 AND Matched >= 2            Ratio < 0.33 OR Matched < 2
           │                                           │
           ▼                                           ▼
ACCEPT (multi_token_substantive_overlap)    REJECT (insufficient_substantive_overlap)
```

#### Why Multi-Token Constraints Prevent Modifiers From Leaking:
Consider the negative distractor query:
> *"history of Renaissance architecture in Florence Italy"*

- Substantive query tokens: `history`, `renaissance`, `architecture`, `florence`, `italy` (5 tokens).
- Target entities: `PE-001` (*"Healthcare Search Architecture"*), `PE-002` (*"International Search Architecture"*).
- Matched substantive tokens: only `["architecture"]` (1 token).
- Substantive overlap ratio: $1 / 5 = 0.20$ ($20\%$).
- Decision: $0.20 < 0.33$ and $1 < 2 \implies$ **REJECTED** with reason `insufficient_substantive_overlap`.

In contrast, consider the positive multi-token query:
> *"XML sitemap index partitioning"*
- Substantive tokens: `xml`, `sitemap`, `index`, `partitioning` (4 tokens).
- Matched substantive tokens in `PE-002`: `xml`, `sitemap`, `index`, `partitioning` (4 tokens).
- Substantive overlap ratio: $4 / 4 = 1.00$ ($100\%$) $\ge 0.33$, matched $4 \ge 2 \implies$ **ACCEPTED**.

---

## 4. Diagnostic Telemetry & Explainability

`HybridSearchDiagnostics` is augmented with pre-gate and post-gate telemetry:
```typescript
export interface HybridSearchDiagnostics {
  lexicalCount: number;         // Post-gate count (preserves backward compatibility)
  lexicalPreGateCount?: number;  // Raw Phase 8F candidate count
  lexicalPostGateCount?: number; // Vetted candidate count surviving quality gate
  semanticChunksCount: number;
  semanticConsolidatedCount: number;
  lexicalAvailable: boolean;
  semanticAvailable: boolean;
  semanticReason?: SemanticRetrievalFailureReason;
}
```

Each evaluated result receives an explainable `LexicalQualityEvaluation`:
```typescript
export interface LexicalQualityEvaluation {
  entityId: string;
  accepted: boolean;
  reason: string;
  score: number;
  substantiveTokens: string[];
  matchedSubstantiveTokens: string[];
  substantiveRatio: number;
  isPhraseMatch: boolean;
  isTaxonomyAliasMatch: boolean;
  isTopicMatch: boolean;
  isTitleMatch: boolean;
}
```

---

## 5. Comparative Evaluation & Benchmark Results

Benchmarked across **34 queries** (18 positive across 3 categories + 16 negative distractors):

### 5.1 Retrieval Performance Comparison

| System | Top-1 Hit Rate | Top-3 Hit Rate | Mean Reciprocal Rank (MRR) | Canonical Negative FP (6) | Full Negative FP (16) | Entity Duplication |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Phase 8F Lexical** | 100.0% | 100.0% | 1.000 | 6/6 (100.0%) | 16/16 (100.0%) | 0.0% |
| **Phase 8G.6 Semantic** | 88.9% | 88.9% | 0.889 | 0/6 (0.0%) | 0/16 (0.0%) | 0.0% |
| **Phase 8G.8 Hybrid (Ungated)** | 100.0% | 100.0% | 1.000 | 6/6 (100.0%) | 16/16 (100.0%) | 0.0% |
| **Phase 8G.9 Hybrid (Gated)** | **100.0%** | **100.0%** | **1.000** | **0/6 (0.0%)** | **0/16 (0.0%)** | **0.0%** |

### 5.2 Category Top-1 Hit Rate Breakdown (Phase 8G.9 Gated Hybrid)

- **Exact Intent** ($n=6$): **100.0%**
- **Conceptual Paraphrase** ($n=6$): **100.0%**
- **Vocabulary Variation** ($n=6$): **100.0%**
- **Negative Distractors** ($n=16$): **0.0% False Positive Rate** (16/16 rejected)

---

## 6. Verification & Invariant Enforcement

1. **Unit & Functional Suite (`scratch/test-phase8g9.ts`)**: 19/19 tests passed cleanly.
2. **Regression Suite**:
   - `scratch/test-phase8g5.ts`: Passed (all local embedding & indexing tests).
   - `scratch/test-phase8g6.ts`: Passed (35/35 semantic retrieval tests).
   - `scratch/test-phase8g7.ts`: Passed (6/6 calibration & monotonicity checks).
   - `scratch/test-phase8g8.ts`: Passed (25/25 hybrid retrieval tests).
3. **Build Integrity**: `npm run build` completed with code 0 across 26/26 routes; First Load JS shared by all remains 87.3 kB.
4. **Resource Boundary**: Zero external AI APIs, zero external databases, zero employer infrastructure or secrets used.
