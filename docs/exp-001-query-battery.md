# DIXITH Research Registry Specification: EXP-001 Query Battery

> [!IMPORTANT]
> **Document Purpose**: Internal Research Infrastructure Specification  
> **Experiment Reference**: `EXP-001` (*Same Question / Six Systems*)  
> **Status**: **STANDARDIZED REGISTRY FOUNDATION (PRE-EXECUTION)**  
> **Execution Gate**: No live search experiments have been run. All queries in this registry are defined as research targets, not completed executions.  
> **Data Fabrication Policy**: Strict Zero-Tolerance. No responses, citations, rankings, or metrics are fabricated.

---

## 1. Purpose & Scope

The **EXP-001 Query Battery** provides a formal, reproducible query inventory for benchmarking information retrieval and generative synthesis across the six canonical AI search platforms. 

Rather than executing improvised or ad-hoc prompts, the battery standardizes 96 carefully engineered query vectors across six distinct functional categories. This provides a balanced, controlled foundation to measure:
1. Direct answer extraction fidelity.
2. Citation density and claim-binding precision.
3. Domain authority distribution.
4. Entity recognition and Knowledge Graph disambiguation.
5. Technical code snippet syntax validity.
6. Temporal freshness and indexation latency.

---

## 2. The Six Canonical Systems

All 96 queries target exactly the six canonical AI search systems:

1. **Google AI Overview** (Search-Native RAG)
2. **ChatGPT** (Conversational LLM with Web Search Tooling)
3. **Perplexity** (Native Hybrid Search & Answer Engine)
4. **Claude** (Constitutional Reasoning LLM with Web Search)
5. **Gemini** (Multimodal Parametric Engine with Live Grounding)
6. **Microsoft Copilot** (Bing Search RAG)

*Prohibited/non-canonical systems (e.g., You.com, SearchGPT, Phind, Genspark) are strictly excluded from the registry.*

---

## 3. Query Battery Taxonomy & Distribution

The battery comprises **96 total queries**, with exactly **16 queries** allocated per category to prevent topical bias:

| Category | Query IDs | Target Focus | Primary Observables |
| :--- | :--- | :--- | :--- |
| **FACTUAL** | `Q-001` – `Q-016` | RFC specs, standard protocols, definitive constants | Numerical accuracy, direct answer presence, primary standards citations |
| **EXPLANATORY** | `Q-017` – `Q-032` | Multi-paragraph conceptual synthesis (RAG, crawl budget, SSR/SSG) | Synthesis structure, explanation depth, citation diversity, hallucination drift |
| **COMPARISON** | `Q-033` – `Q-048` | A vs B comparative evaluations (JSON-LD vs Microdata, BM25 vs dense vectors) | Balanced trade-off analysis, claim attribution, structured list/table formatting |
| **ENTITY** | `Q-049` – `Q-064` | Disambiguation of organizations, foundations, and specifications (W3C, IETF, NIST) | Entity recognition, sameAs resolution, authoritative domain citation |
| **TECHNICAL** | `Q-065` – `Q-080` | Concrete implementation syntax (JSON-LD, robots.txt, hreflang, rDNS) | Code snippet validity, syntax accuracy, developer documentation citations |
| **CURRENT_INFORMATION** | `Q-081` – `Q-096` | Active standards & evolving web policies (TC39 proposals, WinterCG, Schema.org releases, AI crawler tokens) | Temporal freshness, citation recency, indexation velocity, volatility |

---

## 4. Query ID & Status Conventions

- **ID Scheme**: Sequential deterministic identifiers: `Q-001`, `Q-002`, ..., `Q-096`. No random hashes or UUIDs.
- **Experiment Binding**: Every query explicitly declares `"experimentId": "EXP-001"`.
- **Status Convention**:
  - `DRAFT`: Query under review or subject to wording adjustment.
  - `APPROVED`: Query finalized, verified for non-personal safety, and locked for cohort execution.
  - All 96 queries in `evidence/exp-001/registry/queries.json` are currently set to `APPROVED`.

---

## 5. Registry File Architecture

The evidence and query infrastructure is maintained locally under `evidence/exp-001/`:

```
evidence/exp-001/
├── registry/
│   ├── queries.json              # Canonical 96-query registry (QueryRegistryMetadata)
│   └── systems.json              # 6-system specifications (SystemsRegistry)
├── runs/                         # [Reserved] Future run metadata records
│   └── YYYY-MM-DD/
├── raw/                          # [Reserved] Future raw response text, DOM, screenshots
│   └── YYYY-MM-DD/
└── metrics/                      # [Reserved] Future derived quantitative measurements
    └── cohort-summary.json
```

- **`queries.json`**: Contains full metadata, category distribution counters, and individual `QueryDefinition` records.
- **`systems.json`**: Documents providers, retrieval architectures, primary citation UI paradigms, and known limitations for the six canonical platforms without speculating on proprietary weights.

---

## 6. What Is Intentionally Not Executed Yet

In strict adherence to the Phase 8I.5 specifications:
1. **Zero Live Queries Executed**: No requests have been submitted to Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, or Microsoft Copilot.
2. **Zero Response Text Captured**: No `.txt`, `.html`, or `.png` files exist in `evidence/exp-001/raw/`.
3. **Zero Metrics Derived**: No citation density or domain overlap scores have been computed.
4. **Zero Status Changes**: `EXP-001` remains `ACTIVE`; `EXP-012`, `EXP-013`, and `EXP-014` remain `IN_REVIEW`.
5. **No Website Search Exposure**: The query battery is internal research infrastructure and is not indexed in the public search index (`searchContent`).

---

*Author: Dixith Kumar*  
*Framework: DIXITH AI Search Lab (Personal Research Project)*  
*Document Reference: `docs/exp-001-query-battery.md`*
