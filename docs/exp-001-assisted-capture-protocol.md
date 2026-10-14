# EXP-001 Assisted / Interactive Capture Protocol
## Standardized Protocol for Assisted and Interactive Generative Search Capture

> [!IMPORTANT]
> **Protocol Specification**: `PHASE-8I.7.1`  
> **Experiment Reference**: `EXP-001` (*Cross-Engine Generative Retrieval & Citation Synthesis Protocol*)  
> **Protocol Stage**: **METHODOLOGY DESIGN ONLY (PRE-IMPLEMENTATION / ZERO LIVE EXECUTION)**  
> **Historical Pilot Status**: Phase 8I.7 Evidence Frozen (`48 Attempted / 0 Successful Answers / 32 Manual Auth Required / 16 Captcha Blocked`)  
> **Research Governance**: Personal DIXITH Project Only. Zero employer accounts, credits, API keys, infrastructure, secrets, or datasets. No external paid AI providers.

---

## 1. Purpose

The purpose of this protocol is to define a scientifically rigorous, transparent, and reproducible capture methodology for AI search systems that require user authentication, interactive verification, or human-in-the-loop navigation.

The automated Phase 8I.7 pilot demonstrated an unmistakable empirical fact: unauthenticated, headless browser automation cannot observe the generative answer states of modern commercial AI search platforms. In modern web architectures, unauthenticated automated requests encounter bot-mitigation gates (Cloudflare challenges, Google `/sorry/index` CAPTCHAs) or mandatory login screens (Claude, Gemini, ChatGPT, Microsoft Copilot).

To legitimately observe and record these systems without violating security protocols, fabricating data, or using illicit bot-evasion techniques, DIXITH requires a formalized **Assisted / Interactive Capture Protocol**. This protocol defines how a human researcher lawfully authenticates and interacts with systems in an isolated, monitored environment while a standardized local harness attaches to capture bit-exact, auditable research artifacts.

---

## 2. Relationship to Phase 8I.7

Phase 8I.7 executed the first controlled live capture pilot for EXP-001. Its primary objective was capture infrastructure and accessibility validation: testing whether a clean, unauthenticated Playwright browser instance could systematically retrieve generative answers and citations across the six canonical systems.

### Empirical Reality Established by Phase 8I.7:
1. **Infrastructure Behavior**: The Phase 8I.7 execution runner, directory partitioning, DOM serialization, full-page screenshot engine, cryptographic SHA-256 hashing, and TypeScript schema validators functioned with 100% mechanical stability (zero crashes, zero timeouts, zero unhandled errors).
2. **Access Barrier Reality**: Phase 8I.7 did **not** capture successful AI answers or citations because contemporary commercial AI search engines actively restrict unauthenticated or automated headless access.
3. **Methodological Next Step**: The critical methodological challenge is **not** finding ways to bypass security controls or spoof browser fingerprints. Rather, it is defining how a researcher can legitimately and ethically observe systems under authenticated or interactive conditions while maintaining experimental rigor, strict cohort isolation, and complete auditability.

---

## 3. Frozen Phase 8I.7 Evidence

All data generated during Phase 8I.7 on 2026-09-24 is hereby designated as **FROZEN HISTORICAL PILOT EVIDENCE**.

### Historical Pilot Metrics (Immutable Baseline):
* **Planned Runs**: 48 (8 queries $\times$ 6 canonical systems)
* **Attempted Runs**: 48
* **Completed (SUCCESSFUL Answer Captures)**: 0
* **Authentication Required (`MANUAL_AUTH_REQUIRED`)**: 32
  * ChatGPT: 8 runs
  * Claude: 8 runs
  * Gemini: 8 runs
  * Microsoft Copilot: 8 runs
* **Anti-Bot Interception (`CAPTCHA_BLOCKED`)**: 16
  * Google AI Overview: 8 runs (redirected to Google `/sorry/index` traffic verification)
  * Perplexity: 8 runs (intercepted by Cloudflare Turnstile / Managed Challenge)
* **Rate Limited (`RATE_LIMITED`)**: 0
* **Timeouts (`TIMEOUT`)**: 0
* **Navigation Errors (`PAGE_LOAD_FAILED`)**: 0

> [!CAUTION]
> **No Answer-Quality Conclusions**:  
> The Phase 8I.7 evidence is an accessibility and infrastructure benchmark only. It does **NOT** establish, evaluate, or imply:
> * Answer quality or completeness
> * Citation accuracy or density
> * Retrieval relevance or source authority
> * Entity visibility or schema influence
> * System superiority, performance scores, or rankings.
> 
> Every recorded data point reflects an observed browser/system state during the pilot; no successful AI answer responses were captured. The 48 historical JSON run records and their associated raw artifacts (`.txt`, `.html`, `.png`) are permanently preserved in `evidence/exp-001/` and will not be overwritten, re-executed, or deleted.

---

## 4. Research Cohorts

To prevent data contamination and invalid cross-engine comparisons, all future EXP-001 capture runs must be categorized into distinct, non-conflated research cohorts:

### Cohort A — Public / Logged-Out
* **Definition**: Clean, unauthenticated browser sessions with zero user accounts, zero cookies, zero stored localStorage, and zero search history.
* **Scope**: Evaluates what an engine provides to an anonymous guest user on the public web.
* **Empirical Reality**: Under pure automation, this cohort yields high rates of `MANUAL_AUTH_REQUIRED` and `CAPTCHA_BLOCKED` on modern systems.
* **Analytical Isolation**: Evidence from Cohort A must **never** be aggregated with or directly compared against authenticated cohorts without explicit methodological control.

### Cohort B — Authenticated / Interactive (Personal / Standard Account)
* **Definition**: Sessions where a researcher manually authenticates into a standard user account and completes necessary human verification (MFA, CAPTCHA, consent banners).
* **Scope**: Evaluates the generative search output experienced by an ordinary logged-in user.
* **Known Biases**: Subject to potential account-level personalization, user search history, and tier-specific features (e.g. GPT-4o vs. free tier, Pro search toggles).
* **Control Requirement**: Researcher must document all observable account settings, active models, and history toggles.

### Cohort C — Dedicated Research Account (Isolated Clean Account)
* **Definition**: A newly created, dedicated research account with:
  * Zero prior search, chat, or browsing history
  * Personalization, web history, and training data sharing explicitly disabled in account settings
  * Standardized default search settings across all sessions
* **Scope**: The preferred controlled cohort for minimizing historical account personalization, subject to platform availability, account-policy constraints, and the limitations documented elsewhere in this protocol. Minimizes historical personalization while legitimately satisfying platform authentication requirements.

> [!IMPORTANT]
> **Cohort Non-Equivalence**:  
> Cohorts A, B, and C are fundamentally distinct experimental treatments. A response generated in Cohort C cannot be directly equated with an anonymous result from Cohort A. Every dataset, table, and analysis must label and segment results by cohort.

---

## 5. Authentication State

For any run involving human assistance or interactive sessions, the harness and run records must capture granular authentication metadata.

### Required Authentication Metadata Fields:
1. `authenticationStatus`:
   * `LOGGED_OUT`: Completely anonymous guest session.
   * `AUTH_REQUIRED_BLOCKED`: System demanded authentication; run terminated without answer.
   * `AUTHENTICATED_FREE`: Active session with a free/standard personal user account.
   * `AUTHENTICATED_PAID_PERSONAL`: Active session with a personal subscription (e.g. ChatGPT Plus, Claude Pro, Perplexity Pro) using personal funds.
   * `AUTHENTICATED_RESEARCH_CLEAN`: Active session with a dedicated zero-history research account.
2. `mfaState`:
   * `NONE_REQUIRED`: Login proceeded without second-factor challenge.
   * `MFA_COMPLETED_MANUAL`: Researcher manually completed 2FA/MFA (e.g. SMS, authenticator app) during setup.
3. `consentState`:
   * `CONSENT_ACCEPTED_MANUAL`: Researcher acknowledged terms of service, cookie consent, or AI disclaimer banners.
   * `CONSENT_BYPASS_NOT_ATTEMPTED`: Run blocked by unhandled consent modal.
4. `accountSettingsState`:
   * `SEARCH_HISTORY_ENABLED`: Search history active in platform settings.
   * `SEARCH_HISTORY_PAUSED`: Search/chat history explicitly turned off in platform settings.
   * `MODEL_TRAINING_OPT_OUT`: Model improvement opt-out toggled where available.

> [!CAUTION]
> **Zero Credential Storage Policy**:  
> Under no circumstances may usernames, passwords, API tokens, session cookies, auth tokens, or MFA secrets be written to configuration files, scripts, environment variables, git repositories, or run record JSONs. All credential entry is performed exclusively by human hands inside the local browser interface.

---

## 6. Personalization State

A critical flaw in generative search research is conflating **AUTHENTICATED** with **PERSONALIZED**. An authenticated account does not automatically mean the engine's response is personalized, nor does it guarantee that personalization has been eliminated.

### Observable Personalization Dimensions:
To maintain scientific validity, every assisted run record must document the following dimensions:
* **Search History Context**: Is the platform account maintaining active conversational memory or past search queries?
* **Account-Specific Profile**: Are custom instructions, user personas, or system prompts active? (Must be strictly `NONE` during research runs).
* **Geographic & Locale Anchor**: What country, region, and city are indicated by the platform's UI footer or IP indicator?
* **Interface Language**: What language is selected in the platform's profile settings (default: `en-US`)?
* **Model & Engine Tier**: What specific model dropdown is selected (e.g. "Auto", "GPT-4o", "Claude 3.5 Sonnet", "Perplexity Focus: Web")?
* **Search / Synthesis Mode**: Is the engine in default search mode, conversational chat mode, deep research mode, or code mode?

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED vs. PERSONALIZED                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [AUTHENTICATED]                       [PERSONALIZED]                   │
│  - User identity verified              - Prior search history active    │
│  - Session cookie active               - Behavioral profile applied     │
│  - Security gates cleared              - Custom instructions loaded     │
│  - Platform features unlocked          - Conversational memory recalled │
│                                                                         │
│  Goal of Cohort C (Assisted Clean):                                     │
│  >> AUTHENTICATED: YES  |  PERSONALIZED: STRICTLY MINIMIZED / MONITORED │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Assisted Interactive Capture Protocol Design

The Assisted Interactive Capture methodology separates **platform access** (human-driven) from **query execution, artifact extraction, and verification** (harness-driven).

```
┌─────────────────────────────────────────────────────────────────────────┐
│             ASSISTED INTERACTIVE CAPTURE WORKFLOW (DESIGN)              │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 1. Researcher Manually Launches Clean Browser    │
         │    (Isolated user-data directory, known port)    │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 2. Researcher Manually Authenticates & Clears    │
         │    (Performs login, completes MFA/CAPTCHA)       │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 3. Researcher Confirms Target System Ready       │
         │    (Navigates to search bar, selects default UI) │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 4. Harness Attaches via Debugger / CDP           │
         │    (Connects to active tab, verifies endpoint)   │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 5. Harness Dispatches Standardized Query         │
         │    (Injects exact query text, triggers submit)   │
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 6. Harness Waits for Synthesis Completion        │
         │    (Monitors streaming token / DOM stabilization)│
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 7. Automated Artifact Extraction & Hashing       │
         │    - Serializes full rendered DOM (.html)        │
         │    - Captures high-res full-page image (.png)    │
         │    - Extracts visible response text (.txt)       │
         │    - Extracts structured citations array         │
         │    - Computes cryptographic SHA-256 hashes       │
         │    - Writes immutable ExperimentRunRecord (.json)│
         └─────────────────────────┬────────────────────────┘
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │ 8. Researcher Closes Session / Clears Ephemeral  │
         │    (Destroys debug port, disconnects harness)    │
         └──────────────────────────────────────────────────┘
```

### Detailed Operational Steps:
1. **Researcher Launch**: Researcher starts local system Google Chrome with a dedicated, isolated data directory and a local debugging port (e.g. `--remote-debugging-port=9222 --user-data-dir="C:\paila Dixith kumar\.research-profiles\clean"`).
2. **Manual Gateway Clearance**: The researcher navigates to the target system (e.g. `claude.ai` or `gemini.google.com`), logs into the research account, enters 2FA tokens, and verifies the search interface is resting in its default state.
   * *CAPTCHA & Human Verification Policy*: A human may encounter a legitimate interactive verification during ordinary browser use. The researcher must **never** bypass, automate, outsource, or defeat anti-bot controls. If a challenge is clearly an anti-automation barrier triggered by research automation, the researcher may terminate the run (`CAPTCHA_BLOCKED`) rather than treat CAPTCHA completion as routine. Any challenge that is legitimately completed by hand during initial setup must be explicitly recorded in the intervention metadata (`CAPTCHA_COMPLETED_MANUALLY`).
3. **Readiness Signal**: The researcher executes the assisted capture script specifying the query ID and target system.
4. **Harness Attachment**: The capture harness connects to `http://localhost:9222`, discovers the target tab, and verifies URL alignment.
5. **Standardized Query Execution**: The harness enters the exact query text from `queries.json` through the visible target interface and submits it using the normal user-facing interaction path, without trailing spaces, prompt injection, or leading conversational wrappers (`promptWrapper: "NONE"`).
6. **Streaming & Completion Monitoring**: The harness monitors DOM mutation observers and network idle states to confirm generative streaming has concluded.
7. **Artifact Extraction**:
   * Extracts visible inner text from the response container.
   * Extracts all anchor tags, superscript buttons, source pills, and hover cards into `CitationObservation` objects.
   * Captures full DOM snapshot and full-page screenshot.
   * Computes SHA-256 digests.
   * Generates deterministic `RUN-001-{date}-{queryId}-{systemSlug}-{runNumber}` record.
8. **Session Close**: Harness detaches cleanly.

---

## 8. Optional Chrome DevTools Protocol (CDP) Architecture

*This section evaluates and designs a browser attachment architecture. No implementation code is created in this phase.*

### Architectural Evaluation:
Playwright and Puppeteer support connecting to an existing browser instance via Chrome DevTools Protocol using `chromium.connectOverCDP(endpointURL)`.

| Evaluation Dimension | Direct Automation (Phase 8I.7) | CDP Attachment (Phase 8I.7.1 Design) |
| :--- | :--- | :--- |
| **Browser Lifecycle** | Spawned and killed by script | Launched manually by researcher; persists during test |
| **Authentication Handling** | Injected via code or blocked | Completed natively by human researcher |
| **Bot Detection / Access Behavior** | High (Playwright runtime flags) | Unknown and provider-dependent. CDP attachment is not intended to bypass provider security controls and its access behavior must be empirically observed. |
| **Credential Safety** | Risk of credentials in scripts | 100% Zero-credential exposure; handled in user UI |
| **Profile Isolation** | Ephemeral temp directories | Dedicated isolated research user-data directory |
| **Artifact Fidelity** | Captured challenge page | Captures true authenticated answer state |

### Technical Blueprint for Future Implementation:
* **Browser Endpoint**: `http://127.0.0.1:9222`
* **Protocol Handshake**: Harness requests `/json/version` to discover webSocketDebuggerUrl.
* **Tab Selection**: Harness enumerates open pages, matches URL pattern for target system, and attaches a CDP session.
* **Non-Invasive Inspection**: Harness issues `Runtime.evaluate`, `Page.captureScreenshot`, and `DOM.getDocument` commands without altering browser runtime binaries.
* **Clean Disconnect**: Harness calls `disconnect()`, leaving the browser window open for researcher verification.

---

## 9. Security Rules & Ethical Boundaries

To safeguard personal security and uphold academic research ethics, the following rules are **strictly binding**:

### Strictly Prohibited Actions:
1. **No Credential Storage**: No passwords, OAuth tokens, session cookies, or refresh tokens stored in repository files, environment variables, or databases.
2. **No Password Automation**: Scripts must never type passwords into login forms.
3. **No Automated 2FA/MFA Interception**: No integration with SMS APIs or TOTP secret generation for automated login.
4. **No CAPTCHA Solving or Bypass**: No integration with third-party CAPTCHA-solving services (e.g. 2Captcha, Anti-Captcha) or automated OCR bypasses.
5. **No Stealth Spoofing**: No use of evasion plugins (`puppeteer-extra-plugin-stealth`), canvas noise injectors, or fake WebGL parameter spoofers.
6. **No Proxy Rotation**: No residential proxy scraping networks or IP hopping. All queries originate from the researcher's verified local network connection.
7. **No Rate-Limit Evasion**: When an engine returns HTTP 429 or displays a usage cooldown, the harness must halt execution and record `RATE_LIMITED`. It must never attempt to circumvent limits.

---

## 10. Run Metadata Schema Specification

The standardized run metadata contract must record all environmental, cohort, and assistance parameters.

### Comprehensive Metadata Contract (Specification):

```typescript
export interface AssistedExperimentRunRecord {
  // Identity
  runId: string;                     // e.g. "RUN-001-20261015-Q001-chatgpt-01"
  experimentId: "EXP-001";
  runNumber: number;                 // Sequential repetition index
  system: CanonicalAISearchSystem;
  queryId: string;                   // Reference to QueryDefinition.id (e.g. "Q-001")
  exactQuery: string;
  promptWrapper: "NONE" | string;

  // Cohort & Governance
  cohort: "COHORT_A_LOGGED_OUT" | "COHORT_B_AUTHENTICATED_PERSONAL" | "COHORT_C_RESEARCH_CLEAN";
  captureMode: "HEADLESS_AUTOMATED" | "ASSISTED_CDP_ATTACHED" | "MANUAL_INSPECTED";
  
  // Authentication & Access Metadata
  authenticationState: {
    status: "LOGGED_OUT" | "AUTH_REQUIRED_BLOCKED" | "AUTHENTICATED_FREE" | "AUTHENTICATED_PAID" | "AUTHENTICATED_RESEARCH_CLEAN";
    accountClass: "LOGGED_OUT" | "PERSONAL" | "RESEARCH_CLEAN";
    accountSubscriptionTier?: "FREE" | "PAID" | "UNKNOWN" | "NOT_APPLICABLE";
    mfaCompleted: boolean;
    consentCompleted: boolean;
  };

  // Personalization & Engine Configuration
  personalizationState: {
    historyEnabled: boolean | "NOT_OBSERVABLE";
    customInstructionsActive: boolean | "NOT_OBSERVABLE";
    geographicLocationReported: string; // e.g. "Visakhapatnam, Andhra Pradesh, India"
    activeModelTier: string;           // e.g. "GPT-4o (Default)", "Sonnet 3.5 Web", "Search Mode"
    searchModeSetting: string;         // e.g. "Standard Web", "Deep Search", "Pro"
  };

  // Execution & Failure Tracking
  executionStatus: RunExecutionStatus;
  manualIntervention: {
    required: boolean;
    types: ManualInterventionType[];
    notes?: string;
  };

  // Environment & Provenance
  environment: {
    timestamp: string;               // ISO 8601 UTC
    timezone: string;                // e.g. "Asia/Kolkata"
    browserVersion: string;          // e.g. "Google Chrome 128.0.0.0"
    operatingSystem: "Windows 11 Pro";
    viewport: { width: number; height: number };
  };

  // Observable Answer Data
  rawResponseText: string;
  responseLengthChars: number;
  responseLengthWords: number;
  citations: CitationObservation[];
  totalCitationsObserved: number;
  distinctDomainsCited: number;

  // Artifact Evidence & Hashes
  evidence: {
    evidenceId: string;
    rawTextPath: string;
    domSnapshotPath: string;
    screenshotPath: string;
    textSha256: string;
    htmlSha256: string;
    screenshotSha256: string;
    capturedAt: string;
  };

  // Observations, Notes & Limitations
  observations: string[];
  researcherNotes?: string;
  reproducibilityLimitations: string[];
}
```

*Note: This schema refines and extends `ExperimentRunRecord`. When implemented in code, it will maintain backward compatibility with Phase 8I.7 historical records by treating new assisted fields as optional on historical runs. Strictly prohibited from storage: email, username, account ID, account hash, session ID, token, or cookie identifier.*

---

## 11. Manual Intervention Taxonomy

To maintain experimental transparency, any human intervention during a capture run must be categorized using standardized taxonomy tokens:

| Intervention Token | Definition | When to Apply |
| :--- | :--- | :--- |
| `NONE` | Zero human intervention | Automated headless run (e.g. Phase 8I.7 runs) |
| `AUTHENTICATION` | User login | Researcher typed email/username and password in browser UI |
| `MFA` | Two-Factor Authentication | Researcher verified SMS, TOTP, or device prompt |
| `CAPTCHA_PRESENTED` | Challenge displayed | Platform presented an interactive human verification puzzle or anti-bot prompt |
| `CAPTCHA_COMPLETED_MANUALLY` | Manual verification | Researcher legitimately resolved an interactive challenge encountered during normal setup by hand (never automated or outsourced) |
| `CAPTCHA_BLOCKED` | Anti-automation halt | Run terminated because challenge was identified as an anti-automation barrier triggered by research tooling |
| `CONSENT` | Policy/Cookie acceptance | Researcher dismissed GDPR, cookie, or AI disclaimer banners |
| `MODEL_SELECTION` | Engine configuration | Researcher verified or selected the target model from a dropdown |
| `SEARCH_MODE_SELECTION` | Mode configuration | Researcher ensured web search toggle was active |
| `NAVIGATION` | URL routing | Researcher navigated to the primary search input interface |
| `STREAMING_MONITOR` | Manual stop detection | Researcher confirmed text generation finished when UI lacked event |
| `OTHER` | Miscellaneous | Any undocumented interaction (must include detailed explanation in notes) |

### Contract Fields:
* `manualInterventionRequired`: `boolean` (`true` if any human interaction occurred).
* `manualInterventionNotes`: `string` (Human description of exact steps taken).

### Policy on CAPTCHA & Human Verification:
1. **Legitimate Interactive Verification**: A human researcher may encounter a normal verification challenge during ordinary interactive browser login or account setup.
2. **Strict Prohibition on Bypasses**: The researcher must never bypass, automate, outsource (e.g. solving services), or defeat anti-bot controls.
3. **Anti-Automation Barrier Distinction**: If a challenge is clearly an anti-automation barrier triggered by research tooling or harness attachment, the researcher must terminate the run (`CAPTCHA_BLOCKED`) rather than treating continuous CAPTCHA completion as a routine research step.
4. **Mandatory Documentation**: Any manually completed challenge must be explicitly recorded in the intervention metadata (`CAPTCHA_COMPLETED_MANUALLY`).

---

## 12. Evidence Labeling

Every generated evidence artifact and run record must carry an immutable, prominent top-level label indicating its exact capture lineage:

1. `AUTOMATED_LOGGED_OUT`: Fully automated capture executed without human presence in an unauthenticated browser (e.g. all 48 Phase 8I.7 records).
2. `ASSISTED_AUTHENTICATED`: Human assisted login and security clearance; automated harness dispatched query and captured artifacts via CDP.
3. `MANUAL_CAPTURE`: Fully manual query entry and artifact inspection by researcher (used as fallback for complex streaming UIs).
4. `AUTOMATED_AUTHENTICATED_PERSISTENT`: Automated run executed within a pre-authenticated persistent browser session profile.

> [!CAUTION]
> **Strict Partitioning**:  
> Systems must never combine `AUTOMATED_LOGGED_OUT` metrics with `ASSISTED_AUTHENTICATED` metrics in a single average, score, or comparison table without explicitly separating them into labeled cohort columns.

---

## 13. Comparability Rules

When evaluating AI search behavior across runs, engines, or dates, researchers must adhere to strict **Comparability Rules**:

### Valid Comparisons ($\checkmark$):
* **Same Cohort Across Systems**: Comparing System X (Cohort C) with System Y (Cohort C) tested within the same temporal window (e.g. same week).
* **Same System Across Cohorts**: Comparing System X (Cohort A) against System X (Cohort C) to measure the specific impact of authentication on retrieval depth.
* **Temporal Stability within Cohort**: Comparing Query Q on System X in Cohort C on Day 1 versus Day 7 under identical account settings.

### Invalid / Unsound Comparisons ($\times$):
* **Cross-Cohort Engine Comparison**: Claiming System X provides "better citations" in Cohort C than System Y provides in Cohort A. (Conflates engine architecture with authentication tier).
* **Automated Failure vs. Authenticated Success**: Comparing Phase 8I.7 blocked runs against future assisted runs as evidence of engine superiority.
* **Personalized vs. Clean**: Comparing a personal account with 2 years of search history (Cohort B) against a clean research account (Cohort C).

---

## 14. Failure Taxonomy

When an assisted or automated run cannot capture a complete answer, it must record a standardized failure state:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FAILURE TAXONOMY TREE                           │
└────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼────────────────────────┐
          │                         │                        │
          ▼                         ▼                        ▼
  [ACCESS FAILURES]        [NETWORK / RUNTIME]      [GENERATION / ENGINE]
  - AUTH_REQUIRED          - PAGE_LOAD_FAILED       - MODEL_UNAVAILABLE
  - CAPTCHA_BLOCKED        - TIMEOUT                - RESPONSE_NOT_OBSERVABLE
  - CONSENT_REQUIRED       - CAPTURE_ERROR          - CITATIONS_NOT_OBSERVABLE
                           - MANUAL_ABORT           - RATE_LIMITED
```

### State Definitions:
1. `SUCCESS`: Query executed, generative response rendered, visible text and citations captured, screenshots and DOM saved.
2. `AUTH_REQUIRED`: Platform presented mandatory login wall; capture terminated.
3. `CAPTCHA_BLOCKED`: Anti-bot puzzle or Cloudflare challenge halted capture.
4. `CONSENT_REQUIRED`: UI obscured by unclickable modal or policy prompt.
5. `PAGE_LOAD_FAILED`: DNS error, server 5xx error, or network disconnect.
6. `TIMEOUT`: Page failed to stabilize within maximum allocation (30s).
7. `RATE_LIMITED`: Platform returned HTTP 429 or message quota limit banner.
8. `MODEL_UNAVAILABLE`: Platform displayed service degradation or outage notice.
9. `RESPONSE_NOT_OBSERVABLE`: Query submitted, but engine returned empty container or unsupported canvas output.
10. `CITATIONS_NOT_OBSERVABLE`: Text generated, but platform UI failed to render source links or references.
11. `CAPTURE_ERROR`: Playwright or CDP connection crashed during serialization.
12. `MANUAL_ABORT`: Researcher terminated run due to security concern or platform anomaly.

---

## 15. Evidence Integrity & Cryptographic Auditing

To maintain absolute academic and empirical integrity, all captured artifacts must satisfy four immutable properties:

1. **Cryptographic SHA-256 Hashing**:
   * Text artifact hash: computed from UTF-8 byte buffer of `.txt`.
   * HTML artifact hash: computed from UTF-8 byte buffer of `.html`.
   * Screenshot artifact hash: computed from binary byte buffer of `.png`.
   * All three digests stored in the run record JSON.
2. **Raw Artifact Storage**:
   * Raw text preserved without formatting or markdown manipulation.
   * Full DOM snapshot saved before any cleanup.
   * Full-page PNG screenshot preserving visible layout, font rendering, and citation badges.
3. **Deterministic Run Identifiers**:
   * Format: `RUN-001-{YYYYMMDD}-{QUERY_ID}-{SYSTEM_SLUG}-{SEQUENCE}`
   * Example: `RUN-001-20261015-Q001-google-ai-overview-01`
4. **Local Auditability**:
   * All artifacts reside on local storage. Any researcher can verify file hashes using standard command-line tools (`sha256sum`).

---

## 16. Privacy, Security & Sensitive Data Review

### Current State:
* `evidence/exp-001/runs/YYYY-MM-DD/` contains JSON metadata run records.
* `evidence/exp-001/raw/YYYY-MM-DD/` contains raw `.txt`, `.html`, and `.png` files.
* `.gitignore` currently includes `/evidence/**/raw/`, properly ignoring bulky raw text, HTML dumps, and screenshots.

### Risk Analysis for Assisted / Authenticated Captures:
When a researcher logs into a real account:
* **DOM Snapshots & HTML**: May contain user email address, display name, account avatar URL, or internal account IDs embedded in header HTML.
* **Screenshots**: May render the user's profile photo or account menu in the top-right corner.
* **Run Records (`runs/*.json`)**: May accidentally record user email or account names if extracted from page body text.

### Recommended Security Controls:
1. **Dedicated Zero-PII Research Account**: Use accounts registered specifically for research (e.g. `dixith.research@...`) with no personal names, phone numbers, or corporate emails visible in UI headers.
2. **Git Tracking Policy**:
   * `evidence/exp-001/raw/` remains strictly ignored in `.gitignore`.
   * Before committing any run record from `evidence/exp-001/runs/`, an automated redaction/sanitization check must scan for email patterns, user identifiers, and authorization headers.
3. **Reason**: Prevents unintentional leakage of personal email addresses, profile avatars, or proprietary session metadata into public git history.

---

## 17. One Query $\times$ Six Systems Validation Pilot (Design Specification)

*This pilot is a PROTOCOL VALIDATION DESIGN ONLY. It must NOT be executed in this phase.*

### Objective:
Validate the operational stability, CDP attachment reliability, citation parsing accuracy, and artifact hashing of the assisted capture protocol across all six systems using a single, non-controversial factual query before scaling to larger cohorts.

### Candidate Query Specification:
* **Query ID**: `Q-001`
* **Category**: `FACTUAL`
* **Exact Query**: *"What is the HTTP status code for Moved Permanently according to RFC 9110?"*
* **Ground Truth**: HTTP 301 (RFC 9110, Section 15.4.2).
* **Selection Justification**: Unambiguous, static, non-personalized, and standard-governed. Isolates capture mechanics from answer ambiguity.

### Step-by-Step Pilot Validation Procedure (Design):
```
For each of the six canonical systems (Google AI Overview, ChatGPT, Perplexity, Claude, Gemini, Copilot):
  1. Researcher launches Chrome with clean profile directory and debugging port 9222.
  2. Researcher logs into dedicated research account (Cohort C).
  3. Researcher verifies default search input UI is active.
  4. Researcher triggers CLI validation runner for (System_i, Q-001).
  5. Harness connects via CDP, enters the exact Q-001 query through the visible target interface and submits it using the normal user-facing interaction path, and awaits generation.
  6. Harness extracts text, DOM, screenshot, citations, and SHA-256 digests.
  7. Harness validates record against AssistedExperimentRunRecord schema.
  8. Researcher closes session.
```

### Success Criteria:

The 1×6 pilot strictly distinguishes:

#### A. INFRASTRUCTURE SUCCESS
The harness successfully:
* Attaches to the browser session via CDP
* Identifies the target system interface
* Enters the exact query through the visible target interface
* Submits it using the normal user-facing interaction path
* Waits for completion or stabilization
* Captures the visible response (if present)
* Extracts citations (if present)
* Captures the full DOM snapshot
* Captures the full-page screenshot
* Computes cryptographic SHA-256 digests
* Creates a valid, schema-compliant run record

#### B. ACCESS OUTCOME
Each system receives its actual observed outcome:
* `SUCCESS`
* `AUTH_REQUIRED`
* `CAPTCHA_BLOCKED`
* `CONSENT_REQUIRED`
* `PAGE_LOAD_FAILED`
* `TIMEOUT`
* `RATE_LIMITED`
* `MODEL_UNAVAILABLE`
* `RESPONSE_NOT_OBSERVABLE`
* `CITATIONS_NOT_OBSERVABLE`
* `CAPTURE_ERROR`
* `MANUAL_ABORT`

> [!IMPORTANT]
> The infrastructure pilot does **NOT** require all six systems to return successful AI answers for the infrastructure pilot itself to be considered informative. Each system must be evaluated independently. Access failures must accurately document observed system behavior and must never be turned into answer-quality conclusions.

---

## 18. Scale-Up Progression Gates

The full 96-query $\times$ 6-system battery ($576$ planned runs) represents significant experimental effort and storage footprint (~$400$ MB). To ensure zero wasted effort and total data integrity, progression is governed by strict sequential gates:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCALE-UP PROGRESSION GATES                      │
└────────────────────────────────────────────────────────────────────────┘

  [GATE 1: Protocol Approval]
    │  Review and approve this assisted capture protocol specification.
    ▼
  [GATE 2: Assisted Capture Harness Implementation]
    │  Implement CDP attachment logic in lib/research/ and scripts/.
    ▼
  [GATE 3: Single-Query Pilot (1 Query × 6 Systems = 6 Runs)]
    │  Execute Q-001 on all six systems; verify zero unhandled errors.
    ▼
  [GATE 4: Evidence Integrity & Cryptographic Validation]
    │  Confirm bit-exact SHA-256 verification and DOM snapshot completeness.
    ▼
  [GATE 5: Privacy & PII Sanitization Verification]
    │  Audit generated records for zero emails, tokens, or personal identifiers.
    ▼
  [GATE 6: Cohort & Comparability Labeling Verification]
    │  Confirm metadata schema enforces strict cohort isolation.
    ▼
  [GATE 7: Formal Approval for Expanded Research Battery]
    │  Explicit human authorization to proceed with multi-query batches.
    ▼
  [FULL BATTERY EXECUTION (96 × 6 = 576 Runs)]
```

> [!IMPORTANT]
> The full 576-run battery remains **STRICTLY BLOCKED** until Gates 1 through 7 have been formally cleared.

---

## 19. Reproducibility Limitations

Any empirical study of commercial AI search engines faces inherent epistemic limitations that must be transparently documented in every publication:

1. **Opaque Provider Updates**: Search providers deploy prompt adjustments, rerankers, and model weight updates without public notice or version disclosure.
2. **Index Dynamics**: Web search retrieval indices refresh continuously; a source cited today may be dropped tomorrow due to index updates.
3. **Nondeterministic Sampling**: Parametric language models operate with non-zero temperature, producing lexical variation even under identical prompts.
4. **A/B Testing & UI Experiments**: Providers frequently serve different UI layouts, citation card designs, and generative modules to different IP ranges and user cohorts.
5. **Geographic Anchoring**: Search results are localized by IP exit node; results observed in India (`Asia/Kolkata`) may vary from those observed in North America or Europe.

---

## 20. Explicit Non-Goals

To maintain rigorous scientific focus and adhere to DIXITH governance, this phase explicitly does **NOT**:

* **Produce Research Findings**: No scientific claims about engine behavior are made.
* **Compare AI Systems**: No cross-engine evaluations, performance ratings, or feature scorecards are established.
* **Rank AI Systems**: No "best search engine" or "winner" declarations are made.
* **Measure Answer Quality**: No human rating of answer correctness or prose eloquence is conducted.
* **Measure Citation Quality**: No source authority scoring or backlink auditing is performed.
* **Execute Live Research**: Zero live search queries are dispatched to external platforms.

---

## 21. Protocol Approval Checklist

Before proceeding to Gate 2 (Assisted Capture Harness Implementation), all items below must be verified and checked:

- [ ] **Methodological Review**: Assisted capture workflow conforms to scientific observation standards.
- [ ] **Security Compliance**: Zero credential storage, zero automated login, zero CAPTCHA bypass confirmed.
- [ ] **Cohort Partitioning**: Cohort A, Cohort B, and Cohort C explicitly isolated in metadata definitions.
- [ ] **Schema Backward Compatibility**: New metadata fields documented without breaking existing historical Phase 8I.7 records.
- [ ] **Privacy Safeguards**: PII audit requirements defined for DOM snapshots and screenshot storage.
- [ ] **Gate Enforcement**: Full 576-run execution remains blocked until all pre-flight gates pass.
- [ ] **Governance Adherence**: 100% personal DIXITH project; zero corporate resources or external paid AI APIs utilized.

---

*End of Protocol Specification: `docs/exp-001-assisted-capture-protocol.md`*
