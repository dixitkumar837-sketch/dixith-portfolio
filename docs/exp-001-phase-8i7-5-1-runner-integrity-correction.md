# Phase 8I.7.5.1 — Assisted Capture Runner Integrity Correction
## Methodological Root Cause Analysis, Collision Safeguards, and Offline Verification

> [!IMPORTANT]
> **Audit Reference**: `PHASE-8I.7.5.1`  
> **Experiment Reference**: `EXP-001` (*Same Question / Six Systems*)  
> **Target Incident**: Ad-hoc Gemini capture attempt producing `RUN-001-20260927-Q001-gemini-01`  
> **Scope**: **STRICT OFFLINE CODE & RUNNER INTEGRITY CORRECTION ONLY**  
> **Operational Safeguards**: Zero live research queries, zero Chrome browser launches, zero CDP connections, zero external AI engine contacts, zero deletion of incident artifacts, zero commits/pushes/deployments.

---

## 1. Incident

On calendar date **2026-09-28 at 04:06:28 IST**, an ad-hoc live command was invoked:
```bash
npm run research:capture:assisted -- --system "Gemini" --query Q-001 --assisted-live
```
This single invocation resulted in an evidence integrity incident:
1. **Accidental Artifact Generation in Frozen Folder**:
   The runner generated artifacts into the completed Phase 8I.7.3 directory:
   * `evidence/exp-001/runs/2026-09-27/RUN-001-20260927-Q001-gemini-01.json`
   * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.txt`
   * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.html`
   * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.png`
2. **Discrepancy with Historical Phase 8I.7.3 Baseline**:
   In the frozen Phase 8I.7.3 baseline, Gemini was the 5th system in the sequence, recorded as:
   `RUN-001-20260927-Q001-gemini-05`.
   Because the standalone CLI defaulted to run number `1`, it produced `gemini-01`. While this fortunate naming discrepancy prevented overwriting the historical `gemini-05` artifact, it polluted the frozen `2026-09-27` historical directory.
3. **Cohort Metadata Misclassification**:
   The run record claimed:
   * `cohort`: `COHORT_C_RESEARCH_CLEAN`
   * `accountClass`: `RESEARCH_CLEAN`
   * `accountSubscriptionTier`: `FREE`
   However, the active browser session visibly showed an authenticated personal Google account with active **Gemini Advanced (Pro)** subscription status and historical conversation state.

---

## 2. Root Cause Analysis

The incident was caused by four interlocking architectural omissions:

1. **UTC vs. Local Timezone Dissonance**:  
   The harness previously called `formatUtcDateString(now)` and `formatUtcFolderString(now)`. At `04:06:28 IST` on `2026-09-28`, UTC time was `22:36:28` on `2026-09-27`. Consequently, the folder path resolved to `2026-09-27/` instead of `2026-09-28/`.
2. **Silent Defaulting of Run Number**:  
   In standalone CLI mode, omitting `--run-number` silently defaulted to `1`. In a multi-system research protocol, silent defaulting creates an immediate collision risk whenever an ad-hoc run is initiated.
3. **Absence of Collision Detection (Overwrite Vulnerability)**:  
   `writeEvidenceArtifacts()` executed unconditional `fs.writeFileSync()` calls. It lacked a fail-closed pre-flight check to verify whether a Run ID or any corresponding raw file (`.txt`, `.html`, `.png`, `.json`) already existed on disk.
4. **Hardcoded Fallbacks for Cohort Metadata**:  
   `scripts/research-capture-assisted.ts` defaulted to `COHORT_C_RESEARCH_CLEAN` and `FREE`. The harness did not enforce that live executions require explicit, researcher-confirmed cohort flags.
5. **Missing Phase Identification**:  
   Run records lacked an explicit `phaseId` field, relying entirely on directory date and system slug for historical disambiguation.

---

## 3. Run ID Collision Protection (Fail-Closed)

To prevent accidental modification or overwriting of research evidence:
* The helper function [`verifyNoArtifactCollision()`](file:///c:/paila%20Dixith%20kumar/lib/research/assisted-capture.ts) inspects all four target file paths before any browser attachment or action is initiated:
  1. `evidence/exp-001/runs/<folder>/<runId>.json`
  2. `evidence/exp-001/raw/<folder>/<runId>.txt`
  3. `evidence/exp-001/raw/<folder>/<runId>.html`
  4. `evidence/exp-001/raw/<folder>/<runId>.png`
* If **any** of these files exist on disk:
  > **Fatal Error**: `[COLLISION REFUSAL] Evidence artifact already exists... Refusing to overwrite existing research evidence for Run ID "${runId}".`
* In live mode (`--assisted-live`), `--run-number` is **strictly mandatory**. If omitted, execution halts immediately with `[SAFETY VIOLATION]`.

---

## 4. Research Date / Timezone Handling (`Asia/Kolkata`)

All experimental evidence paths and Run IDs are now governed by a centralized helper:
```typescript
export const RESEARCH_LOCAL_TIMEZONE = "Asia/Kolkata";

export function getResearchLocalDate(
  date: Date = new Date(),
  timeZone: string = RESEARCH_LOCAL_TIMEZONE
): { folderStr: string; dateStr: string }
```
* **Guaranteed Alignment**: At UTC `2026-09-27T22:36:28Z`, `getResearchLocalDate()` evaluates to `2026-09-28` in `Asia/Kolkata`.
* **Invariance**: The Run ID date token (`20260928`) and the directory path date (`2026-09-28/`) are generated from the same function call, ensuring strict identity parity.

---

## 5. Cohort Metadata Protection

The capture harness prohibits guessing or defaulting cohort metadata in live research:
1. **Mandatory Explicit Input**: Live execution requires `--cohort`, `--account-class`, and `--tier` (enforced via [`validateCohortAccountIntegrity()`](file:///c:/paila%20Dixith%20kumar/lib/research/assisted-capture.ts)).
2. **Consistency Rules**:
   * `LOGGED_OUT`: Must have `cohort === "COHORT_A_LOGGED_OUT"`, `authenticationStatus === "LOGGED_OUT"`, `mfaCompleted === false`, and `tier === "FREE"`.
   * `PERSONAL`: Must have `cohort === "COHORT_B_AUTHENTICATED_PERSONAL"`, `authenticationStatus === "AUTHENTICATED"`, and explicit tier (`FREE`, `PAID`, or `UNKNOWN`).
   * `RESEARCH_CLEAN`: Must have `cohort === "COHORT_C_RESEARCH_CLEAN"` and `accountClass === "RESEARCH_CLEAN"`. It cannot be inferred from a profile directory path.

---

## 6. Historical Evidence Protection

To protect completed phases:
```typescript
export const COMPLETED_PHASE_FOLDERS: readonly string[] = ["2026-09-24", "2026-09-27"];
```
* Any live execution attempting to target `2026-09-24` (Phase 8I.7) or `2026-09-27` (Phase 8I.7.3) without an explicit authorized override triggers `[HISTORICAL PROTECTION]` and terminates immediately before browser connection.

---

## 7. Phase Identification

* All run records now carry an explicit `phaseId` string attribute (e.g. `"8I.7.5"`).
* The CLI supports `--phase-id <id>`, defaulting to `"8I.7.5"` for current operations.
* Historical Phase 8I.7.3 run records remain unmutated.

---

## 8. Offline Test Coverage (`scratch/test-runner-integrity.ts`)

A dedicated offline test suite exercises all 10 required assertions without network or browser dependencies:

| Test ID | Test Target | Verification Result |
| :--- | :--- | :--- |
| **TEST 1** | Existing Run ID Collision | `PASS` (Throws `[COLLISION REFUSAL]` on historical `gemini-05`) |
| **TEST 2A** | Historical Folder Protection (`2026-09-27`) | `PASS` (Throws `[HISTORICAL PROTECTION]`) |
| **TEST 2B** | Historical Folder Protection (`2026-09-24`) | `PASS` (Throws `[HISTORICAL PROTECTION]`) |
| **TEST 3** | UTC/IST Timezone Boundary | `PASS` (UTC `2026-09-27T22:36:28Z` maps to `2026-09-28`) |
| **TEST 4** | Missing Run Number in Live Mode | `PASS` (Throws `[SAFETY VIOLATION]`) |
| **TEST 5** | Missing Live Cohort Metadata | `PASS` (Throws `[SAFETY VIOLATION]`) |
| **TEST 6** | `PERSONAL` + `PAID` + `AUTHENTICATED` | `PASS` (Validated as legitimate metadata combination) |
| **TEST 7** | `LOGGED_OUT` + `mfaCompleted: true` | `PASS` (Fails validation as logically inconsistent) |
| **TEST 8** | `RESEARCH_CLEAN` without explicit declaration | `PASS` (Fails validation) |
| **TEST 9** | Run ID Date == Folder Date Parity | `PASS` (`20260928` matched in both Run ID and relative path) |
| **TEST 10**| Phase 8I.7.5 Namespace Separation | `PASS` (Strictly separated from frozen 8I.7.3 namespace) |

---

## 9. Handling of Invalid `gemini-01` Incident Artifacts

In strict adherence to experimental governance:
* **The four files remain physically on disk**:
  * `evidence/exp-001/runs/2026-09-27/RUN-001-20260927-Q001-gemini-01.json`
  * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.txt`
  * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.html`
  * `evidence/exp-001/raw/2026-09-27/RUN-001-20260927-Q001-gemini-01.png`
* **Status**: **STRICTLY QUARANTINED**.
* They are **EXCLUDED** from:
  * [`evidence/exp-001/metrics/pilot-8i73-summary.json`](file:///c:/paila%20Dixith%20kumar/evidence/exp-001/metrics/pilot-8i73-summary.json)
  * [`docs/exp-001-phase-8i7-4-scale-readiness-audit.md`](file:///c:/paila%20Dixith%20kumar/docs/exp-001-phase-8i7-4-scale-readiness-audit.md)
  * All upcoming Phase 8I.7.5 summaries, benchmarks, and reports.
* Historical `RUN-001-20260927-Q001-gemini-05` remains the sole, valid Phase 8I.7.3 Gemini run record.

---

## 10. Remaining Methodological Limitations

1. **Provider Perimeter Defense**: Automated or assisted connection through CDP remains vulnerable to Cloudflare Turnstile or Google traffic challenge redirection in unauthenticated states.
2. **Manual Setup Responsibility**: The researcher must manually verify that Chrome is launched on port 9222 with an isolated user profile and the declared authentication tier prior to running the capture harness.

---

## 11. Scale-Up & Phase 8I.7.5 Technical Readiness

* **Codebase State**: All 9 runner-integrity protections are fully implemented and verified offline.
* **Integrity Status**: Zero live research queries executed, zero CDP connections active, and all historical Phase 8I.7 and 8I.7.3 evidence remain 100% frozen and intact.
* **Readiness Determination**: Phase 8I.7.5 is **TECHNICALLY READY** for controlled human-in-the-loop assisted capture execution.
