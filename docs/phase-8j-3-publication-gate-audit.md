# DIXITH — Phase 8J.3: Publication Gate & Content Eligibility Audit

**Specification Version**: 1.0  
**Phase**: Phase 8J.3 (Publication Gate Architecture & Content Eligibility Audit)  
**Implementation Modules**: `lib/research/publication-gate.ts`, `lib/research/evidence-model.ts`, `data/types.ts`  
**Execution Mode**: OFFLINE ONLY (Zero Live Capture / Zero External AI Contact)  
**Date**: September 28, 2026  

---

## 1. Executive Summary

Phase 8J.3 establishes and formalizes the **Publication Eligibility Gate** between the internal DIXITH knowledge corpus and all public discovery surfaces (Google Indexing, XML Sitemap, Lexical Search, Semantic Vector Index, Hybrid Retrieval, and future Ask DIXITH synthesis).

```
┌────────────────────────────────────────────────────────┐
│               INTERNAL KNOWLEDGE CORPUS                │
│ (Research, Experiments, Articles, Guides, Experience) │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                PUBLICATION GATEWAY                     │
│         (validatePublicationEligibility)               │
│ - Strict Fail-Closed Rule                              │
│ - Zero Promotion Based on Metadata Alone               │
│ - Mandatory Empirical EvidencePack for Research        │
│ - Mandatory Long-Form Body (>100w) for Articles        │
│ - Fatal Rejection of Quarantined/Invalid Artifacts     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│                PUBLIC DISCOVERY CORPUS                 │
│         (Google / Sitemap / Lexical / Semantic)        │
│ - Exclusively status === "PUBLISHED"                   │
│ - Zero DRAFT / IN_REVIEW / EVIDENCE_READY Leakage      │
└────────────────────────────────────────────────────────┘
```

### Key Verification Verdicts:
1. **Corpus Eligibility Today**: Exactly **3 of 12 primary content entities** (`PE-001`, `PE-002`, `PE-003`) are admitted to the public corpus. All 3 are verified `PUBLISHED` professional experience profiles.
2. **Research Entities Blocked**: All 3 Research studies (`EXP-014`, `EXP-013`, `EXP-012`) fail the publication gate due to the complete absence of compiled empirical `EvidencePack` objects.
3. **Articles Blocked**: All 3 Articles (`INS-001`, `INS-002`, `INS-003`) fail the publication gate due to empty body text (0 words).
4. **Guides Protected**: Both Guides (`GUI-001`, `GUI-002`) fail the publication gate because their status is currently `DRAFT`, despite possessing complete technical implementations.
5. **Leakage Audit**: Verified **0 leaked URLs** in XML sitemap, **0 leaked documents** in lexical search, and **0 leaked chunks** in the semantic vector store.
6. **Historical Vault Integrity**: Confirmed bit-for-bit freezing of `RUN-001-20260927-Q001-gemini-05` and quarantined isolation of `gemini-01`.

---

## 2. Publication Eligibility Contract

The publication eligibility contract ([`lib/research/publication-gate.ts`](file:///c:/paila%20Dixith%20kumar/lib/research/publication-gate.ts)) enforces a strict, fail-closed validation boundary:

```typescript
export interface PublicationEligibilityResult {
  eligible: boolean;
  status: ContentStatus;
  entityId: string;
  entityType: EntityType | string;
  blockers: string[];
  warnings: string[];
  gateDetails: {
    hasRequiredMetadata: boolean;
    hasSubstantiveContent: boolean;
    hasValidRelationships: boolean;
    hasEvidencePack: boolean;
    evidencePackComplete: boolean;
    hasUnsupportedFindings: boolean;
    isQuarantined: boolean;
    isExplicitlyPublished: boolean;
    isPublicRetrievalEligible: boolean;
  };
}
```

### Inviolable Gatekeeper Rules:
1. **Explicit Status Only**: No entity may enter the public corpus unless `status === "PUBLISHED"`.
2. **Intermediate States Protected**: `EVIDENCE_READY` signifies verified data completeness, but remains **strictly non-indexable** (`isIndexable() === false`) until explicit editorial approval.
3. **Fail-Closed on Gaps**: If any required field, body text, or empirical evidence is missing, `eligible = false`. The gate never infers, synthesizes, or placeholders missing data.

---

## 3. Publication State Machine

The platform formalizes a unidirectional lifecycle state machine:

```
  DRAFT
    ↓
  IN_REVIEW
    ↓
  EVIDENCE_READY  (Empirical benchmarks verified; awaiting editorial sign-off)
    ↓
  PUBLISHED       (Sole status eligible for search/sitemap/indexing)
    ↓
  ARCHIVED
```

### State Machine Transition Table:

| Current Status | Allowed Next Statuses | Constraints |
|---|---|---|
| `DRAFT` | `IN_REVIEW`, `ARCHIVED` | Cannot skip directly to `PUBLISHED` |
| `IN_REVIEW` | `EVIDENCE_READY`, `DRAFT`, `ARCHIVED` | Returns to `DRAFT` if revisions needed |
| `EVIDENCE_READY` | `PUBLISHED`, `IN_REVIEW`, `DRAFT`, `ARCHIVED` | Requires `eligibility.eligible === true` to reach `PUBLISHED` |
| `ACTIVE` | `COMPLETED`, `IN_REVIEW`, `ARCHIVED` | Active laboratory experiment status |
| `COMPLETED` | `EVIDENCE_READY`, `IN_REVIEW`, `ARCHIVED` | Captures finished; evidence compiling |
| `PUBLISHED` | `ARCHIVED`, `IN_REVIEW` | Can be unpublished back to `IN_REVIEW` |
| `ARCHIVED` | `DRAFT`, `IN_REVIEW` | Retired historical content |

---

## 4. Content-Type Publication Rules

### 4.1 Research Studies (`ResearchEntityModel`)
- **Required Metadata**: `id`, `slug`, `title`, `status`, `authorId`, `category`, `type`.
- **Methodology & Scope**: Formal research question ($\ge 20$ chars), methodology ($\ge 30$ chars), and documented limitations ($\ge 1$).
- **Empirical Grounding Requirement**: **Mandatory `EvidencePack`**.
  - A research study cannot be published merely because its protocol, query battery, or methodology is well-documented.
  - Must trace every finding:
    $$\text{Finding} \longrightarrow \text{Observation / Measurement} \longrightarrow \text{Evidence Item} \longrightarrow \text{Research Run} \longrightarrow \text{Experiment} \longrightarrow \text{Research}$$
  - The presence of ungrounded findings (`hasSufficientEvidence === false`) causes fatal gate rejection.

### 4.2 Lab Experiments (`ExperimentItem`)
- **Required Metadata**: `id`, `slug`, `title`, `purpose`, `variables`, `systemsTested`.
- **Execution State**: Status must be `COMPLETED` or `PUBLISHED`. Status `ACTIVE` is strictly rejected.
- **Evidence Requirement**: Must link to actual captured runs in `evidence/exp-001/runs/`. Protocol documentation alone is rejected as empirical evidence.

### 4.3 Insight Articles (`ArticleEntityModel`)
- **Substantive Body Rule**: The `body` text must be non-empty and contain **at least 100 words**. Metadata-only stubs fail closed.
- **Attribution**: Mandatory `authorId` (`AUT-001`).
- **Sources & Relations**: All `sourceIds` and `relatedResearchIds` must resolve to verified canonical entities.

### 4.4 Implementation Guides (`GuideEntityModel`)
- **Step-by-Step Completeness**: Must contain $\ge 1$ structured `GuideStep` with code snippets or explicit command instructions.
- **Prerequisites**: Must explicitly declare technical prerequisites.
- **Status Gating**: While in `DRAFT`, guides are non-indexable regardless of content length.

### 4.5 Professional Experience (`ProfessionalExperienceItem`)
- **Content Requirements**: Substantive `overview` ($\ge 30$ chars), `responsibilities` ($\ge 1$), `technicalFocus` ($\ge 1$), and standardized confidentiality `disclosure`.
- **Status**: Currently `PUBLISHED` and active.

---

## 5. Evidence Safety & Quarantine Rules

The publication gate rigorously filters evidence artifacts before admittance to publishable packs:

1. **`QUARANTINED` Evidence**:
   - Rejection is fatal (`[SECURITY/INTEGRITY VIOLATION]`).
   - Incident artifact `RUN-001-20260927-Q001-gemini-01` is strictly quarantined and cannot be used in findings, metrics, or public pages.
2. **`INVALID` Evidence**:
   - Corrupted checksums or malformed payloads are immediately rejected.
3. **`UNAVAILABLE` Evidence**:
   - Blocked or timed-out runs cannot be counted as completed captures.
4. **`INCOMPLETE` Evidence**:
   - Partial captures are excluded from complete benchmark aggregation.
5. **Source vs Evidence Separation**:
   - External standards (`SRC-001` Schema.org, `SRC-002` Google Search Central) are reference citations, not empirical evidence of engine behavior.

---

## 6. Current Corpus Eligibility Results

Every entity in the DIXITH repository was evaluated against the publication gate:

| Entity ID | Type | Title | Status | Gate Verdict | Primary Blocker / Reason |
|---|---|---|---|---|---|
| `PE-001` | Experience | Healthcare Search Architecture | `PUBLISHED` | **ELIGIBLE** | 0 blockers. Active in public corpus. |
| `PE-002` | Experience | International Search Architecture | `PUBLISHED` | **ELIGIBLE** | 0 blockers. Active in public corpus. |
| `PE-003` | Experience | E-Commerce Search & Discovery | `PUBLISHED` | **ELIGIBLE** | 0 blockers. Active in public corpus. |
| `GUI-001` | Guide | Schema.org Entity Graphs | `DRAFT` | **BLOCKED** | Status is `DRAFT`; requires editorial publish |
| `GUI-002` | Guide | Crawler Access & Index Hygiene | `DRAFT` | **BLOCKED** | Status is `DRAFT`; requires editorial publish |
| `INS-001` | Article | Understanding RAG in Search | `DRAFT` | **BLOCKED** | Status `DRAFT` + zero body content (0 words) |
| `INS-002` | Article | Shift to Entity Trust | `DRAFT` | **BLOCKED** | Status `DRAFT` + zero body content (0 words) |
| `INS-003` | Article | Technical SEO Auditing for AI | `DRAFT` | **BLOCKED** | Status `DRAFT` + zero body content (0 words) |
| `EXP-014` | Research | Citation Patterns in AI Search | `IN_REVIEW` | **BLOCKED** | Status `IN_REVIEW` + lacks EvidencePack |
| `EXP-013` | Research | How Entities Influence Search | `IN_REVIEW` | **BLOCKED** | Status `IN_REVIEW` + lacks EvidencePack |
| `EXP-012` | Research | Testing Generative Visibility | `IN_REVIEW` | **BLOCKED** | Status `IN_REVIEW` + lacks EvidencePack |
| `EXP-001` | Experiment | Same Question / Six Systems | `ACTIVE` | **BLOCKED** | Status `ACTIVE` (in lab) + lacks compiled pack |

---

## 7. Public Discovery & Retrieval Safety

The public surfaces were audited to confirm zero leakage:

### 1. XML Sitemap (`app/sitemap.ts`)
- Core static routes: 7 URLs (`/`, `/research`, `/ai-search-lab`, `/articles`, `/guides`, `/professional-experience`, `/about`).
- Dynamic published routes: Exactly 3 URLs (the 3 published `PE` items).
- Excluded routes: `/search` (internal search results), all 3 Research slugs, the Experiment slug, all 3 Article slugs, and both Guide slugs.
- Total URLs emitted: **Exactly 10**.

### 2. Lexical Search (`lib/search.ts`)
- Index construction: strictly calls `isIndexable(item.status)`.
- Admitted documents: Exactly 3 documents (`PE-001`, `PE-002`, `PE-003`).

### 3. Semantic Vector Store (`data/derived/semantic-index.json`)
- Vector chunks: Exactly 18 chunks (`PE-001-c0..c5`, `PE-002-c0..c5`, `PE-003-c0..c5`).
- Leaked unpublished chunks: **0**.

### 4. Hybrid Search (`lib/search/hybrid.ts`)
- Negative query false positive rate: **0.0%**.
- Draft titles cannot be matched as primary standalone search hits.

---

## 8. Historical Evidence Vault Verification

Before and after the audit, the integrity of historical vault artifacts was verified:

### Canonical Historical Artifact:
- **File**: `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-05.txt`
- **Expected SHA-256**: `fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c`
- **Computed SHA-256**: `fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c`
- **Verdict**: **Bit-for-bit match. 100% frozen and untouched.**

### Quarantined Incident Artifact:
- **File**: `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.txt`
- **SHA-256**: `6baf3ac23e9183e128436c83b75defeefb5ba492c4e5a9ba7851be74c4287e24c`
- **Verdict**: **Preserved on disk; strictly quarantined and excluded from all public gates.**

---

## 9. Test Suite Verification (`scratch/test-phase8j3.ts`)

A dedicated 28-assertion test suite was authored and executed:

```text
================================================================================
 DIXITH Phase 8J.3 — Publication Gate & Content Eligibility Test Suite
================================================================================

[Section 1: Lifecycle Status Gating & State Machine]
  ✓ [PASS] Assertion 1: DRAFT rejected from publication gate
  ✓ [PASS] Assertion 2: IN_REVIEW rejected from publication gate
  ✓ [PASS] Assertion 3: EVIDENCE_READY is not automatically public or indexable
  ✓ [PASS] Assertion 4: PUBLISHED accepted when valid
  ✓ [PASS] Assertion 4B: Cannot jump directly from DRAFT to PUBLISHED

[Section 2: Content Completeness & Metadata Validation]
  ✓ [PASS] Assertion 5: Missing body rejected where body is required
  ✓ [PASS] Assertion 6: Missing title rejected
  ✓ [PASS] Assertion 7: Missing slug rejected
  ✓ [PASS] Assertion 8: Missing author rejected where required
  ✓ [PASS] Assertion 9: Broken source and entity relationships rejected

[Section 3: Evidence Validity, Provenance & Quarantine Enforcement]
  ✓ [PASS] Assertion 10: Broken evidence reference recognized
  ✓ [PASS] Assertion 11: QUARANTINED evidence rejected with fatal integrity violation
  ✓ [PASS] Assertion 12: INVALID evidence rejected with fatal integrity violation
  ✓ [PASS] Assertion 13: UNAVAILABLE evidence rejected from publication
  ✓ [PASS] Assertion 14: Incomplete required evidence rejected
  ✓ [PASS] Assertion 15: Finding lacking evidence provenance rejected
  ✓ [PASS] Assertion 16: Interpretation without finding rejected
  ✓ [PASS] Assertion 17: External source citation cannot be masqueraded as primary empirical evidence

[Section 4: DIXITH Repository Corpus Verification]
  ✓ [PASS] Assertion 18: PE-001 remains fully publication eligible
  ✓ [PASS] Assertion 19: PE-002 remains fully publication eligible
  ✓ [PASS] Assertion 20: PE-003 remains fully publication eligible
  ✓ [PASS] Assertion 21: INS-001 remains strictly non-indexable (DRAFT status + no body)
  ✓ [PASS] Assertion 22: GUI-001 remains non-indexable while in DRAFT status
  ✓ [PASS] Assertion 23: EXP-012 remains non-publishable without empirical evidence
  ✓ [PASS] Assertion 24: EXP-013 remains non-publishable without empirical evidence
  ✓ [PASS] Assertion 25: EXP-014 remains non-publishable without empirical evidence

[Section 5: Historical Evidence Vault & Discovery Safety]
  ✓ [PASS] Assertion 26A: Quarantined gemini-01 incident file exists on disk
  ✓ [PASS] Assertion 26B: Quarantined gemini-01 is preserved on disk but isolated from public retrieval
  ✓ [PASS] Assertion 27: Historical gemini-05.txt SHA-256 remains 100% frozen and untouched
  ✓ [PASS] Assertion 28: Sitemap exclusively exposes PUBLISHED professional experience; zero draft/in-review leakage

================================================================================
 RESULTS: All 28 Assertions Passed Successfully (0 failures)
================================================================================
```

---

## 10. Conclusion & Phase Completion

Phase 8J.3 is **100% complete and verified**:
- The publication gateway is formally implemented and validated.
- All 28 test assertions passed cleanly.
- `npx tsc --noEmit` reports 0 type errors.
- Regression suites (`test-phase8i6.ts`, `test-phase8g10.ts`) pass 100%.
- Next.js production build (`npm run build`) succeeded with 0 errors.
- Historical evidence remains untouched.
