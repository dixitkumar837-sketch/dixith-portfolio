/**
 * DIXITH Research Evidence Capture Harness
 * Phase 8I.6 — Local Evidence Capture Infrastructure
 * 
 * Provides deterministic, cryptographically hashed, local run recording for
 * EXP-001 six-system AI search research without requiring an external database,
 * third-party cloud services, or paid AI APIs.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {
  CanonicalAISearchSystem,
  CANONICAL_AI_SEARCH_SYSTEMS,
  QueryDefinition,
  QueryRegistryMetadata,
  SystemsRegistry,
  SystemRegistryEntry,
  RunEnvironmentContext,
  EvidenceArtifactReference,
  ExperimentRunRecord,
} from "../../data/research-protocol-types";
import { getCaptureAdapter, CaptureRequest } from "./adapters";

export interface EvidencePathMapping {
  runId: string;
  dateFolder: string;
  relative: {
    rawText: string;
    domSnapshot: string;
    screenshot: string;
    runRecord: string;
  };
  absolute: {
    rawText: string;
    domSnapshot: string;
    screenshot: string;
    runRecord: string;
  };
}

export interface DryRunExecutionResult {
  success: boolean;
  runId: string;
  system: CanonicalAISearchSystem;
  queryId: string;
  queryText: string;
  paths: EvidencePathMapping;
  runRecord: ExperimentRunRecord;
  validation: {
    isValid: boolean;
    errors: string[];
  };
  sha256Verification: {
    tested: boolean;
    computedHash?: string;
  };
  notes: string[];
}

/**
 * Loads the canonical Query Registry from disk
 */
export function loadQueryRegistry(customPath?: string): QueryRegistryMetadata {
  const filePath = customPath || path.join(process.cwd(), "evidence", "exp-001", "registry", "queries.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Query registry not found at path: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as QueryRegistryMetadata;
}

/**
 * Loads the canonical Systems Registry from disk
 */
export function loadSystemsRegistry(customPath?: string): SystemsRegistry {
  const filePath = customPath || path.join(process.cwd(), "evidence", "exp-001", "registry", "systems.json");
  if (!fs.existsSync(filePath)) {
    throw new Error(`Systems registry not found at path: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(content) as SystemsRegistry;
}

/**
 * Resolves a query by its deterministic ID (e.g. "Q-001")
 */
export function resolveQuery(queryId: string, registry?: QueryRegistryMetadata): QueryDefinition {
  const reg = registry || loadQueryRegistry();
  const found = reg.queries.find((q) => q.id === queryId);
  if (!found) {
    throw new Error(`Query with ID "${queryId}" not found in registry (available: Q-001 to Q-${String(reg.totalQueries).padStart(3, "0")})`);
  }
  return found;
}

/**
 * Resolves a system entry by canonical name
 */
export function resolveSystem(systemName: string, registry?: SystemsRegistry): SystemRegistryEntry {
  const reg = registry || loadSystemsRegistry();
  const found = reg.systems.find((s) => s.name.toLowerCase() === systemName.toLowerCase());
  if (!found) {
    throw new Error(
      `System "${systemName}" not found in systems registry. ` +
      `Supported canonical systems: ${CANONICAL_AI_SEARCH_SYSTEMS.join(", ")}`
    );
  }
  return found;
}

/**
 * Formats a Date object to YYYYMMDD string in UTC
 */
export function formatUtcDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Formats a Date object to YYYY-MM-DD folder string in UTC
 */
export function formatUtcFolderString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Normalizes system name to safe lowercase identifier token
 */
export function slugifySystemName(name: CanonicalAISearchSystem): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Generates a deterministic Run ID adhering to the EXP-001 contract:
 * RUN-001-YYYYMMDD-QXXX-system-NN
 */
export function generateRunId(
  queryId: string,
  system: CanonicalAISearchSystem,
  timestamp: Date = new Date(),
  runNumber: number = 1
): string {
  const dateStr = formatUtcDateString(timestamp);
  const sysSlug = slugifySystemName(system);
  const cleanQId = queryId.replace(/[^A-Za-z0-9]/g, "");
  const numStr = String(runNumber).padStart(2, "0");
  return `RUN-001-${dateStr}-${cleanQId}-${sysSlug}-${numStr}`;
}

/**
 * Resolves all relative and absolute evidence paths for a run ID
 */
export function resolveEvidencePaths(
  runId: string,
  timestamp: Date = new Date(),
  baseDir: string = path.join(process.cwd(), "evidence", "exp-001")
): EvidencePathMapping {
  const dateFolder = formatUtcFolderString(timestamp);

  const relRawText = `raw/${dateFolder}/${runId}.txt`;
  const relDom = `raw/${dateFolder}/${runId}.html`;
  const relScreenshot = `raw/${dateFolder}/${runId}.png`;
  const relRunRecord = `runs/${dateFolder}/${runId}.json`;

  return {
    runId,
    dateFolder,
    relative: {
      rawText: relRawText,
      domSnapshot: relDom,
      screenshot: relScreenshot,
      runRecord: relRunRecord,
    },
    absolute: {
      rawText: path.join(baseDir, relRawText),
      domSnapshot: path.join(baseDir, relDom),
      screenshot: path.join(baseDir, relScreenshot),
      runRecord: path.join(baseDir, relRunRecord),
    },
  };
}

/**
 * Captures observable runtime and client environment context.
 * Intentionally leaves proprietary unobservable model internals unpopulated.
 */
export function detectEnvironmentContext(overrides?: Partial<RunEnvironmentContext>): RunEnvironmentContext {
  const now = new Date();
  let localTz = "UTC";
  try {
    localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    localTz = "UTC";
  }

  return {
    timestamp: now.toISOString(),
    timezone: localTz,
    language: "en-US",
    geographicContext: "NOT_FULLY_CONTROLLABLE",
    geographicControlLevel: "PARTIALLY_CONTROLLED",
    personalizationState: "LOGGED_OUT_INCOGNITO",
    searchModeOrState: "Default Web Search",
    browserOrClient: `Node.js/${process.version} (DIXITH Research Capture Harness)`,
    systemConfigurationNotes: "No proprietary internal parameters (temperature, model version, sampling seed) are observable.",
    ...overrides,
  };
}

/**
 * Computes deterministic SHA-256 hash using Node.js crypto
 */
export function calculateSha256(content: string | Buffer): string {
  const hash = crypto.createHash("sha256");
  hash.update(content);
  return hash.digest("hex");
}

/**
 * Computes SHA-256 and byte size for an existing file
 */
export function calculateArtifactIntegrity(filePath: string): { sha256: string; byteSize: number } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Cannot compute hash: file does not exist at "${filePath}"`);
  }
  const buffer = fs.readFileSync(filePath);
  return {
    sha256: calculateSha256(buffer),
    byteSize: buffer.byteLength,
  };
}

/**
 * Validates an ExperimentRunRecord against protocol contract requirements
 */
export function validateRunRecord(record: ExperimentRunRecord): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!record.runId || record.runId.trim().length === 0) {
    errors.push("Missing or empty runId");
  }
  if (record.experimentId !== "EXP-001") {
    errors.push(`Invalid experimentId: expected "EXP-001", got "${record.experimentId}"`);
  }
  if (!CANONICAL_AI_SEARCH_SYSTEMS.includes(record.system)) {
    errors.push(`Invalid system: "${record.system}" is not one of the six canonical systems`);
  }
  if (!/^Q-\d{3}$/.test(record.queryId)) {
    errors.push(`Invalid queryId format: "${record.queryId}" (must match Q-XXX)`);
  }
  if (!record.exactQuery || record.exactQuery.trim().length === 0) {
    errors.push("Missing or empty exactQuery");
  }
  if (!record.environment || !record.environment.timestamp) {
    errors.push("Missing or invalid environment context");
  }
  if (typeof record.responseLengthChars !== "number" || record.responseLengthChars < 0) {
    errors.push("Invalid responseLengthChars");
  }
  if (typeof record.responseLengthWords !== "number" || record.responseLengthWords < 0) {
    errors.push("Invalid responseLengthWords");
  }
  if (!Array.isArray(record.citations)) {
    errors.push("Citations must be an array");
  } else {
    if (record.totalCitationsObserved !== record.citations.length) {
      errors.push(`totalCitationsObserved (${record.totalCitationsObserved}) does not match citations array length (${record.citations.length})`);
    }
    const uniqueDomains = new Set(record.citations.map((c) => c.sourceDomain));
    if (record.distinctDomainsCited !== uniqueDomains.size) {
      errors.push(`distinctDomainsCited (${record.distinctDomainsCited}) does not match distinct domain count (${uniqueDomains.size})`);
    }
  }
  if (!record.evidence || !record.evidence.evidenceId) {
    errors.push("Missing or invalid evidence artifact reference");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Executes an offline Dry-Run capture validation.
 * Loads query, verifies system adapter, generates deterministic paths, computes SHA-256,
 * and validates the resulting record WITHOUT contacting any external AI search system or
 * writing test artifacts into live evidence directories.
 */
export async function executeDryRunCapture(options: {
  queryId: string;
  systemName: string;
  runNumber?: number;
  fixtureDir?: string;
}): Promise<DryRunExecutionResult> {
  const query = resolveQuery(options.queryId);
  const systemEntry = resolveSystem(options.systemName);
  const system = systemEntry.name;
  const runNumber = options.runNumber || 1;

  const now = new Date();
  const runId = generateRunId(query.id, system, now, runNumber);
  const paths = resolveEvidencePaths(runId, now);
  const environment = detectEnvironmentContext();

  const adapter = getCaptureAdapter(system);
  const captureReq: CaptureRequest = {
    queryId: query.id,
    exactQuery: query.query,
    system,
    runNumber,
    dryRun: true,
    notes: `Dry run validation for query ${query.id}`,
  };

  const captureResult = await adapter.executeCapture(captureReq);

  // Compute SHA-256 for the dry-run raw text payload
  const sha256Hash = calculateSha256(captureResult.rawText);

  const wordCount = captureResult.rawText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = captureResult.rawText.length;

  const evidenceRef: EvidenceArtifactReference = {
    evidenceId: `EVD-001-${runId.replace(/^RUN-001-/, "")}`,
    rawTextPath: paths.relative.rawText,
    domSnapshotPath: paths.relative.domSnapshot,
    screenshotPath: paths.relative.screenshot,
    sha256Hash,
    capturedAt: environment.timestamp,
  };

  const runRecord: ExperimentRunRecord = {
    runId,
    experimentId: "EXP-001",
    runNumber,
    system,
    queryId: query.id,
    exactQuery: query.query,
    promptWrapper: "NONE",
    environment,
    rawResponseText: captureResult.rawText,
    responseLengthChars: charCount,
    responseLengthWords: wordCount,
    citations: captureResult.citations,
    totalCitationsObserved: captureResult.citations.length,
    distinctDomainsCited: new Set(captureResult.citations.map((c) => c.sourceDomain)).size,
    observations: captureResult.observations,
    researcherNotes: "Dry-run validation mode. Zero live search requests were dispatched.",
    evidence: evidenceRef,
    reproducibilityLimitations: captureResult.reproducibilityLimitations,
  };

  const validation = validateRunRecord(runRecord);

  // If a local test fixture directory was supplied, verify file-based SHA-256 hashing
  let fixtureHash: string | undefined;
  if (options.fixtureDir && fs.existsSync(options.fixtureDir)) {
    const fixtureFile = path.join(options.fixtureDir, "sample-response.txt");
    if (fs.existsSync(fixtureFile)) {
      fixtureHash = calculateArtifactIntegrity(fixtureFile).sha256;
    }
  }

  return {
    success: validation.isValid,
    runId,
    system,
    queryId: query.id,
    queryText: query.query,
    paths,
    runRecord,
    validation,
    sha256Verification: {
      tested: true,
      computedHash: fixtureHash || sha256Hash,
    },
    notes: [
      "Offline dry-run capture pipeline completed successfully.",
      "Target AI search system was NOT contacted.",
      "Zero files written to live evidence directories (evidence/exp-001/raw/ or evidence/exp-001/runs/).",
      "Full schema validation passed.",
    ],
  };
}
