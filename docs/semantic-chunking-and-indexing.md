# DIXITH Semantic Chunking & Indexing Pipeline

## 1. Overview
The **Semantic Chunking & Indexing Pipeline** (Phase 8G.3) establishes the derived processing layer that transforms canonical published DIXITH content into deterministic, content-type-aware chunks and synchronizes them with the vector index.

Canonical Git and data files remain the **sole source of truth**. The vector store is strictly a disposable, derived retrieval index.

---

## 2. Pipeline Flow
```
Canonical Content (5 Collections)
             ↓
    isIndexable(status)  (PUBLISHED only)
             ↓
Content-Type-Aware Chunking
             ↓
Stable Chunk IDs (${entityId}#${sectionKey}#${index})
             ↓
Deterministic SHA-256 Content Hashes
             ↓
Incremental Change Detection
   ├── Unchanged (identical hash) ──> Skip
   ├── Changed (different hash)   ──> Re-embed
   ├── New (absent in store)      ──> Embed & Insert
   └── Obsolete (removed/unpub)   ──> Delete from Store
             ↓
EmbeddingProvider (Batch Vectorization)
             ↓
VectorStore (Derived Index Synchronization)
```

---

## 3. Publication Gate
Indexing strictly enforces the canonical gatekeeper:
$$\text{isIndexable}(\text{status}) = \text{true} \iff \text{status} = \text{"PUBLISHED"}$$

- `DRAFT`, `IN_REVIEW`, `ACTIVE`, and `ARCHIVED` entities are filtered out immediately prior to chunking.
- If a previously published entity transitions to a non-published status, the synchronization pipeline detects its missing chunk IDs and deletes them from the vector index.

---

## 4. Chunking Strategy & Boundaries
Chunks are constructed along **semantic section boundaries** rather than arbitrary token slicing:

| Content Type | Primary Semantic Sections |
| :--- | :--- |
| **Research** | `overview`, `question`, `methodology`, `observations`, `findings`, `limitations` |
| **Experiment** | `objective`, `question`, `methodology`, `variables`, `evidence`, `observations`, `findings`, `limitations` |
| **Article** | `overview`, `body` (split by markdown headings or paragraphs if large) |
| **Guide** | `overview`, `prerequisites`, individual `step-${n}` sections (including title, description, and code snippet) |
| **Professional Experience** | `overview`, `context`, `responsibilities`, `technical-focus`, `search-focus`, `technologies` |

- **Chunk Size**: Target: 300–600 tokens. Sections within bounds remain intact; oversized sections are deterministically split along paragraph boundaries.
- **Hygiene**: Empty or whitespace-only sections are skipped. Duplicate chunk IDs are prohibited.
- **Client Disclosure**: Professional experience entries strictly omit client-confidential data per canonical disclosures.

---

## 5. Stable Chunk IDs & Content Hashing

### 5.1 Chunk ID Format
$$\text{Chunk ID} = \texttt{\$\{entityId\}\#\$\{sectionKey\}\#\$\{index\}}$$
Examples:
- `PE-001#overview#0`
- `PE-001#responsibilities#0`
- `GUI-001#step-1#0`

Chunk IDs are stable, human-debuggable, and completely decoupled from embedding providers or database vendors.

### 5.2 Deterministic SHA-256 Hashing
A cryptographic SHA-256 hash is computed over the composite payload:
$$\text{Hash} = \text{SHA256}(\text{entityId} :: \text{entityType} :: \text{section} :: \text{heading} :: \text{content} :: \text{topics} :: \text{sources} :: \text{status})$$

Identical canonical content produces an identical hash, allowing the pipeline to skip re-embedding unchanged records.

---

## 6. CLI Commands & Execution

### 6.1 Dry-Run Preview (Safe & Repeated Execution)
```bash
npm run search:index -- --dry-run
```
- Scans all canonical entities.
- Applies publication gating.
- Generates chunks and calculates hashes.
- Compares against existing records.
- Reports proposed additions, updates, and deletions.
- **Generates zero embeddings and mutates zero vector stores.**

### 6.2 Live Index Synchronization
```bash
npm run search:index
```
- Executes live incremental indexing.
- Batches embedding generation via `EmbeddingProvider.embedBatch()`.
- Synchronizes `VectorRecord`s to `VectorStore`.
- Removes obsolete records.

---

## 7. Infrastructure Failure Safety & Offline Build Guarantee
- **Offline Builds**: `npm run build` does not invoke or import the indexing pipeline. The public site builds 100% offline without credentials or database connections.
- **Missing Infrastructure**: If `EMBEDDING_PROVIDER` or `VECTOR_STORE` are unconfigured, `npm run search:index` logs a clear diagnostic and exits safely without throwing unhandled exceptions or corrupting the index.

---

## 8. Phase 8G.4 Preview
Phase 8G.4 will implement the persistent remote vector store adapter (e.g. Supabase pgvector) adhering to the `VectorStore` interface, enabling persistent storage of vectors across builds and deployments.
