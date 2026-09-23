# DIXITH Semantic Retrieval Architecture

## 1. Overview & Purpose

This document outlines the architecture for the **DIXITH Semantic Retrieval Infrastructure** (Phase 8G.2).

DIXITH is a Personal AI Search Knowledge Platform designed to maintain complete independence from corporate or employer-owned infrastructure while achieving production-grade retrieval performance.

Phase 8G.2 establishes the **plumbing and abstraction layers** only. It introduces zero dependencies, requires no external network calls, and preserves offline builds and tests. Content indexing, chunking, and query execution occur in subsequent phases (8G.3+).

---

## 2. Core Architectural Invariants

### 2.1 Canonical Source Invariant
- **Git and Markdown/Data files remain the sole canonical source of truth.**
- The vector database is strictly a **derived retrieval index/cache**.
- If the vector store is lost, dropped, or corrupted, the system can rebuild the entire index deterministically from canonical repository files.
- The website and existing keyword search (`/search`) continue to function with 100% fidelity even if the vector store is completely offline or unconfigured.

### 2.2 Publication Integrity Gate
- Only published content may ever be indexed or retrieved:
  $$\text{isIndexable}(\text{status}) = \text{true} \iff \text{status} = \text{"PUBLISHED"}$$
- Drafts, archived, deprecated, or private content are excluded before chunking and rejected at the query filter boundary.

### 2.3 Strict Credential & Vendor Isolation
- DIXITH is a strictly personal project.
- No corporate/employer accounts, credits, API keys, or infrastructure are ever referenced or utilized.
- All external API secrets are server-only environment variables (`process.env`) and are never leaked to client bundles or browser endpoints.

### 2.4 Offline-First & Zero New Dependencies
- Vector math (L2 normalization, cosine similarity) and hashing are implemented using native TypeScript and Node.js built-ins.
- Next.js static export and build pipelines (`npm run build`) do not require API keys or active database connections.

---

## 3. Core Abstractions

### 3.1 `EmbeddingProvider` (`lib/semantic/types.ts`)
```typescript
export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
```
Isolates text vectorization from any specific vendor (e.g. Gemini, OpenAI, Cloudflare Workers AI). Implementations produce unit-length numeric arrays of fixed dimensionality.

### 3.2 `VectorStore` (`lib/semantic/types.ts`)
```typescript
export interface VectorStore {
  readonly name: string;
  upsert(records: VectorRecord[]): Promise<void>;
  delete(ids: string[]): Promise<void>;
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>;
  isAvailable(): Promise<boolean>;
}
```
Isolates vector storage and similarity search from database engines (e.g. Supabase pgvector, Cloudflare Vectorize, or in-memory stores). All searches support metadata filtering (`status`, `entityType`, `topics`) to enforce publication rules at query time.

### 3.3 Vector Record & Metadata Model
Each indexed vector record contains:
- `id`: Stable chunk identifier (`${entityId}#${section}#${index}`).
- `values`: Numeric embedding array.
- `metadata`:
  - `chunkId`: Stable identifier.
  - `entityId`: Canonical entity ID (e.g., `PE-001`).
  - `entityType`: Canonical entity type (`article`, `guide`, `research`, etc.).
  - `slug`: Canonical routing slug.
  - `title`: Content title.
  - `section`: Heading or content block identifier.
  - `heading`: Section heading if applicable.
  - `topics`: List of topic tags.
  - `sourceIds`: Citations and source references.
  - `status`: Content status (must be `"PUBLISHED"` to be retrieved).
  - `contentHash`: Hash of the source chunk for change detection and incremental indexing.
  - `content`: Optional text snippet for preview/re-ranking.

---

## 4. Configuration & Factory Architecture

```
                    ┌──────────────────────────┐
                    │ Environment Variables     │
                    │ (EMBEDDING_PROVIDER,     │
                    │  VECTOR_STORE, etc.)      │
                    └────────────┬─────────────┘
                                 │
                     ┌───────────▼────────────┐
                     │   lib/semantic/config  │
                     │  getSemanticConfig()   │
                     └──────┬────────────┬────┘
                            │            │
             ┌──────────────┘            └─────────────┐
             ▼                                         ▼
┌─────────────────────────┐               ┌─────────────────────────┐
│ lib/semantic/           │               │ lib/semantic/           │
│ provider-factory.ts     │               │ vector-store-factory.ts │
│ getEmbeddingProvider()  │               │ getVectorStore()        │
└────────────┬────────────┘               └────────────┬────────────┘
             │                                         │
     ┌───────┴───────┐                         ┌───────┴───────┐
     ▼               ▼                         ▼               ▼
MockProvider       null (Offline)        InMemoryStore       null (Offline)
(Live provider)                          (pgvector store)
```

- When `EMBEDDING_PROVIDER="none"` (or unset), `getEmbeddingProvider()` returns `null`.
- When `VECTOR_STORE="none"` (or unset), `getVectorStore()` returns `null`.
- When `EMBEDDING_PROVIDER="mock"` and `VECTOR_STORE="mock"|"memory"`, fully working mock implementations are instantiated for local tests and evaluations without API keys.

---

## 5. Phase 8G.5 — Local Semantic Index

> **The local semantic index is a derived retrieval artifact. Canonical DIXITH content remains the source of truth.**

### 5.1 Architecture Overview
Phase 8G.5 establishes a real, local, meaningful semantic embedding pipeline and a persistent local vector store without relying on any external cloud databases or third-party AI APIs.

```
DIXITH Canonical Content (Git/Data)
                 │
          isIndexable()
                 │
       Semantic Chunker (8G.3)
                 │
   LocalEmbeddingProvider (Transformers.js)
                 │
     LocalVectorStore (JSON/Disk)
                 │
    data/derived/semantic-index.json
                 │
                 ▼
     [Ready for Phase 8G.6 Retrieval]
```

### 5.2 Selected Embedding Model & Package
- **Package:** `@huggingface/transformers` (Transformers.js v4).
- **Model:** `Xenova/all-MiniLM-L6-v2`.
- **Dimensions:** 384 dimensions.
- **Rationale:** Highly optimized ONNX-quantized sentence transformer (~23 MB). Extremely fast CPU inference on Node 24 on Windows (<4 seconds cold load, <20ms execution for batch chunks). Produces high-quality dense sentence representations ideal for English technical search.
- **Loading Strategy:** Dynamically imported on demand only when explicit indexing is invoked (`npm run search:index`). Model weights are **never downloaded or loaded during `npm run build` or `next build`**, guaranteeing 100% build independence and offline capability.
- **Vector Normalization:** Strict $L_2$ unit-length normalization ($\sqrt{\sum v_i^2} = 1.0$) with explicit guards against zero, NaN, or non-finite values.

### 5.3 Local Vector Store Persistence
- **Implementation:** `LocalVectorStore` (`lib/semantic/local-vector-store.ts`).
- **Storage Location:** `data/derived/semantic-index.json`.
- **Format:** Structured JSON including index header metadata (`version`, `embeddingModel`, `dimensions`, `generatedAt`) and full `VectorRecord` array with chunk provenance metadata.
- **Lifecycle & Safety:** Completely disposable. If deleted or corrupted, running `npm run search:index` deterministically regenerates the entire index in under 2 seconds.

### 5.4 Incremental Synchronization & Model Mismatch
- **Change Detection:** Compares canonical chunk IDs and SHA-256 content hashes against stored records.
  - **New chunks:** Embedded and added.
  - **Unchanged chunks:** Skipped (zero embedding computation).
  - **Changed chunks:** Re-embedded and updated.
  - **Removed / Unpublished chunks:** Purged from the vector store.
- **Model Compatibility Guard:** If the configured embedding model or dimensionality changes, the indexer detects the mismatch, invalidates legacy vectors, and triggers a full, clean re-index.

### 5.5 CLI Execution Commands
- **Dry-run Preview:**
  ```bash
  npm run search:index -- --dry-run
  ```
  Discovers published entities, generates chunks, and calculates proposed additions/updates without generating embeddings or mutating the vector index.
- **Live Incremental Indexing:**
  ```bash
  npm run search:index
  ```
  Loads the local model, computes embeddings for new/changed chunks, and synchronizes `data/derived/semantic-index.json`.
- **Force Rebuild:**
  ```bash
  npm run search:index -- --force
  ```
  Wipes and re-embeds all published chunks regardless of hash cache.

### 5.6 Provider Replaceability
The application layer interacts exclusively with `EmbeddingProvider` and `VectorStore`. The local provider can be replaced in future phases by external providers (e.g. Gemini, OpenAI, Supabase pgvector) simply by updating environment variables or adapter factories without modifying search UI or chunking pipelines.

---

## 6. Phase 8G.6 — Semantic Retrieval Implementation

### 6.1 Architectural Scope & Core Principle
Phase 8G.6 introduces the server-side semantic retrieval pipeline over the local persistent vector index (`data/derived/semantic-index.json`).

> [!IMPORTANT]
> **Independent Subsystem:** Semantic retrieval currently operates independently from the Phase 8F lexical search system (`/search`). Hybrid ranking, score blending (e.g., BM25 + vector similarity, RRF), RAG generation, and public search UI modifications are explicitly deferred to subsequent phases.

```
USER QUERY
    ↓
QUERY NORMALIZATION (normalizeSemanticQuery)
    ↓
PRE-FLIGHT VALIDATION (Index existence & model compatibility check)
    ↓
LOCAL QUERY EMBEDDING (LocalEmbeddingProvider: Xenova/all-MiniLM-L6-v2)
    ↓
LOCAL VECTOR SEARCH (Cosine similarity over L2-normalized 384d vectors)
    ↓
PUBLICATION FILTER (status === PUBLISHED & isIndexable())
    ↓
METADATA FILTERING (optional entityType & topic constraints)
    ↓
SIMILARITY THRESHOLDING (configurable minScore cutoff)
    ↓
DETERMINISTIC TIE-BREAKING & BOUNDED EXCERPT GENERATION
    ↓
STRUCTURED RETRIEVAL RESPONSE (SemanticRetrievalResponse)
```

### 6.2 Query Normalization
Query strings are normalized prior to inference via `normalizeSemanticQuery()`:
- **Casing:** Lowercased across all characters.
- **Punctuation & Delimiters:** Hyphens, slashes, and punctuation marks are converted to whitespace while preserving alphanumeric tokens (e.g., `technical-seo` and `technical/SEO` both resolve to `technical seo`).
- **Quotes & Apostrophes:** Single, double, and curly quotes are cleanly stripped.
- **Whitespace:** Repeated and boundary whitespace is collapsed.
- **Empty Query Edge Case:** Empty or whitespace/punctuation-only inputs bypass the embedding model entirely and return immediately with `reason: "empty_query"`, preventing wasted compute.

### 6.3 Query Embedding & Model Validation
- **Model Contract:** Queries are embedded using `LocalEmbeddingProvider` (`Xenova/all-MiniLM-L6-v2`, 384 dimensions, L2 unit-normalized).
- **Dimension Enforcement:** Query vector dimensions are strictly validated against store dimensions ($384 \equiv 384$). Mismatches immediately fail safe with `semantic_index_incompatible`.

### 6.4 Vector Similarity & Deterministic Ordering
- **Similarity Metric:** Cosine similarity via dot product over unit-length vectors ($s = \sum_{i=1}^{384} q_i \cdot d_i$).
- **Deterministic Tie-Breaking:** If two chunks evaluate to identical similarity scores, order is deterministically resolved by `entityId ASC`, followed by `chunkId ASC`. Zero non-deterministic or random behavior.

### 6.5 Publication Safety Enforcement
The retrieval layer enforces a two-layer defense against unpublished content leakage:
1. **Store-level Filter:** Passes `{ status: "PUBLISHED" }` to `VectorStore.search()`.
2. **Post-retrieval Double Gate:** Validates each candidate chunk with canonical `isIndexable(metadata.status)`.
Entities marked `DRAFT`, `IN_REVIEW`, `ACTIVE`, `COMPLETED`, or `ARCHIVED` can never be surfaced by semantic retrieval.

### 6.6 Metadata Filtering & Constraints
- **Entity Type Filtering (`entityType`):** Restricts candidates to specific canonical collections (e.g., `professional-experience`, `research`, `article`, `guide`, `experiment`). Unindexed or draft entity types return 0 results safely.
- **Topic Filtering (`topics`):** Supports array of topic identifiers (`TOP-XXX`) using OR semantics across assigned chunk topics.
- **Result Limits (`limit`):** Defaults to `SEMANTIC_SEARCH_DEFAULT_LIMIT = 5`, capped at `SEMANTIC_SEARCH_MAX_LIMIT = 10`.
- **Similarity Threshold (`threshold`):** Defaults to `SEMANTIC_SEARCH_DEFAULT_THRESHOLD = 0.5`. This value serves as an empirical operational baseline for Phase 8G.6 and is NOT an accuracy guarantee. Rigorous evaluation and calibration occur in Phase 8G.7.

### 6.7 Bounded Excerpt Generation
- Excerpts are extracted directly from indexed chunk text using `createExcerpt()`.
- Maximum length is bounded by `SEMANTIC_SEARCH_MAX_EXCERPT_LENGTH = 280` characters with clean word boundary truncation.
- Zero rewriting, zero LLM summarization, zero synthetic fabrication.

### 6.8 Controlled Failure & Edge Case Handling
- **Missing Index File:** If `data/derived/semantic-index.json` is missing, `semanticSearch` returns `available: false` with `reason: "semantic_index_unavailable"` without throwing or attempting to download weights during retrieval.
- **Index/Model Mismatch:** If the index header reflects a different model name or dimensions, `semanticSearch` halts with `reason: "semantic_index_incompatible"`.
- **Model Initialization Failure:** If ONNX runtime throws an internal exception, retrieval catches it and returns `reason: "model_initialization_failed"`.

### 6.9 Deferral Rationales
- **Why Hybrid Retrieval is Deferred:** Phase 8G.6 isolates and proves semantic retrieval independently. Hybrid blending (combining Phase 8F BM25 lexical scores with Phase 8G.6 vector similarity via RRF or weighted interpolation) must follow systematic retrieval evaluation in Phase 8G.7 to establish grounded scoring weights.
- **Why RAG / Ask DIXITH is Deferred:** Retrieval augmented generation requires evaluated, high-precision context retrieval. Introducing LLM synthesis before evaluating retrieval quality risks citation hallucinations.
- **Why Public Semantic UI is Deferred:** The `/search` user interface remains strictly deterministic keyword search until hybrid retrieval is evaluated and proven superior across benchmark queries.
