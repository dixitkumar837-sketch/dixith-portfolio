# DIXITH Content Corpus & Evidence Readiness Audit

**Document Version:** 1.0.0  
**Phase:** 8H — Content Corpus & Evidence Readiness  
**Target Milestone:** Client Demonstration & Downstream Grounded Retrieval  
**Scope:** Knowledge Entity Inventory, Evidence Provenance, Relationship Integrity, and Citation-Chain Feasibility  

---

## 1. Executive Summary

This audit assesses the readiness of the DIXITH Personal AI Search Knowledge Platform corpus for downstream semantic retrieval, citation grounding, and future evidence assembly. The audit operates under strict safety invariants:

1. **Strict Publication Gating (`isIndexable`)**: Only content entities marked with `ContentStatus.PUBLISHED` are indexable by search crawlers (`sitemap.xml`, `robots.txt`) and ingestible by the lexical and semantic retrieval engines (`searchContent`, `semanticSearch`, `searchWithMode`).
2. **Zero Fabrication**: No synthetic research data, unverified benchmark claims, or fabricated sources are introduced.
3. **No Automatic Status Escalation**: Entities in `DRAFT`, `IN_REVIEW`, or `ACTIVE` states are retained in their current lifecycle stage until real-world empirical findings or editorial bodies are authored and vetted.
4. **Professional Experience Isolation**: Enterprise technical experience (`PE-001`, `PE-002`, `PE-003`) is maintained with strict client confidentiality disclosures, neutral role context, and complete separation from independent academic/lab research.
5. **No Premature LLM Execution**: **Ask DIXITH, LLM answer synthesis, chatbot UI, and external AI provider APIs are NOT implemented in Phase 8H.** This phase defines the data contracts and evidence readiness required *before* any synthesis engine can be safely integrated.

---

## 2. Current Corpus Inventory

The DIXITH platform canonical knowledge graph comprises **23 total entities**:
- **3 Research Entity Models** (`data/research.ts`)
- **1 AI Search Lab Experiment** (`data/experiments.ts`)
- **3 Analytical Articles** (`data/articles.ts`)
- **2 Implementation Guides** (`data/guides.ts`)
- **3 Professional Experience Entities** (`data/professional-experience.ts`)
- **4 Canonical Verified Sources** (`data/sources.ts`)
- **7 Canonical Knowledge Taxonomy Topics** (`data/topics.ts`)
- **1 Canonical Author Entity** (`data/authors.ts`)

### Entity-by-Entity Audit Matrix

| Entity Type | Entity ID | Slug | Status | Substantive Content | Evidence Attached | Verified Sources | Valid Relations | Retrieval Ready | Publication Ready | Readiness Classification |
|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Research** | `EXP-014` | `citation-patterns-across-ai-search-systems` | `IN_REVIEW` | Yes | Needs Data | Yes (`SRC-001`, `002`) | Yes (`EXP-001`, `013`) | No | No | `NEEDS_EVIDENCE` |
| **Research** | `EXP-013` | `how-entities-influence-ai-search-visibility` | `IN_REVIEW` | Yes | Needs Data | Yes (`SRC-001`, `002`) | Yes (`EXP-001`, `014`) | No | No | `NEEDS_EVIDENCE` |
| **Research** | `EXP-012` | `testing-generative-engine-visibility` | `IN_REVIEW` | Yes | Needs Data | Yes (`SRC-001`, `002`) | Yes (`EXP-001`, `014`) | No | No | `NEEDS_EVIDENCE` |
| **Experiment** | `EXP-001` | `same-question-six-systems` | `ACTIVE` | Yes | Yes (Protocol) | Yes (`SRC-001`, `002`) | Yes (`EXP-013`, `014`) | No | No | `NOT_READY` (ACTIVE in Lab) |
| **Article** | `INS-001` | `understanding-rag-in-modern-search` | `DRAFT` | No (Stub) | No | Yes (`SRC-001`, `002`) | Yes (`EXP-014`) | No | No | `NEEDS_CONTENT` |
| **Article** | `INS-002` | `shift-from-page-rank-to-entity-trust` | `DRAFT` | No (Stub) | No | Yes (`SRC-001`, `002`) | Yes (`EXP-013`) | No | No | `NEEDS_CONTENT` |
| **Article** | `INS-003` | `technical-seo-auditing-for-ai-crawlers` | `DRAFT` | No (Stub) | No | Yes (`SRC-003`, `004`) | Yes (`EXP-012`) | No | No | `NEEDS_CONTENT` |
| **Guide** | `GUI-001` | `schema-org-entity-graph-implementation` | `DRAFT` | Yes (Steps + Code) | Yes (Tech Spec) | Yes (`SRC-001`, `002`) | Yes (`EXP-013`) | No | No | `READY_FOR_PUBLICATION_REVIEW` |
| **Guide** | `GUI-002` | `crawler-access-and-index-hygiene-for-ai-search` | `DRAFT` | Yes (Steps + Directives) | Yes (Tech Spec) | Yes (`SRC-003`, `004`) | Yes (`EXP-014`) | No | No | `READY_FOR_PUBLICATION_REVIEW` |
| **Experience** | `PE-001` | `healthcare-search-architecture` | `PUBLISHED` | Yes | Yes (Arch Specs) | N/A (Exp Disclosure) | Yes (`EXP-013`, `014`) | **Yes** | **Yes** | `PUBLISHED_ACTIVE` |
| **Experience** | `PE-002` | `international-search-architecture` | `PUBLISHED` | Yes | Yes (Arch Specs) | N/A (Exp Disclosure) | Yes (`EXP-014`) | **Yes** | **Yes** | `PUBLISHED_ACTIVE` |
| **Experience** | `PE-003` | `ecommerce-search-generative-discovery` | `PUBLISHED` | Yes | Yes (Arch Specs) | N/A (Exp Disclosure) | Yes (`EXP-012`, `014`) | **Yes** | **Yes** | `PUBLISHED_ACTIVE` |

---

## 3. Publication Status Distribution

```
PUBLISHED (Live in Index):  [3]  PE-001, PE-002, PE-003  (13.0% of total entities)
IN_REVIEW (Research):       [3]  EXP-014, EXP-013, EXP-012 (13.0%)
ACTIVE (Live Lab Protocol): [1]  EXP-001 (4.3%)
DRAFT (Editorial Guides):   [2]  GUI-001, GUI-002 (8.7%)
DRAFT (Editorial Articles): [3]  INS-001, INS-002, INS-003 (13.0%)
FOUNDATIONAL (Sources/Tax): [11] SRC-001..004, TOP-001..007 (47.8%)
```

### Publication Security Invariant
```
                   Content Lifecycle Flow
                     
 [DRAFT] ──────> [IN_REVIEW] ──────> [ACTIVE/COMPLETED] ──────> [PUBLISHED]
    │                 │                      │                       │
    ▼                 ▼                      ▼                       ▼
 NO INDEX          NO INDEX               NO INDEX               INDEXABLE
 (isIndexable=false)                     (isIndexable=false)     (isIndexable=true)
                                                                     │
                                                                     ├── Lexical Index (8F)
                                                                     ├── Semantic Store (8G)
                                                                     ├── Hybrid Search (8G.10)
                                                                     └── XML Sitemap
```

---

## 4. Evidence Readiness

Evidence readiness evaluates whether an entity's claims, assertions, and recommendations are backed by empirical measurement or authoritative specifications:

1. **Research Entities (`EXP-014`, `EXP-013`, `EXP-012`)**:
   - *Status*: `NEEDS_EVIDENCE`.
   - *Audit Finding*: The research framing, methodology descriptions, questions, and limitations are fully established. However, the `findings` arrays are currently empty to prevent fabricating synthetic benchmark numbers before live multi-engine test runs are finalized.
2. **AI Search Lab Experiment (`EXP-001`)**:
   - *Status*: `NOT_READY` (ACTIVE in lab).
   - *Audit Finding*: The evaluation methodology, query vectors, and observation protocols across the six canonical engines (Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, Copilot) are defined. It remains marked `ACTIVE` until statistical data collection is completed.
3. **Articles (`INS-001`, `INS-002`, `INS-003`)**:
   - *Status*: `NEEDS_CONTENT`.
   - *Audit Finding*: Currently serve as canonical routing stubs with titles, summaries, read times, and source/research links. The long-form `body` text has not yet been authored.
4. **Guides (`GUI-001`, `GUI-002`)**:
   - *Status*: `READY_FOR_PUBLICATION_REVIEW`.
   - *Audit Finding*: Every guide features full step-by-step instructions, concrete code snippets, prerequisite definitions, and difficulty tiers. They represent complete technical documentation.
5. **Professional Experience (`PE-001`, `PE-002`, `PE-003`)**:
   - *Status*: `PUBLISHED_ACTIVE`.
   - *Audit Finding*: Features detailed technical focus areas, search engineering responsibilities, and architectural overviews. Protected by commercial confidentiality disclosures.

---

## 5. Source Readiness & Provenance

The platform maintains a central verified source registry in `data/sources.ts`. All 4 canonical sources are official, permanent industry standards or primary platform documentation:

| Source ID | Title | Publisher | Type | Verification Status | Referenced By |
|:---|:---|:---|:---|:---:|:---|
| `SRC-001` | Schema.org Specifications | W3C Schema.org Community Group | `STANDARD_SPEC` | `VERIFIED` | `EXP-012`, `EXP-013`, `EXP-014`, `EXP-001`, `INS-001`, `INS-002`, `GUI-001` |
| `SRC-002` | Google Search Central: Structured Data Documentation | Google Developers | `OFFICIAL_DOCUMENTATION` | `VERIFIED` | `EXP-012`, `EXP-013`, `EXP-014`, `EXP-001`, `INS-001`, `INS-002`, `GUI-001` |
| `SRC-003` | OpenAI: GPTBot Web Crawler Documentation | OpenAI | `OFFICIAL_DOCUMENTATION` | `VERIFIED` | `INS-003`, `GUI-002` |
| `SRC-004` | Anthropic: ClaudeBot Web Crawler Documentation | Anthropic | `OFFICIAL_DOCUMENTATION` | `VERIFIED` | `INS-003`, `GUI-002` |

**Audit Result**: 100% of defined sources are verified. Zero missing or unconfirmed sources exist in the repository.

---

## 6. Relationship Integrity & Graph Validation

The content graph was validated using `lib/content-utils.ts:validateContentGraph()`.

* **Graph Validity**: `isValid: true`
* **Errors**: `0`
* **Warnings**: `0`
* **Total Entity References Evaluated**: `18`
* **Orphaned / Dangling References**: `0`
* **Prefix Ambiguity**: Fully resolved. Entity references use explicit `{ type: EntityType, id: string, relation: RelationType }` tuples, preventing confusion between `research:EXP-014` and `experiment:EXP-001`.
* **Topic Taxonomy Integrity**: All referenced topic tokens (`TOP-001` through `TOP-007`) resolve to verified taxonomy nodes in `CANONICAL_TOPICS`.
* **Author Attribution**: 100% of authored content links directly to `AUT-001` (Dixith Kumar).

---

## 7. Citation Chain Readiness

A grounded AI search engine requires an unbroken chain of attribution:

```
[1] USER QUERY: "How do structured entity graphs improve generative visibility?"
       │
[2] CONTENT ENTITY: GUI-001 ("Implementing Structured Entity Graphs with Schema.org")
       │
[3] CONTENT CHUNK: GUI-001#step-1#0 ("Define the Root Entity Identity...")
       │
[4] SOURCE / EVIDENCE: SRC-001 (Schema.org Specifications) + EXP-013 (Entity Research)
       │
[5] CITABLE DIXITH RESULT: Formatted passage with verified source anchors
```

### Identified Chain Breakpoints in Current Corpus

1. **Unpublished Research Findings**:
   Because `EXP-014`, `EXP-013`, and `EXP-012` are `IN_REVIEW`, they cannot yet supply public chunks. Any query seeking empirical research numbers falls back to published architectural overviews.
2. **Article Body Absence**:
   Because articles (`INS-001`–`INS-003`) are stubs without full `body` fields, chunking them produces only single-chunk summary records. Full synthesis requires authoring the complete article text.
3. **Professional Experience Citation Isolation**:
   Professional experience chunks (`PE-001`–`PE-003`) cite internal employment responsibilities and architectural focus areas, but intentionally do not link to external academic source URLs to preserve commercial confidentiality.

---

## 8. Semantic Index Safety

An audit of the persistent local vector index (`data/derived/semantic-index.json`) confirmed:

* **Total Stored Chunks**: `18`
* **Indexed Entities**: Only `PE-001`, `PE-002`, `PE-003`.
* **Indexed Statuses**: 100% `PUBLISHED`.
* **Leaked Non-Published Chunks**: **`0`**. Zero draft, in-review, or active records have entered the vector store.
* **Deterministic Chunk IDs**: All chunk keys follow the deterministic format `${entityId}#${sectionKey}#${index}`.
* **Cryptographic Hashes**: Every chunk content hash is computed via SHA-256 over normalized text, status, and topics, preventing cache contamination.

---

## 9. Professional Experience Isolation

The platform strictly segregates independent DIXITH research from commercial professional experience:

1. **Entity Type Disambiguation**: Professional experience is modeled under `entityType: "professional-experience"`, distinct from `"research"` or `"experiment"`.
2. **Confidentiality Disclosure**: All professional experience entries contain mandatory confidentiality statements:
   > *"Specific client and commercial details are intentionally omitted."*
3. **Neutral Architectural Language**: Phrasing focuses purely on generalized technical methodologies ("structured clinical service taxonomies", "cross-border hreflang mapping matrices", "MerchantReturnPolicy Schema layers").
4. **Zero Proprietary Data**: No client corporate names, revenue metrics, non-public staging URLs, or employer secrets are disclosed.

---

## 10. Search Regression Results

All retrieval suites passed without degradation:

* **Keyword Search (Phase 8F)**: 100% functional.
* **Semantic Retrieval (Phase 8G.6)**: 100% functional (Xenova/all-MiniLM-L6-v2 local CPU ONNX inference).
* **Hybrid Retrieval (Phase 8G.8)**: Reciprocal Rank Fusion (RRF) operational.
* **Lexical Quality Gate (Phase 8G.9)**: 100% negative query rejection (sourdough bread, capital of France, quantum computing rejected with 0 results).
* **Controlled Search Mode Integration (Phase 8G.10)**:
  - 22/22 unit, parity, and benchmark assertions passed.
  - Top-1 Hit Rate: `100.0%`.
  - Mean Reciprocal Rank (MRR): `1.000`.
  - False Positive Rate: `0.0%`.
  - Duplicate Entity Rate: `0.0%`.

---

## 11. Content Blockers

The following explicit blockers prevent promoting non-published entities:

| Entity ID | Entity Title | Blocker Code | Description of Blocker |
|:---|:---|:---|:---|
| `EXP-014` | Citation Patterns Across AI Search Systems | `BLOCK_RESEARCH_FINDINGS` | Awaiting final statistical data collection from multi-engine benchmark runs. |
| `EXP-013` | How Entities Influence AI Search Visibility | `BLOCK_RESEARCH_FINDINGS` | Awaiting entity disambiguation correlation numbers across Google AI Overview & Perplexity. |
| `EXP-012` | Testing Generative Engine Visibility | `BLOCK_RESEARCH_FINDINGS` | Awaiting brand citation frequency tracking data. |
| `EXP-001` | SAME QUESTION / SIX SYSTEMS | `BLOCK_LAB_ACTIVE` | Active laboratory benchmark currently in progress; results not yet compiled into finalized findings. |
| `INS-001` | Understanding RAG in Modern Search | `BLOCK_ARTICLE_BODY` | Article body text not yet written; only summary stub exists. |
| `INS-002` | Shift from Page Rank to Entity Trust | `BLOCK_ARTICLE_BODY` | Article body text not yet written; only summary stub exists. |
| `INS-003` | Technical SEO Auditing for AI Crawlers | `BLOCK_ARTICLE_BODY` | Article body text not yet written; only summary stub exists. |
| `GUI-001` | Structured Entity Graphs with Schema.org | `BLOCK_EDITORIAL_REVIEW` | Content complete; requires editorial review before setting status to `PUBLISHED`. |
| `GUI-002` | Crawler Access and Index Hygiene | `BLOCK_EDITORIAL_REVIEW` | Content complete; requires editorial review before setting status to `PUBLISHED`. |

---

## 12. Structured Editorial Content Briefs

To unblock the corpus without fabricating content, the following editorial content briefs define the required scope for upcoming content phases:

### Brief 1: Research Entity `EXP-014`
* **Title**: Citation Patterns Across AI Search Systems
* **Target Problem**: How do different generative answer engines select third-party URLs for inline citations vs footnotes?
* **Target Audience**: Technical SEO architects, search researchers, enterprise content strategists.
* **Key Concepts**: Citation density, domain authority bias, citation position (inline badge vs card).
* **Expected Evidence**: Systematic sample of 50 multi-tier queries across all 6 engines; citation overlap matrices.
* **Required Sources**: `SRC-001`, `SRC-002`.
* **Related Topics**: `TOP-001` (AI Search), `TOP-005` (RAG Retrieval).
* **Outcome**: Published research paper with reproducible citation percentages.

### Brief 2: Research Entity `EXP-013`
* **Title**: How Entities Influence AI Search Visibility
* **Target Problem**: Does explicit Schema.org entity disambiguation increase the probability of direct factual attribution in LLM synthesis?
* **Target Audience**: Knowledge graph engineers, semantic search developers.
* **Key Concepts**: Reconciliation latency, entity alignment, Wikidata/SameAs node association.
* **Expected Evidence**: Entity recognition accuracy tests comparing pages with connected JSON-LD vs unannotated HTML.
* **Required Sources**: `SRC-001`, `SRC-002`.
* **Related Topics**: `TOP-001`, `TOP-006` (Knowledge Graphs).
* **Outcome**: Definitive correlation analysis between schema completeness and generative engine entity recognition.

### Brief 3: Article Entity `INS-001`
* **Title**: Understanding Retrieval-Augmented Generation in Modern Search Engines
* **Target Problem**: Demystifying how search engines combine dense vector retrieval, sparse lexical indexation, and LLM synthesis.
* **Target Audience**: Web developers, technical marketers, software engineers.
* **Key Concepts**: Vector embeddings, reranking, context window compression, hallucination mitigation.
* **Required Sources**: `SRC-001`, `SRC-002`.
* **Related Topics**: `TOP-001`, `TOP-005`.
* **Outcome**: 1,500-word comprehensive technical article with architecture diagrams.

### Brief 4: Article Entity `INS-003`
* **Title**: Technical SEO Auditing for AI Engine Crawlers
* **Target Problem**: Managing crawl rates, edge permissions, and rendering overhead for LLM crawlers without impacting Core Web Vitals.
* **Target Audience**: Infrastructure engineers, technical SEO consultants.
* **Key Concepts**: User-agent discrimination, SSR vs client hydration, CDN caching for bot requests.
* **Required Sources**: `SRC-003` (OpenAI GPTBot), `SRC-004` (Anthropic ClaudeBot).
* **Related Topics**: `TOP-001`, `TOP-002`.
* **Outcome**: Production audit checklist for configuring modern web servers for AI search bots.

---

## 13. What is Ready for Publication Review

The following entities have complete substantive content, step-by-step implementations, and valid source/topic references. They are eligible for formal editorial review to transition from `DRAFT` to `PUBLISHED`:

1. **`GUI-001`**: *Implementing Structured Entity Graphs with Schema.org*
   - Contains 4 complete implementation steps with code snippets, prerequisite definitions, difficulty level, and verified sources (`SRC-001`, `SRC-002`).
2. **`GUI-002`**: *Crawler Access and Index Hygiene for AI Search Engines*
   - Contains 3 detailed crawler configuration steps, user-agent directives, DOM rendering rules, and verified sources (`SRC-003`, `SRC-004`).

---

## 14. What is NOT Ready

The following entities must **NOT** be published or indexed:

1. **`EXP-014`, `EXP-013`, `EXP-012`**: Incomplete empirical data tables.
2. **`EXP-001`**: Active multi-engine lab experiment in data collection.
3. **`INS-001`, `INS-002`, `INS-003`**: Incomplete article bodies.

---

## 15. Future EvidencePack Contract

To prepare for downstream grounded retrieval without prematurely implementing an LLM, the `EvidencePack` contract has been formalized in `lib/semantic/types.ts`:

```typescript
/**
 * Canonical Evidence Citation Reference
 * Binds a specific content chunk to its verified underlying source or empirical evidence.
 */
export interface EvidenceCitationReference {
  citationKey: string; // e.g. "[1]", "[SRC-001]"
  sourceId?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  publisher?: string;
  verificationStatus?: "VERIFIED" | "ARCHIVED_MIRROR" | "UNCONFIRMED";
  entityId: string;
  entityType: EntityType;
  chunkId: string;
  section: string;
  heading?: string;
}

/**
 * Individual Evidence Item contained within an EvidencePack.
 */
export interface EvidenceItem {
  id: string; // chunkId or composite evidence ID
  entityId: string;
  entityType: EntityType;
  slug: string;
  title: string;
  section: string;
  heading?: string;
  content: string; // The grounded passage text
  similarity: number; // Semantic or hybrid relevance score (0.0 - 1.0)
  status: ContentStatus;
  isIndexable: boolean;
  topics: string[];
  sourceIds: string[];
  sources: EvidenceCitationReference[];
  confidenceScore?: number; // Grounding confidence
}

/**
 * Canonical EvidencePack Contract
 * Future-ready contract for downstream grounded retrieval, citations, and answer synthesis.
 * Encapsulates vetted retrieved content, source provenance, relevance telemetry,
 * and publication verification before passing to any generative synthesis layer.
 * 
 * NOTE: LLM generation, answer synthesis, and Ask DIXITH are NOT implemented in Phase 8H.
 */
export interface EvidencePack {
  query: {
    raw: string;
    normalized: string;
  };
  retrievalMode: "keyword" | "semantic" | "hybrid";
  timestamp: string;
  totalCandidatesRetrieved: number;
  evidenceItems: EvidenceItem[];
  citations: EvidenceCitationReference[];
  metadata: {
    retrievalLatencyMs: number;
    gatingPassed: boolean;
    allEntitiesPublished: boolean;
    primaryTopics: string[];
    isolatedExperienceCount: number;
    independentKnowledgeCount: number;
  };
}
```

---

## 16. Explicit Architectural Boundary

> [!IMPORTANT]
> **Ask DIXITH is NOT implemented in Phase 8H.**  
> Zero LLM models, API keys, synthesis endpoints, chatbot UIs, or external vector providers have been introduced.  
> Search continues to execute exclusively via local CPU ONNX embeddings (`Xenova/all-MiniLM-L6-v2`) and local lexical token matching.

---

## 17. Six Canonical AI Search Systems Compliance

The repository strictly preserves the six canonical AI search systems:
1. **Google AI Overview**
2. **ChatGPT**
3. **Perplexity**
4. **Claude**
5. **Gemini**
6. **Microsoft Copilot**

* **Forbidden Systems Audit**: A repository-wide code and text scan confirmed **zero references** to `You.com`, `SearchGPT`, `Phind`, or `Genspark`.
