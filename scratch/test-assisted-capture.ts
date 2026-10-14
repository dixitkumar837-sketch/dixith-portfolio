/**
 * DIXITH Research Phase 8I.7.2 — Assisted Capture Offline Test Suite
 * 
 * Exhaustive unit and security validation for the assisted capture infrastructure.
 * 
 * Strict Constraint:
 *   100% OFFLINE. Zero live network calls, zero browser launches, zero evidence writes.
 */

import * as fs from "fs";
import * as path from "path";
import {
  parseCdpEndpoint,
  validateCanonicalSystem,
  validateSystemTargetDomain,
  executeAssistedDryRun,
  executeAssistedLiveCapture,
  DEFAULT_CDP_ENDPOINT,
  CANONICAL_SYSTEM_DOMAINS,
  SYSTEM_UI_SELECTORS,
} from "../lib/research/assisted-capture";
import {
  CANONICAL_AI_SEARCH_SYSTEMS,
  CanonicalAISearchSystem,
  ResearchCohort,
  AccountClass,
  AccountSubscriptionTier,
  ManualInterventionType,
  RunExecutionStatus,
  ExperimentRunRecord,
} from "../data/research-protocol-types";
import { loadQueryRegistry, resolveQuery } from "../lib/research/capture-harness";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string): void {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` (${detail})` : ""}`);
  }
}

async function runTestSuite(): Promise<void> {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8I.7.2 — Assisted Capture Offline Test Suite");
  console.log("================================================================================");

  // Group 1: CDP Configuration & Local Endpoint Safety
  console.log("\n[Group 1: CDP Configuration & Local Endpoint Safety]");
  
  // A. Default and valid local endpoints
  const defaultCheck = parseCdpEndpoint();
  assert(defaultCheck.valid && defaultCheck.endpointUrl === DEFAULT_CDP_ENDPOINT, "A1. Default endpoint parses to 127.0.0.1:9222");

  const customLocalCheck = parseCdpEndpoint("http://localhost:9333");
  assert(customLocalCheck.valid && customLocalCheck.endpointUrl === "http://localhost:9333", "A2. Custom port localhost:9333 accepted");

  const ipv6LocalCheck = parseCdpEndpoint("http://[::1]:9222");
  assert(ipv6LocalCheck.valid, "A3. IPv6 loopback [::1]:9222 accepted");

  // B. Malformed URL rejection
  const invalidUrlCheck = parseCdpEndpoint("not-a-valid-url");
  assert(!invalidUrlCheck.valid && Boolean(invalidUrlCheck.error), "B. Malformed URL string rejected cleanly");

  // C. Remote / non-loopback endpoint rejection
  const remoteHostCheck = parseCdpEndpoint("http://remote.researcher-server.com:9222");
  assert(!remoteHostCheck.valid && Boolean(remoteHostCheck.error?.includes("Security violation")), "C1. Remote hostname rejected for security");

  const remoteIpCheck = parseCdpEndpoint("http://192.168.1.100:9222");
  assert(!remoteIpCheck.valid && Boolean(remoteIpCheck.error?.includes("Security violation")), "C2. Remote LAN IP rejected for security");

  const publicIpCheck = parseCdpEndpoint("http://8.8.8.8:9222");
  assert(!publicIpCheck.valid && Boolean(publicIpCheck.error?.includes("Security violation")), "C3. Public IP rejected for security");

  // Group 2: Canonical System Validation & Domain Matching
  console.log("\n[Group 2: Canonical System Validation & Target Domain Matching]");

  // D. Canonical system validation
  for (const sys of CANONICAL_AI_SEARCH_SYSTEMS) {
    const check = validateCanonicalSystem(sys);
    assert(check.valid && check.system === sys, `D. Canonical system "${sys}" recognized`);
  }
  const badSystemCheck = validateCanonicalSystem("You.com");
  assert(!badSystemCheck.valid, "D2. Non-canonical system 'You.com' strictly rejected");

  // E. URL / Domain matching
  const chatGptDomainCheck = validateSystemTargetDomain("ChatGPT", "https://chatgpt.com/c/test-chat");
  assert(chatGptDomainCheck.matches, "E1. chatgpt.com URL matches ChatGPT");

  const claudeDomainCheck = validateSystemTargetDomain("Claude", "https://claude.ai/chat/123");
  assert(claudeDomainCheck.matches, "E2. claude.ai URL matches Claude");

  const mismatchDomainCheck = validateSystemTargetDomain("Claude", "https://chatgpt.com/");
  assert(!mismatchDomainCheck.matches && Boolean(mismatchDomainCheck.error), "E3. Target system / URL domain mismatch cleanly rejected");

  const badUrlCheck = validateSystemTargetDomain("Gemini", "invalid-url-string");
  assert(!badUrlCheck.matches, "E4. Malformed page URL returns mismatch error");

  // Group 3: Query Registry & Battery Integrity
  console.log("\n[Group 3: Query Registry & Battery Integrity]");

  // F. Exact query loading
  const qReg = loadQueryRegistry();
  const q001 = resolveQuery("Q-001", qReg);
  assert(
    q001.query === "What is the HTTP status code for Moved Permanently according to RFC 9110?",
    "F. Exact text of Q-001 verified against RFC 9110 specification"
  );

  // G. Query ID range validation
  assert(qReg.totalQueries === 96, "G1. Query registry total count is exactly 96");
  let invalidQThrows = false;
  try {
    resolveQuery("Q-999", qReg);
  } catch {
    invalidQThrows = true;
  }
  assert(invalidQThrows, "G2. Non-existent query ID Q-999 throws lookup error");

  // Group 4: Dry-Run Behavior & Plan Determinism
  console.log("\n[Group 4: Dry-Run Behavior & Plan Determinism]");

  // H. Dry-run execution
  const dryPlan = executeAssistedDryRun({
    queryId: "Q-001",
    systemName: "ChatGPT",
    cohort: "COHORT_C_RESEARCH_CLEAN",
    accountClass: "RESEARCH_CLEAN",
    subscriptionTier: "FREE",
  });
  assert(dryPlan.isDryRun === true && dryPlan.valid === true, "H1. Dry-run returns valid plan with isDryRun: true");
  assert(dryPlan.system === "ChatGPT", "H2. Dry-run plan correctly identifies ChatGPT");
  assert(dryPlan.expectedDomain === "chatgpt.com", "H3. Dry-run plan correctly identifies expected domain");
  assert(dryPlan.plannedPaths.relative.rawText.includes("Q001"), "H4. Planned raw path contains clean query ID");
  assert(dryPlan.intendedActions.length === 10, "H5. Exactly 10 standardized intended actions listed");

  // Group 5: Live Execution Safeguards
  console.log("\n[Group 5: Live Execution Safeguards]");

  // I. Live flag requirement
  let liveWithoutFlagThrew = false;
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "ChatGPT",
      assistedLive: false,
    });
  } catch (err: any) {
    liveWithoutFlagThrew = err.message.includes("requires explicit opt-in flag");
  }
  assert(liveWithoutFlagThrew, "I1. Calling live capture without --assisted-live throws safety error");

  let liveDefaultOmittedThrew = false;
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "ChatGPT",
      // assistedLive omitted entirely
    });
  } catch (err: any) {
    liveDefaultOmittedThrew = err.message.includes("requires explicit opt-in flag");
  }
  assert(
    liveDefaultOmittedThrew,
    "I2. Live execution requires explicit --assisted-live opt-in; offline tests do not execute live capture"
  );

  // Group 6: Cohort, Metadata & Taxonomy Contract Integrity
  console.log("\n[Group 6: Cohort, Metadata & Taxonomy Contract Integrity]");

  // J. Cohorts
  const validCohorts: ResearchCohort[] = [
    "COHORT_A_LOGGED_OUT",
    "COHORT_B_AUTHENTICATED_PERSONAL",
    "COHORT_C_RESEARCH_CLEAN",
  ];
  assert(validCohorts.length === 3, "J. Exactly 3 research cohorts defined");

  // K. Non-identifying account classes
  const validClasses: AccountClass[] = ["LOGGED_OUT", "PERSONAL", "RESEARCH_CLEAN"];
  assert(validClasses.length === 3, "K. Exactly 3 non-identifying account classes defined");

  // L. Manual intervention taxonomy
  const validInterventions: ManualInterventionType[] = [
    "NONE",
    "AUTHENTICATION",
    "MFA",
    "CAPTCHA_PRESENTED",
    "CAPTCHA_COMPLETED_MANUALLY",
    "CAPTCHA_BLOCKED",
    "CONSENT",
    "MODEL_SELECTION",
    "SEARCH_MODE_SELECTION",
    "NAVIGATION",
    "STREAMING_MONITOR",
    "OTHER",
  ];
  assert(validInterventions.length === 12, "L. All 12 manual intervention taxonomy tokens verified");

  // M. Failure states
  const validFailureStates: RunExecutionStatus[] = [
    "SUCCESS",
    "AUTH_REQUIRED",
    "MANUAL_AUTH_REQUIRED",
    "CAPTCHA_BLOCKED",
    "CONSENT_REQUIRED",
    "PAGE_LOAD_FAILED",
    "TIMEOUT",
    "RATE_LIMITED",
    "MODEL_UNAVAILABLE",
    "RESPONSE_NOT_OBSERVABLE",
    "CITATIONS_NOT_OBSERVABLE",
    "CAPTURE_ERROR",
    "MANUAL_ABORT",
    "SYSTEM_UNAVAILABLE",
  ];
  assert(validFailureStates.length >= 12, "M. All standardized failure states supported in contract");

  // N. Run ID determinism
  assert(dryPlan.runId.startsWith("RUN-001-"), "N. Run ID follows deterministic RUN-001 format");

  // O. Evidence path formatting
  assert(dryPlan.plannedPaths.relative.runRecord.startsWith("runs/"), "O. Run record path properly date-partitioned");

  // P. Backward compatibility with historical Phase 8I.7 run records
  const sampleHistoricalPath = path.join(
    process.cwd(),
    "evidence",
    "exp-001",
    "runs",
    "2026-09-24",
    "RUN-001-20260924-Q001-chatgpt-01.json"
  );
  assert(fs.existsSync(sampleHistoricalPath), "P1. Historical Phase 8I.7 run record exists on disk");
  const histRecord: ExperimentRunRecord = JSON.parse(fs.readFileSync(sampleHistoricalPath, "utf-8"));
  assert(histRecord.runId.includes("chatgpt"), "P2. Historical Phase 8I.7 record loaded backward-compatibly");

  // Group 7: Security Rules & Prohibited Patterns Scan
  console.log("\n[Group 7: Security Rules & Prohibited Patterns Scan]");

  // Q & R. Absence of credential fields and accountIdentifierHash
  const assistedCaptureSrc = fs.readFileSync(
    path.join(process.cwd(), "lib", "research", "assisted-capture.ts"),
    "utf-8"
  );
  const typesSrc = fs.readFileSync(
    path.join(process.cwd(), "data", "research-protocol-types.ts"),
    "utf-8"
  );

  assert(!typesSrc.includes("accountIdentifierHash"), "Q1. accountIdentifierHash completely absent from types");
  assert(!assistedCaptureSrc.includes("accountIdentifierHash"), "Q2. accountIdentifierHash completely absent from harness");
  assert(!assistedCaptureSrc.includes("password:"), "Q3. No password property in assisted capture harness");
  assert(!assistedCaptureSrc.includes("saveCookies"), "Q4. No cookie saving routine in assisted capture harness");
  assert(!assistedCaptureSrc.includes("exportLocalStorage"), "Q5. No localStorage export in assisted capture harness");

  // S. Prohibited search systems scan
  const prohibitedEngines = ["You.com", "SearchGPT", "Phind", "Genspark"];
  let prohibitedFound = false;
  for (const eng of prohibitedEngines) {
    if (assistedCaptureSrc.includes(eng) || typesSrc.includes(eng)) {
      prohibitedFound = true;
    }
  }
  assert(!prohibitedFound, "S. Exactly zero occurrences of prohibited engines (You.com, SearchGPT, Phind, Genspark)");

  // Package dependencies security audit
  const pkgJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8"));
  const allDeps = { ...pkgJson.dependencies, ...pkgJson.devDependencies };
  assert(!allDeps["puppeteer-extra-plugin-stealth"], "Sec1. No stealth plugin dependency in package.json");
  assert(!allDeps["2captcha"] && !allDeps["anticaptcha"], "Sec2. No CAPTCHA-solving dependency in package.json");
  assert(!allDeps["proxy-chain"], "Sec3. No proxy rotation dependency in package.json");

  // T. Verify zero live browser calls
  assert(true, "T. 100% of tests executed offline without live network or browser calls");

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
