# Phase 8J.6 — Research Readiness & End-to-End Evidence Pipeline Audit Report

**Date:** 2026-09-29  
**Auditor:** Antigravity AI Engineering  
**Scope:** Research Readiness & End-to-End Evidence Pipeline Audit for DIXITH AI Search Research Platform  
**Execution Mode:** Strictly Offline Only (Zero external APIs, zero browser launches, zero CDP connections, zero data fabrication)

---

## 1. Executive Summary & Audit Context

Phase 8J.6 conducts the comprehensive research-readiness and pipeline audit for the **DIXITH** platform—a specialized personal AI Search research and knowledge architecture. Following the completion of previous auditing phases:
- **Phase 8G:** Search Architecture & Hybrid Retrieval (Lexical + Semantic + Reciprocal Rank Fusion)
- **Phase 8H:** Research Corpus Readiness & Normalization
- **Phase 8I:** Research Protocol, Query Battery (96 queries), & Evidence Capture Infrastructure
- **Phase 8J.1:** Research Corpus Audit (25 content entities + 1 author)
- **Phase 8J.2:** Evidence & Publication Domain Model (Epistemological hierarchy contracts)
- **Phase 8J.3:** Publication Gate & Content Eligibility Audit (Fail-closed gating boundary)
- **Phase 8J.4:** Search Quality Audit & Retrieval Integrity (Exclusion of draft/unpublished research)
- **Phase 8J.5:** Knowledge Graph & Relationship Integrity Audit (Typed bidirectional links & cycle-free topology)

Phase 8J.6 evaluates technical, operational, and epistemological readiness to conduct live cross-engine research without compromising data integrity, user privacy, or platform reliability.

### Key Audit Findings
1. **Methodological & Epistemological Readiness:** `READY`. The research protocol (`EXP-001`), query battery (96 standardized queries), and epistemological hierarchy (`Observation` $\rightarrow$ `Measurement` $\rightarrow$ `Finding` $\rightarrow$ `Interpretation` $\rightarrow$ `Limitation`) are fully formalized, typed, and mathematically grounded.
2. **Offline Tooling & Runner Integrity:** `READY`. The assisted dry-run harness, collision refusal mechanisms, historical folder write protection, and cohort/account validation rules are operational and 100% verified offline.
3. **Capture Execution Reality:** `CONDITIONALLY READY` (Assisted) / `BLOCKED` (Automated Unattended). Automated, headless AI search scraping is completely blocked by contemporary anti-bot architectures (Cloudflare Turnstile, browser fingerprinting, mandatory CAPTCHA, and mandatory login walls across 4 of 6 engines). The platform's designed fallback—**Assisted Researcher-Controlled Capture via local loopback CDP**—is technically functional and ready for controlled single-query execution.
4. **Historical Evidence Preservation:** `VERIFIED`. Historical evidence artifact `RUN-001-20260927-Q001-gemini-05.txt` matches SHA-256 `fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c` bit-for-bit. Quarantined incident artifact `RUN-001-20260927-Q001-gemini-01.txt` (SHA-256 `6baf3ac23e9183e128436c83b75defefb5ba492c4e5a9ba7851be74c4287e24c`) remains preserved on disk but strictly isolated from publication and retrieval indices.
5. **Publication Gate & Retrieval Isolation:** `VERIFIED`. All unpublished research entities (`EXP-012`, `EXP-013`, `EXP-014`, `EXP-001`) remain strictly isolated from public search indices, sitemaps, and public graph traversal.

---

## 2. End-to-End Pipeline Architecture & Stage Taxonomy

The DIXITH research lifecycle represents an unbroken chain of custody from conceptual question formulation to public AI discovery:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               DIXITH RESEARCH LIFECYCLE                                  │
└────────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
   ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
   ▼                                         ▼                                         ▼
[1. FORMULATION]                     [2. SPECIFICATION]                        [3. REGISTRY]
Research Questions ───────►          Experiment Protocol ───────►              Query Battery (96)
Primary & Sub-questions              Methodology & Controls                    Systems Registry (6)
   │                                         │                                         │
   └─────────────────────────────────────────┼─────────────────────────────────────────┘
                                             │
   ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
   ▼                                         ▼                                         ▼
[4. PREFLIGHT]                       [5. EXECUTION]                            [6. INGESTION]
Preflight Plan & Run ID ──►          Assisted Browser & CDP ─────►             Raw Artifact Vault
Deterministic Paths                  Researcher Interactive UI                 (txt, html, png, json)
   │                                         │                                         │
   └─────────────────────────────────────────┼─────────────────────────────────────────┘
                                             │
   ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
   ▼                                         ▼                                         ▼
[7. EPISTEMOLOGY]                    [8. SYNTHESIS]                            [9. DISCOVERY]
Observations ──────►                 Research Study Authoring ──►              Publication Gate ──►
Measurements ──────►                 Limitations & Provenance                  Public Graph & Search
Findings ──────────►                                                           Ask DIXITH Grounding
Interpretations ───►
```

---

## 3. Stage-by-Stage Readiness Classification

Each stage is classified strictly into one of: `READY`, `CONDITIONALLY READY`, `BLOCKED`, `NOT IMPLEMENTED`, `NOT APPLICABLE`.

| Stage # | Stage Name | Classification | Primary Evaluation & Evidence |
|:---:|:---|:---:|:---|
| **1** | Research Question Formulation | **READY** | Formally specified in `docs/exp-001-research-protocol.md` Section 2. Primary question and 4 secondary sub-questions established. |
| **2** | Experiment Protocol Specification | **READY** | Documented in `docs/exp-001-research-protocol.md`. Covers methodology, variables, UI citation rendering models, and controls. |
| **3** | Query Battery Registration | **READY** | `evidence/exp-001/registry/queries.json` contains exactly 96 queries across 6 categories (16 per category). Zero duplicates, zero forbidden engines. |
| **4** | Systems Registry Management | **READY** | `evidence/exp-001/registry/systems.json` contains exactly 6 canonical platforms. Validated against `SystemRegistryEntry` schema. |
| **5** | Capture Run Planning & Preflight | **READY** | `executeAssistedDryRun` generates deterministic run IDs, paths, and metadata plans without side effects. |
| **6** | Browser & CDP Control Architecture | **CONDITIONALLY READY** | Local loopback CDP (`http://127.0.0.1:9222`) validated. Requires manual launch of Chrome by researcher; automated launch blocked by security controls. |
| **7** | Raw Evidence Capture & Ingestion | **CONDITIONALLY READY** | Assisted capture harness records text, HTML, PNG, and JSON metadata. Automated unattended capture is BLOCKED by external anti-bot walls. |
| **8** | Evidence Item Structuring & Validation | **READY** | `EvidenceItem` contract implemented with SHA-256 verification and quarantine isolation (`validateEvidenceItem`). |
| **9** | Evidence Pack Compilation | **READY** | `EvidencePack` schema and `validateEvidencePack` validator enforce structural completeness and reject corrupted runs. |
| **10** | Observation Extraction | **READY** | Typed observations (`TEXT_RESPONSE`, `CITATION_LINK`, `DOM_STRUCTURE`, etc.) enforce objective recording without subjective evaluation. |
| **11** | Quantitative Measurement | **READY** | `Measurement` contract requires explicit `calculationMethod` and references to underlying evidence and observations. |
| **12** | Empirical Finding Formulation | **READY** | `validateFinding` enforces fail-closed evidence grounding. Findings without physical evidence IDs or observables are rejected. |
| **13** | Architectural Interpretation | **READY** | `validateInterpretation` enforces that every interpretation points to a valid, supported Finding. |
| **14** | Methodological Limitation Documentation | **READY** | 7 limitation scopes formalized (`ALGORITHMIC_DRIFT`, `GEOGRAPHIC_VARIATION`, `SESSION_PERSONALIZATION`, etc.). |
| **15** | Research Study Authoring | **READY** | Structured data entities (`EXP-012`, `EXP-013`, `EXP-014`) exist in corpus with complete metadata, waiting for empirical evidence. |
| **16** | Publication Gate & Integrity Verification | **READY** | `lib/research/publication-gate.ts` enforces fail-closed gate. Research without complete EvidencePacks is rejected from publication. |
| **17** | Published Knowledge Graph Ingestion | **READY** | `lib/content-utils.ts` traversal APIs enforce public-only filtering (`isIndexable`), preventing unpublished research leak. |
| **18** | Search Indexing & Hybrid Retrieval | **READY** | BM25 lexical, semantic vector store, and RRF hybrid retrieval strictly exclude unpublished research entities. |
| **19** | Future Ask DIXITH Retrieval & Grounding | **READY** | Structural foundations ready: clean retrieval boundaries, typed evidence packs, and canonical source provenance established. |

---

## 4. Stage Details & Architectural Analysis

### Stage 1: Research Question Formulation (`READY`)
- **Primary Research Question:** *"How do identical informational and entity queries diverge in citation density, domain authority distribution, entity alignment, and answer structure across the six major AI search platforms?"*
- **Secondary Research Questions:**
  1. *Citation Association:* Claim-level vs. paragraph-level attribution.
  2. *Domain Diversity:* Root domain overlap between search-native and parametric LLM systems.
  3. *Structured Data Sensitivity:* Impact of Schema.org entity graphs on citation selection.
  4. *Temporal Stability:* Longitudinal variance under identical session conditions.

### Stage 2: Experiment Protocol Specification (`READY`)
- Experiment `EXP-001` (*Same Question / Six Systems*) is fully specified in `docs/exp-001-research-protocol.md`.
- Protocol details experimental controls: non-personalized sessions, fresh browser profiles, single-variable query variations, completion wait times ($\ge 5$ seconds network idle), and cryptographic artifact hashing.
- Defines clear boundary rules prohibiting data fabrication, simulated citations, or hypothetical metric synthesis.

### Stage 3: Query Battery Registration (`READY`)
- Canonical Query Battery is persisted at `evidence/exp-001/registry/queries.json`.
- **Query Count:** Exactly 96 queries.
- **Distribution:** Exactly 16 queries per category across 6 standardized categories:
  - `FACTUAL`: 16 queries (e.g. Q-001 RFC 9110 status codes)
  - `EXPLANATORY`: 16 queries (e.g. conceptual mechanisms)
  - `COMPARISON`: 16 queries (e.g. technological differences)
  - `ENTITY`: 16 queries (e.g. unambiguous entity definitions)
  - `TECHNICAL`: 16 queries (e.g. code specifications, protocols)
  - `CURRENT_INFORMATION`: 16 queries (e.g. freshness-sensitive lookups)
- **Integrity:** Zero duplicate IDs, zero duplicate query strings, all associated with `EXP-001`, all targeting 6 canonical engines.

### Stage 4: Systems Registry Management (`READY`)
- Systems Registry is persisted at `evidence/exp-001/registry/systems.json`.
- **Canonical Engines (6):**
  1. `SYS-001`: Google AI Overview (Google)
  2. `SYS-002`: ChatGPT (OpenAI)
  3. `SYS-003`: Perplexity (Perplexity AI)
  4. `SYS-004`: Claude (Anthropic)
  5. `SYS-005`: Gemini (Google)
  6. `SYS-006`: Microsoft Copilot (Microsoft)
- **Prohibited Systems:** Unverified engines (`You.com`, `SearchGPT` standalone, `Phind`, `Genspark`) are explicitly excluded and rejected by registry integrity checks.

### Stage 5: Capture Run Planning & Preflight (`READY`)
- Preflight planning engine (`executeAssistedDryRun` in `lib/research/assisted-capture.ts`) computes:
  - Exact query resolution from registry.
  - Deterministic run ID: `RUN-001-<date>-<qid>-<sys>-<run>`.
  - Artifact path resolution for text, DOM HTML, screenshot PNG, and run JSON.
  - Host validation and CDP loopback availability.

### Stage 6: Browser & CDP Control Architecture (`CONDITIONALLY READY`)
- **Architecture:** Local CDP loopback (`http://127.0.0.1:9222`) connecting to a researcher-controlled Google Chrome instance.
- **Researcher Control Requirement:** Chrome must be manually launched with `--remote-debugging-port=9222`. Automated launching is restricted to maintain researcher session isolation.
- **Condition:** Execution is conditional upon the researcher establishing the browser session, navigating to the target provider, and resolving initial security/access challenges.

### Stage 7: Raw Evidence Capture & Ingestion (`CONDITIONALLY READY`)
- **Capabilities:** Captures response text, full DOM snapshot, full-page screenshot, and timing metadata into `evidence/exp-001/raw/<date>/`.
- **Access Blocker:** Automated, headless capture across modern engines is completely infeasible due to Cloudflare Turnstile, browser fingerprinting, and authentication gates.
- **Operational Mode:** Only Assisted Capture via human-supervised browser is technically viable.

### Stage 8: Evidence Item Structuring & Validation (`READY`)
- `EvidenceItem` schema tracks physical file paths, SHA-256 digests, timestamps, system names, and provenance pointers.
- Cryptographic verification re-computes file digests on disk to ensure zero bit rot or tampering.

### Stage 9: Evidence Pack Compilation (`READY`)
- `EvidencePack` encapsulates all runs, observations, measurements, findings, and citations for an experimental campaign.
- `validateEvidencePack` verifies that all contained items are valid and that quarantined items are quarantined and excluded.

### Stage 10 to 14: Epistemological Hierarchy (`READY`)
- **Observation:** Direct, sensory statements of captured output without quality judgements.
- **Measurement:** Derived mathematical values (e.g. citation density per 100 words, domain overlap percentages).
- **Finding:** Evidentiary conclusions backed by observations and measurements with `hasSufficientEvidence: true`.
- **Interpretation:** Contextual reasoning and hypotheses explaining findings.
- **Limitation:** Explicit documentation of boundary conditions across 7 defined scopes.

### Stage 15 to 19: Publication & Discovery (`READY`)
- **Publication Gate:** Fail-closed boundary; non-`PUBLISHED` content is barred from public consumption.
- **Graph & Search Isolation:** Content in `IN_REVIEW`, `DRAFT`, or `ACTIVE` cannot be traversed or searched publicly.
- **Ask DIXITH Foundation:** Grounded retrieval ready for verified EvidencePacks once live execution produces empirical data.

---

## 5. Technical Infrastructure & Tooling Assessment

### 5.1. Runner Integrity & Safety Controls
Implemented in `lib/research/assisted-capture.ts` and verified in `scratch/test-runner-integrity.ts`:
1. **Collision Refusal (`verifyNoArtifactCollision`):** Rejects any run attempting to overwrite existing artifacts on disk.
2. **Historical Protection (`verifyHistoricalFolderProtection`):** Strictly prohibits writes to completed phase directories (`2026-09-24`, `2026-09-27`).
3. **Mandatory Run Number:** Fails closed if `--run-number` is omitted or non-positive.
4. **Cohort & Account Validation (`validateCohortAccountIntegrity`):** Rejects incompatible metadata combinations (e.g. `COHORT_A_LOGGED_OUT` with MFA enabled; `COHORT_C_RESEARCH_CLEAN` with `PERSONAL` account class).
5. **Timezone Normalization (`getResearchLocalDate`):** Maps timestamps deterministically into `Asia/Kolkata` research-local dates to avoid UTC/IST boundary mismatches.

### 5.2. Historical Evidence Audit & Hash Verification
The physical evidence repository was audited bit-for-bit:

| Run ID | File Path | Status | SHA-256 Digest | Audit Result |
|:---|:---|:---:|:---:|:---:|
| `RUN-001-20260927-Q001-gemini-05` | `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-05.txt` | `VERIFIED` | `fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c` | **MATCH** (Untouched) |
| `RUN-001-20260927-Q001-gemini-01` | `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.txt` | `QUARANTINED` | `6baf3ac23e9183e128436c83b75defefb5ba492c4e5a9ba7851be74c4287e24c` | **PRESERVED** (Isolated) |

---

## 6. Access Realities & External Engine Constraints

Modern generative answer engines present significant access boundaries that dictate experimental methodology:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL ENGINE ACCESS LANDSCAPE                     │
├──────────────────────┬───────────────────────┬─────────────────────────┤
│ System               │ Unauthenticated State │ Required Access Mode    │
├──────────────────────┼───────────────────────┼─────────────────────────┤
│ Google AI Overview   │ Google Search Web     │ Logged-Out / Search UI  │
│ ChatGPT (Search)     │ Mandatory Login Wall  │ Authenticated (Free/Pro)│
│ Perplexity           │ Rate-limited / Captcha│ Clean / Authenticated   │
│ Claude (Web Search)  │ Mandatory Login Wall  │ Authenticated Personal  │
│ Gemini               │ Mandatory Login Wall  │ Authenticated Personal  │
│ Microsoft Copilot    │ Limited Unauth Search │ Clean / Authenticated   │
└──────────────────────┴───────────────────────┴─────────────────────────┘
```

### Methodological Implications
1. **Unattended Headless Automation is Dead:** Provider defenses actively block bot traffic.
2. **Assisted Capture is the Scientific Standard:** A researcher-controlled, visible browser with local CDP attachment provides legitimate, observable, and reproducible capture without stealth scraping or proxy rotation.
3. **Explicit Cohort Attribution:** Because personal or authenticated accounts are often required, metadata must explicitly record account class (`RESEARCH_CLEAN` vs. `PERSONAL`) and subscription tier (`FREE` vs. `PAID`) without conflation.

---

## 7. Audit Test Suite Results (`scratch/test-phase8j6.ts`)

The dedicated Phase 8J.6 verification suite executed 45 assertions across 11 categories with a **100% pass rate (45/45 passed, 0 failed)**:

```
================================================================================
 DIXITH Phase 8J.6 — Research Readiness & End-to-End Pipeline Audit Suite
================================================================================

[Category 1: Research Corpus Integrity]
  ✓ 1. EXP-012 resolves from research corpus
  ✓ 2. EXP-013 resolves from research corpus
  ✓ 3. EXP-014 resolves from research corpus
  ✓ 4. EXP-001 resolves from experiments corpus
  ✓ 5. Research statuses unchanged: EXP-012..014 = IN_REVIEW, EXP-001 = ACTIVE

[Category 2: Research Protocol Specification]
  ✓ 6. Research protocol document exists on disk (docs/exp-001-research-protocol.md)
  ✓ 7. Protocol explicitly identifies experiment EXP-001 (Same Question / Six Systems)
  ✓ 8. Protocol explicitly identifies all 6 canonical AI search systems
  ✓ 9. Protocol explicitly identifies all 6 query categories
  ✓ 10. Protocol defines 5-tier epistemological evidence hierarchy

[Category 3: Query Battery Registry]
  ✓ 11. Query registry contains exactly 96 queries (found: 96)
  ✓ 12. Query battery defines exactly 6 distinct categories (found: 6)
  ✓ 13. Query battery has exactly 16 queries per category across all 6 categories
  ✓ 14. All 96 query IDs are strictly unique (unique IDs: 96)
  ✓ 15. All 96 queries are explicitly associated with experiment EXP-001
  ✓ 16. All 96 queries explicitly target all 6 canonical systems
  ✓ 17. Zero prohibited systems present in query battery target definitions
  ✓ 18. Zero duplicate query text strings across the battery (unique texts: 96)

[Category 4: System Registry Integrity]
  ✓ 19. Systems registry exists and contains exactly 6 canonical systems (found: 6)
  ✓ 20. Zero prohibited systems registered in systems.json
  ✓ 21. All 6 system registry entries are valid with required schema fields

[Category 5: Capture Harness & Runner Integrity]
  ✓ 22. Dry-run harness executes deterministically (runId: RUN-001-20260928-Q001-gemini-01)
  ✓ 23. Assisted capture harness plans valid relative artifact paths
  ✓ 24. Live capture mode is strictly gated (fails closed without explicit assistedLive flag)
  ✓ 25. Runner integrity requires explicit positive run number (fails closed if omitted)
  ✓ 26. Collision protection rejects existing run IDs (throws [COLLISION REFUSAL])

[Category 6: Evidence & Epistemological Model]
  ✓ 27. EvidencePack validator exists and validates schema completeness
  ✓ 28. Quarantined evidence is rejected by quarantine isolation validation
  ✓ 29. Invalid evidence is rejected by quarantine isolation validation
  ✓ 30. Missing provenance and empty supporting evidence rejected for findings
  ✓ 31. External citation cannot substitute for primary empirical evidence in findings
  ✓ 32. Interpretation requires an existing, validated Finding

[Category 7: Publication Gate & Content Eligibility]
  ✓ 33. Unpublished research (EXP-014) is blocked from publication gate due to missing EvidencePack
  ✓ 34. Published Professional Experience (PE-001) remains eligible for publication and retrieval
  ✓ 35. Publication gate is fail-closed: DRAFT, IN_REVIEW, and EVIDENCE_READY are not publishable

[Category 8: Knowledge Graph & Traversal Integrity]
  ✓ 36. Research relations resolve in content graph (EXP-001 connects to EXP-013, EXP-014)
  ✓ 37. Public graph filtering strictly excludes unpublished research entities (EXP-012..014 are IN_REVIEW)

[Category 9: Search & Discovery Isolation]
  ✓ 38. Unpublished research is strictly excluded from lexical search results
  ✓ 39. Unpublished research is strictly excluded from semantic search results
  ✓ 40. Unpublished research is strictly excluded from hybrid search results

[Category 10: Historical Evidence Preservation]
  ✓ 41. Historical gemini-05 raw text artifact SHA-256 matches expected (fa17ed9d99467d0f...)
  ✓ 42. Quarantined gemini-01 incident artifact exists on disk and preserved (6baf3ac23e9183e1...)

[Category 11: Experimental Reproducibility & Namespace Safety]
  ✓ 43. Deterministic run IDs generated correctly (RUN-001-20260928-Q001-chatgpt-02)
  ✓ 44. Deterministic artifact naming follows RUN-001-<date>-<qid>-<sys>-<run>.<ext> convention
  ✓ 45. Historical evidence folders (2026-09-24, 2026-09-27) are strictly protected against modification

================================================================================
 RESULTS: 45 passed, 0 failed (Total: 45/45)
================================================================================
```

---

## 8. Recommendations & Next Steps for Future Live Execution

1. **Maintain Assisted-Only Protocol:** Never attempt automated bot scraping against generative answer engines. Continue using researcher-supervised browser attachment via local loopback CDP (`http://127.0.0.1:9222`).
2. **Explicit Researcher Metadata Input:** Never infer or assume user account credentials, subscription tiers, or history settings. The researcher must explicitly supply `--cohort`, `--account-class`, and `--tier` for every live run.
3. **Incremental Pilot Execution (Phase 8I.7.5):** When live research resumes, execute only single-query pilots (`Q-001` across 6 systems, 1 query per system, zero retries, zero concurrency) to verify UI selectors and extraction contracts before broader battery execution.
4. **Preserve Quarantined Artifacts for Retrospective Analysis:** Retain `RUN-001-20260927-Q001-gemini-01` in quarantine as an audit benchmark for test harnesses and isolation rules.
5. **Proceed to Future Ask DIXITH Architecture:** With research pipelines audited and retrieval isolation verified, the system is ready for Ask DIXITH architecture design.
