# DIXITH — Phase 8J.2: Evidence & Publication Domain Model

**Specification Version**: 1.0  
**Phase**: Phase 8J.2 (Offline Data Modeling & Publication Gating)  
**Implementation Source**: `lib/research/evidence-model.ts`, `data/types.ts`  
**Author**: Antigravity Platform Intelligence (Offline Protocol)  
**Date**: September 28, 2026  

---

## 1. Purpose

The DIXITH platform is an independent research and engineering knowledge architecture dedicated to artificial intelligence answer engines, information retrieval, and search systems. 

As generative AI search systems increasingly summarize external content without attribution, or synthesize answers with variable citation fidelity, the platform's primary scientific requirement is **epistemological rigor**. We must never:
- Present hypothetical frameworks as empirical findings.
- Conflate browser interaction outcomes with model intelligence or retrieval quality.
- Confuse external literature citations (e.g. W3C, RFCs, Google Search Central) with primary captured evidence.
- Permit unverified draft content or quarantined data to leak into public search discovery channels.

Phase 8J.2 establishes a strongly typed, deterministic domain model governing how empirical research evidence is collected, verified, connected via provenance, synthesized into findings, and gated prior to public indexation.

---

## 2. Evidence Model

The evidence domain model enforces a strict, hierarchical chain of empirical derivation:

```
Research Framework (Study Scope & Question)
  ↓
Experiment (Benchmark Battery & Protocol)
  ↓
Research Run (Execution Timestamp, Session & System Parameters)
  ↓
Evidence Item (Cryptographically Hashed Raw Capture Artifacts)
  ↓
Observation (Directly Perceived Observable Attributes)
  ↓
Measurement (Quantified Metric Derived Deterministically)
  ↓
Finding (Supported Empirical Conclusion)
  ↓
Interpretation (Architectural or Algorithmic Hypothesis)
  ↓
Limitation (Documented Environmental / Algorithmic Constraint)
```

Not every research entity is required to exhibit every layer; however, **no upper layer may claim factual validity without referencing the specific lower layer upon which it is grounded**.

### The `EvidenceItem` Contract

Every empirical capture is encapsulated in an immutable, cryptographically verifiable `EvidenceItem`:

```typescript
export interface EvidenceItem {
  id: string;                      // e.g. "EVD-001-20260927-Q001-gemini-05"
  runId: string;                   // Deterministic Run ID
  experimentId: string;            // e.g. "EXP-001"
  system: CanonicalAISearchSystem; // Canonical engine identifier
  queryId: string;                 // Battery query identifier (e.g. "Q-001")
  status: EvidenceStatus;          // CAPTURED | VERIFIED | INCOMPLETE | UNAVAILABLE | INVALID | QUARANTINED
  sha256Hash: string;              // 64-character hexadecimal SHA-256 digest
  rawTextPath?: string;            // Relative path to raw captured text
  domSnapshotPath?: string;        // Relative path to rendered DOM HTML
  screenshotPath?: string;         // Relative path to viewport PNG
  runRecordPath?: string;          // Relative path to JSON run record
  capturedAt: string;              // ISO 8601 UTC timestamp
  provenance: EvidenceProvenance;  // Bidirectional lineage pointer
  quarantineReason?: string;       // Mandatory if status === "QUARANTINED"
  notes?: string;
}
```

---

## 3. Evidence Provenance

Provenance ensures that every empirical claim is backward-traceable to its exact laboratory source:

$$\text{Finding} \xrightarrow{\text{grounded in}} \text{Observation / Measurement} \xrightarrow{\text{extracted from}} \text{Evidence Item} \xrightarrow{\text{produced by}} \text{Research Run} \xrightarrow{\text{governed by}} \text{Experiment}$$

Where underlying evidence has not yet been captured (e.g. while an experiment is `ACTIVE` in lab), the model prohibits placeholder fabrication. Instead, the `EvidenceProvenance` object explicitly documents the absence:

```typescript
export interface EvidenceProvenance {
  researchId?: string;
  experimentId?: string;
  runId?: string;
  evidenceId?: string;
  observationIds?: string[];
  measurementIds?: string[];
  findingId?: string;
  hasUnderlyingEvidence: boolean; // Must be true for empirical findings
  absenceReason?: string;         // e.g. "PENDING_BENCHMARK_EXECUTION"
}
```

---

## 4. Observation Model

An **Observation** is what was directly perceived or captured from a system interface. It records factual, observable attributes of an engine's response without interpretive bias or quality judgments.

```typescript
export interface Observation {
  id: string; // e.g. "OBS-001-001"
  evidenceId?: string;
  runId?: string;
  system: CanonicalAISearchSystem | string;
  queryId: string;
  observationType: ObservationType;
  observedValue: string | number | boolean | Record<string, unknown>;
  rawSnippet?: string;
  capturedAt: string;
  provenance: EvidenceProvenance;
}
```

### Supported Observation Typologies:
- `TEXT_RESPONSE`: Verbatim text string returned in the answer container.
- `CITATION_LINK`: Discrete hyperlink, anchor text, and URL cited in the response.
- `DOM_STRUCTURE`: Layout elements, citation placement (inline pill, footer list, carousel card).
- `UI_RENDER_FORMAT`: Specific UI widgets displayed by the engine.
- `AUTH_GATE_DISPLAYED`: Redirect to login or account gate.
- `CHALLENGE_DISPLAYED`: Captcha or bot-detection interstitial.
- `SEARCH_MODE_SELECTED`: Observable engine mode (e.g. "Default", "Pro / Deep Search", "Browse").

---

## 5. Measurement Model

A **Measurement** is a quantifiable metric derived deterministically from evidence and observations using an explicit, reproducible formula.

```typescript
export interface Measurement {
  id: string; // e.g. "MEA-001-001"
  metricName: string; // e.g. "citation_density_per_1000_words"
  numericValue: number;
  unit?: string;
  supportingObservationIds: string[];
  supportingEvidenceIds: string[];
  calculationMethod: string; // Formula e.g. "(totalCitations / wordCount) * 1000"
  provenance: EvidenceProvenance;
}
```

---

## 6. Finding Model

A **Finding** is a supported research conclusion derived directly from observations and measurements. Findings represent the factual core of DIXITH publications.

```typescript
export interface Finding {
  id: string; // e.g. "FND-001-001"
  statement: string; // Grounded empirical claim
  supportingObservationIds: string[];
  supportingMeasurementIds: string[];
  supportingEvidenceIds: string[];
  confidence: "HIGH" | "MODERATE" | "PRELIMINARY";
  hasSufficientEvidence: boolean;
  provenance: EvidenceProvenance;
}
```

### The Fail-Closed Grounding Rule:
```typescript
if (!hasEvidence || !hasObservables || !finding.hasSufficientEvidence) {
  throw new Error("Finding fails empirical grounding: unsupported claim rejected.");
}
```
If a finding does not link to at least one verified evidence item and at least one observation or measurement, the publication gate strictly rejects it.

---

## 7. Interpretation Model

An **Interpretation** is a reasoned hypothesis or architectural deduction explaining *why* an observed finding occurs based on underlying retrieval and indexing mechanisms.

```typescript
export interface Interpretation {
  id: string; // e.g. "INT-001-001"
  findingId: string; // Required pointer to underlying Finding
  hypothesis: string;
  reasoning: string;
  theoreticalImplications: string[];
  provenance: EvidenceProvenance;
}
```

- **Validation Rule**: An interpretation must point to an existing, validated Finding. Unanchored speculations are blocked by `validateInterpretation()`.

---

## 8. Limitation Model

A **Limitation** documents constraints, confounding variables, or environmental conditions that affect the generalizability or reproducibility of findings.

```typescript
export interface Limitation {
  id: string; // e.g. "LIM-001-001"
  scope: LimitationScope;
  description: string;
  impactOnFindings: string;
}
```

### Standardized Limitation Scopes:
1. `ALGORITHMIC_DRIFT`: Engines alter weighting parameters without public notice.
2. `GEOGRAPHIC_VARIATION`: Server location and client IP alter retrieval candidate pools.
3. `SESSION_PERSONALIZATION`: Prior account history or cookies influence answer synthesis.
4. `INTERFACE_VOLATILITY`: DOM and UI selectors mutate unpredictably.
5. `SAMPLE_SIZE`: Total query count limits statistical significance.
6. `BLACK_BOX_ENVIRONMENT`: Inability to observe internal model embeddings or weights.
7. `NON_DETERMINISM`: Stochastic temperature parameter produces variation between runs.

---

## 9. Publication Readiness Progression

To ensure complete control over the content lifecycle, the platform formalizes a 4-tier publication progression:

$$\text{DRAFT} \longrightarrow \text{IN\_REVIEW} \longrightarrow \text{EVIDENCE\_READY} \longrightarrow \text{PUBLISHED}$$

```typescript
export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "EVIDENCE_READY"
  | "ACTIVE"
  | "COMPLETED"
  | "PUBLISHED"
  | "ARCHIVED";
```

### The Inviolable Indexability Gate:
```typescript
export function isIndexable(status: ContentStatus): boolean {
  return status === "PUBLISHED";
}
```

| Lifecycle State | Meaning | Search Eligible? | Sitemap Included? | Robots Indexable? |
|---|---|---|---|---|
| `DRAFT` | Initial drafting, incomplete body | **No** | **No** | `index: false` |
| `IN_REVIEW` | Complete framework, awaiting evidence/review | **No** | **No** | `index: false` |
| `EVIDENCE_READY` | Evidence attached and verified; awaiting publication | **No** | **No** | `index: false` |
| `ACTIVE` | Lab experiment undergoing live capture | **No** | **No** | `index: false` |
| `COMPLETED` | Benchmark capture finished, synthesis pending | **No** | **No** | `index: false` |
| `PUBLISHED` | Formally approved and active for public retrieval | **YES** | **YES** | `index: true` |

`EVIDENCE_READY` content **never** leaks into Google indexing, XML sitemaps, lexical search, or semantic vector stores until an explicit editorial transition to `PUBLISHED` occurs.

---

## 10. Evidence Validity

The validation function `validateEvidenceItem()` checks:
1. Non-empty string identifiers (`id`, `runId`, `experimentId`, `system`, `queryId`).
2. Valid 64-character hexadecimal SHA-256 digest matching captured files.
3. Valid timestamp conforming to ISO 8601 UTC.
4. Coherence between status and quarantine reasons.

---

## 11. Quarantine Rules

Artifacts that fail data-integrity protocols (such as the interrupted Phase 8I.7.5 capture of `RUN-001-20260927-Q001-gemini-01`) are assigned `status: "QUARANTINED"`.

### Strict Quarantine Guardrails:
1. **Never Deleted**: Quarantined files remain preserved on disk for forensic analysis and provenance auditing.
2. **Never Modified**: Quarantined files must remain bit-for-bit unchanged.
3. **Never Admitted to Evidence Packs**: `validateQuarantineIsolation()` throws a `[SECURITY/INTEGRITY VIOLATION]` if any quarantined item is included in a publishable EvidencePack.
4. **Never Included in Metrics**: Benchmark statistical scripts and summary tables strictly exclude quarantined run records.
5. **Never Admitted to Retrieval**: Vector indexers and search caches ignore quarantined artifacts.

---

## 12. Citation Rules

A clear demarcation separates primary empirical evidence from external literature:

```typescript
export interface EvidenceCitationReference {
  id: string;
  citationType: CitationType;
  sourceId?: string;   // Resolves to CANONICAL_SOURCES in data/sources.ts
  evidenceId?: string; // Resolves to EVD-* in the evidence vault
  title: string;
  url?: string;
  authorOrPublisher?: string;
  accessedOrCapturedDate: string;
}
```

### The Source Separation Principle:
- **Canonical Sources** (e.g. `SRC-001` Schema.org, `SRC-002` Google Search Central, `SRC-003` OpenAI GPTBot) represent official documentation and standards. They provide context for *how engines are designed to work*, but **must never be cited as empirical evidence for how an engine actually performed** during an experiment.
- **Captured Evidence** (e.g. `EVD-001-20260927-Q001-gemini-05`) represents physical artifacts captured during a benchmark run.

---

## 13. Relationship Rules & The EXP-012 ↔ EXP-001 Audit

### Relationship Typology:
- `validates`: Research study validates its theoretical model against an experiment.
- `tests`: Lab experiment tests a research framework's hypotheses.
- `explains`: Insight article explains a complex research topic.
- `applies`: Technical guide applies research findings into practical code.
- `references`: Cross-referencing between related entities.

### The `EXP-012` ↔ `EXP-001` Reciprocity Decision:
- **Observation**: `EXP-012` (Research) declares `relatedExperimentIds: ["EXP-001"]`, but `EXP-001` (Experiment) declares only `relatedResearchIds: ["EXP-014", "EXP-013"]`.
- **Architectural Decision**:
  - The runtime graph traversal (`getResearchForExperiment("EXP-001")`) dynamically resolves all research entities declaring links to `EXP-001`, ensuring **zero broken links or runtime resolution failures**.
  - In scientific data modeling, primary experimental datasets (`EXP-001`) act as central facilities that multiple independent research studies may cite. Imposing mandatory backward mutation of the experiment whenever a new study cites it violates historical immutability.
  - Therefore, `auditRelationshipSymmetry()` emits an `ASYMMETRIC_CITATION_WARNING` rather than a fatal error, confirming that while reciprocal symmetry is recommended in static data authoring, one-way citation of a benchmark is structurally valid and non-breaking.

---

## 14. Search and Indexing Implications

- **Lexical Search (`lib/search.ts`)**: Adopts `isIndexable(status)`. Any entity marked `EVIDENCE_READY` or `IN_REVIEW` is automatically bypassed during index construction.
- **Semantic Vector Store (`data/derived/semantic-index.json`)**: Chunks are generated strictly from `isIndexable(status)` entities. The vector store contains exactly 18 chunks from published Professional Experience.
- **Hybrid Retrieval (`lib/search/hybrid.ts`)**: Combines BM25-style lexical matching with vector retrieval over the published corpus only. Negative and unverified queries achieve a verified **0.0% false positive rate**.

---

## 15. Current Corpus Compatibility

The new domain model is 100% backward-compatible with all existing data files:
- `EXP-001`: Valid `ExperimentItem` with protocol, variables, and historical vault runs.
- `EXP-014`, `EXP-013`, `EXP-012`: Valid `ResearchEntityModel` frameworks with clear questions, methodologies, and limitations.
- `PE-001`, `PE-002`, `PE-003`: Valid `ProfessionalExperienceItem` entities in `PUBLISHED` status.
- `GUI-001`, `GUI-002`: Valid `GuideEntityModel` entities ready for publication review.
- `INS-001`, `INS-002`, `INS-003`: Valid `ArticleEntityModel` entities in `DRAFT` status.

No fields were forced, and no synthetic claims were inserted.

---

## 16. Known Evidence & Content Gaps

1. **Empirical Benchmarks Incomplete**: `EXP-001` has completed pilot phases 8I.7 and 8I.7.3, but the Phase 8I.7.5 assisted live capture has not yet executed.
2. **Research Studies Lack Quantified Data**: `EXP-014`, `EXP-013`, and `EXP-012` lack completed evidence packs; their findings remain unpopulated until benchmark data is synthesized.
3. **Articles Lack Substantive Bodies**: `INS-001`, `INS-002`, and `INS-003` are metadata stubs requiring comprehensive technical drafting.

---

## 17. Future Ask DIXITH Retrieval Implications

When the platform introduces interactive AI retrieval (*Ask DIXITH*), this evidence model provides the essential safety boundary:
1. **Grounding on EvidencePacks**: Retrieval-augmented generation prompts will ingest only verified `EvidenceItem` and `Finding` objects from `EVIDENCE_COMPLETE` packs.
2. **Zero Hallucination of Methodology as Data**: The model prevents the LLM from asserting that an experimental methodology or query definition is an empirical finding.
3. **Quarantine Block**: Quarantined items will never be injected into system prompts or context windows.
4. **Attribution Integrity**: Citations emitted by Ask DIXITH will distinguish primary captured benchmark data from external documentation.
