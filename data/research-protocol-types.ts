/**
 * DIXITH Research Protocol & Experiment Run Contract Types
 * Phase 8I.4 — Standardized Cross-Engine AI Search Benchmarking Architecture
 * 
 * Defines formal data contracts for future experimental runs across the six canonical
 * AI search engines without requiring an external database or introducing runtime overhead.
 */

/**
 * The Six Canonical AI Search Systems evaluated under the DIXITH benchmark protocol.
 * Non-canonical and legacy search engines are strictly excluded.
 */
export type CanonicalAISearchSystem =
  | "Google AI Overview"
  | "ChatGPT"
  | "Perplexity"
  | "Claude"
  | "Gemini"
  | "Microsoft Copilot";

export const CANONICAL_AI_SEARCH_SYSTEMS: readonly CanonicalAISearchSystem[] = [
  "Google AI Overview",
  "ChatGPT",
  "Perplexity",
  "Claude",
  "Gemini",
  "Microsoft Copilot",
] as const;

/**
 * Standard Query Taxonomy Categories for experimental battery composition
 */
export type QueryCategory =
  | "FACTUAL"
  | "EXPLANATORY"
  | "COMPARISON"
  | "ENTITY"
  | "TECHNICAL"
  | "CURRENT_INFORMATION";

/**
 * Formal Specification for a Query in the Experimental Battery
 */
export interface QueryDefinition {
  id: string; // e.g. "Q-001"
  experimentId: "EXP-001";
  category: QueryCategory;
  query: string;
  intent: string;
  expectedObservables: string[];
  systems: CanonicalAISearchSystem[];
  status: "DRAFT" | "APPROVED";
  notes?: string;
  expectedEntityAnchors?: string[];
  temporalSensitivity?: "STATIC" | "MODERATE_DRIFT" | "HIGH_FRESHNESS";
}

/**
 * Metadata and payload contract for the formal Query Registry (evidence/exp-001/registry/queries.json)
 */
export interface QueryRegistryMetadata {
  experimentId: "EXP-001";
  protocolVersion: string;
  registryVersion: string;
  canonicalSystems: readonly CanonicalAISearchSystem[];
  categories: Record<QueryCategory, number>;
  totalQueries: number;
  status: "DRAFT" | "APPROVED";
  createdAt: string;
  updatedAt: string;
  queries: QueryDefinition[];
}

/**
 * System specification entry in the Systems Registry
 */
export interface SystemRegistryEntry {
  id: string;
  name: CanonicalAISearchSystem;
  provider: string;
  architectureType: string;
  retrievalPipeline: string;
  primaryCitationUi: string;
  defaultSearchMode: string;
  knownLimitations: string[];
  modelVersionsDisclosed: boolean;
  notes?: string;
}

/**
 * Systems Registry contract (evidence/exp-001/registry/systems.json)
 */
export interface SystemsRegistry {
  experimentId: "EXP-001";
  registryVersion: string;
  canonicalCount: 6;
  systems: SystemRegistryEntry[];
}

/**
 * Degree of Experimental Control achieved for a variable
 */
export type ControlLevel =
  | "CONTROLLED"
  | "PARTIALLY_CONTROLLED"
  | "NOT_FULLY_CONTROLLABLE";

/**
 * Environmental and Execution Context for a Benchmark Run
 */
export interface RunEnvironmentContext {
  timestamp: string; // ISO 8601 UTC
  timezone: string; // Local timezone of execution, e.g. "Asia/Kolkata" or "UTC"
  language: string; // Browser/request locale, e.g. "en-US"
  geographicContext: string; // e.g. "IN (Visakhapatnam)", "US (Ashburn)", or "NOT_FULLY_CONTROLLABLE"
  geographicControlLevel: ControlLevel;
  personalizationState: "LOGGED_OUT_INCOGNITO" | "FRESH_SESSION_PROFILE" | "NOT_FULLY_CONTROLLABLE";
  searchModeOrState: string; // Observable mode e.g. "Default Search", "Deep Search / Pro", "Browse with Bing", "NOT_OBSERVABLE"
  browserOrClient: string; // e.g. "Chrome 128 Incognito Manual Capture", "Playwright Automation"
  systemConfigurationNotes?: string;
}

/**
 * Observability of Citation-to-Claim Binding in Generative Synthesis
 */
export type CitationAssociationState =
  | "DIRECT_CLAIM_ANCHOR"
  | "PARAGRAPH_LEVEL_REFERENCE"
  | "FOOTNOTE_GLOBAL_REFERENCE"
  | "CAROUSEL_CARD_UNLINKED"
  | "NOT_OBSERVABLE";

/**
 * Citation UI Render Formats across Engine Implementations
 */
export type CitationRenderFormat =
  | "INLINE_BRACKETED_NUMBER"
  | "INLINE_FAVICON_PILL"
  | "HOVER_POPUP_CARD"
  | "SIDEBAR_SOURCE_LIST"
  | "BOTTOM_FOOTNOTE_LINKS"
  | "CAROUSEL_CARD"
  | "NOT_OBSERVABLE";

/**
 * High-level categorization of cited third-party domains
 */
export type CitedSourceClassification =
  | "OFFICIAL_DOCUMENTATION"
  | "ACADEMIC_PEER_REVIEWED"
  | "STANDARDS_SPECIFICATION"
  | "JOURNALISTIC_NEWS"
  | "INDUSTRY_PORTAL_OR_BLOG"
  | "COMMERCIAL_VENDOR"
  | "COMMUNITY_FORUM"
  | "NOT_OBSERVABLE";

/**
 * Atomic Observation of a Cited Source within a Captured Engine Response
 */
export interface CitationObservation {
  citedTitle?: string;
  citedUrl: string;
  sourceDomain: string;
  positionIndex?: number; // 1-based sequential position in text or citation array
  renderFormat: CitationRenderFormat;
  associationState: CitationAssociationState;
  associatedClaimSnippet?: string; // Text claim immediately anchored to this citation
  sourceClassification: CitedSourceClassification;
  hasSchemaOrgMarkup?: boolean | "NOT_OBSERVABLE";
  notes?: string;
}

/**
 * Cryptographically Verified Reference to Raw Captured Artifacts
 */
export interface EvidenceArtifactReference {
  evidenceId: string; // e.g. "EVD-001-001"
  rawTextPath?: string; // Relative path, e.g. "evidence/exp-001/runs/RUN-001-google.txt"
  screenshotPath?: string; // Relative path to full-page capture image
  domSnapshotPath?: string; // Relative path to serialized DOM HTML
  sha256Hash?: string; // SHA-256 hash of raw response payload for tamper resistance
  capturedAt: string;
}

/**
 * Research Cohort Classification for EXP-001 (Phase 8I.7.1 & 8I.7.2)
 */
export type ResearchCohort =
  | "COHORT_A_LOGGED_OUT"
  | "COHORT_B_AUTHENTICATED_PERSONAL"
  | "COHORT_C_RESEARCH_CLEAN";

/**
 * Capture Mode for EXP-001
 */
export type CaptureMode =
  | "HEADLESS_AUTOMATED"
  | "ASSISTED_CDP_ATTACHED"
  | "MANUAL_INSPECTED";

/**
 * Non-identifying Account Classification
 */
export type AccountClass =
  | "LOGGED_OUT"
  | "PERSONAL"
  | "RESEARCH_CLEAN";

/**
 * Account Subscription Tier
 */
export type AccountSubscriptionTier =
  | "FREE"
  | "PAID"
  | "UNKNOWN"
  | "NOT_APPLICABLE";

/**
 * Authentication Status for Assisted Runs
 */
export type AuthenticationStatus =
  | "LOGGED_OUT"
  | "AUTH_REQUIRED_BLOCKED"
  | "AUTHENTICATED"
  | "AUTHENTICATED_FREE"
  | "AUTHENTICATED_PAID"
  | "AUTHENTICATED_RESEARCH_CLEAN";

/**
 * Standardized Manual Intervention Taxonomy Tokens
 */
export type ManualInterventionType =
  | "NONE"
  | "AUTHENTICATION"
  | "MFA"
  | "CAPTCHA_PRESENTED"
  | "CAPTCHA_COMPLETED_MANUALLY"
  | "CAPTCHA_BLOCKED"
  | "CONSENT"
  | "MODEL_SELECTION"
  | "SEARCH_MODE_SELECTION"
  | "NAVIGATION"
  | "STREAMING_MONITOR"
  | "OTHER";

/**
 * Manual Intervention Tracking Record
 */
export interface ManualInterventionRecord {
  required: boolean;
  types: ManualInterventionType[];
  notes?: string;
}

/**
 * Assisted Authentication State Metadata (Strictly Non-Identifying)
 */
export interface AssistedAuthenticationState {
  status: AuthenticationStatus;
  accountClass: AccountClass;
  accountSubscriptionTier?: AccountSubscriptionTier;
  mfaCompleted: boolean;
  consentCompleted: boolean;
}

/**
 * Assisted Personalization State Metadata (Observable Parameters Only)
 */
export interface AssistedPersonalizationState {
  historyEnabled: boolean | "NOT_OBSERVABLE";
  customInstructionsActive: boolean | "NOT_OBSERVABLE";
  geographicLocationReported: string;
  activeModelTier: string;
  searchModeSetting: string;
}

export type RunExecutionStatus =
  | "SUCCESS"
  | "AUTH_REQUIRED"
  | "MANUAL_AUTH_REQUIRED"
  | "CAPTCHA_BLOCKED"
  | "CONSENT_REQUIRED"
  | "PAGE_LOAD_FAILED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "MODEL_UNAVAILABLE"
  | "RESPONSE_NOT_OBSERVABLE"
  | "CITATIONS_NOT_OBSERVABLE"
  | "CAPTURE_ERROR"
  | "MANUAL_ABORT"
  | "SYSTEM_UNAVAILABLE";

/**
 * Canonical Single-Run Record Contract
 * Represents one execution of one query on one AI search engine at a specific instant.
 */
export interface ExperimentRunRecord {
  runId: string; // e.g. "RUN-001-20261001-01"
  experimentId: "EXP-001";
  phaseId?: string; // e.g. "8I.7.3", "8I.7.5"
  runNumber: number; // 1-based repetition sequence number
  system: CanonicalAISearchSystem;
  queryId: string; // Reference to QueryDefinition.id
  exactQuery: string;
  executionStatus?: RunExecutionStatus;
  promptWrapper?: string; // "NONE" for raw search bar, or system prompt if API invocation
  cohort?: ResearchCohort;
  captureMode?: CaptureMode;
  accountClass?: AccountClass;
  accountSubscriptionTier?: AccountSubscriptionTier;
  authenticationState?: AssistedAuthenticationState;
  personalizationState?: AssistedPersonalizationState;
  manualIntervention?: ManualInterventionRecord;
  environment: RunEnvironmentContext;
  rawResponseText: string;
  responseLengthChars: number;
  responseLengthWords: number;
  citations: CitationObservation[];
  totalCitationsObserved: number;
  distinctDomainsCited: number;
  observations: string[]; // Strict factual statements of what was observed in the output
  researcherNotes?: string;
  evidence: EvidenceArtifactReference;
  reproducibilityLimitations: string[];
}

/**
 * Assisted / Interactive Run Record Specification
 * Extends ExperimentRunRecord with mandatory assisted capture metadata fields
 */
export interface AssistedExperimentRunRecord extends ExperimentRunRecord {
  cohort: ResearchCohort;
  captureMode: CaptureMode;
  accountClass: AccountClass;
  authenticationState: AssistedAuthenticationState;
  personalizationState: AssistedPersonalizationState;
  manualIntervention: ManualInterventionRecord;
}

/**
 * Metric Derived from Captured Run Records
 */
export interface ExperimentMeasurement {
  measurementId: string; // e.g. "MSR-001"
  metricName: string;
  derivationFormula: string;
  numericValue?: number;
  stringValue?: string;
  unit?: string;
  sampleSizeRuns: number;
  supportingRunIds: string[];
  confidenceIntervalNotes?: string;
}

/**
 * Verified Scientific Finding Supported by Observations and Measurements
 */
export interface ExperimentFinding {
  findingId: string; // e.g. "FND-001"
  statement: string; // Empirical claim grounded in evidence
  supportingMeasurementIds: string[];
  supportingRunIds: string[];
  confidenceLevel: "PRELIMINARY" | "MODERATE" | "HIGH";
  interpretation: string; // Contextual discussion strictly separated from the empirical finding
  limitations: string[]; // Bounding conditions, sample limits, engine opacity
}
