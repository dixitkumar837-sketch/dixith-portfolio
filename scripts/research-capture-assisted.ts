#!/usr/bin/env node
/**
 * DIXITH Research Assisted Capture CLI
 * Phase 8I.7.2 — Implementation
 * 
 * Usage:
 *   npm run research:capture:assisted -- --help
 *   npm run research:capture:assisted -- --dry-run --system "ChatGPT" --query Q-001
 *   npm run research:capture:assisted -- --system "Claude" --query Q-001 --cdp-url "http://127.0.0.1:9222"
 * 
 * Strict Governance:
 *   - Offline dry-run is the default execution mode.
 *   - Requires explicit --assisted-live flag for live execution attempt.
 *   - Zero credential storage, zero passwords, zero tokens, zero CAPTCHA bypass.
 */

import {
  executeAssistedDryRun,
  executeAssistedLiveCapture,
  DEFAULT_CDP_ENDPOINT,
} from "../lib/research/assisted-capture";
import {
  CANONICAL_AI_SEARCH_SYSTEMS,
  ResearchCohort,
  AccountClass,
  AccountSubscriptionTier,
} from "../data/research-protocol-types";

function printHelp(): void {
  console.log(`
================================================================================
 DIXITH Research Assisted Evidence Capture CLI — Phase 8I.7.2
================================================================================

DESCRIPTION:
  Executes or dry-runs standardized generative AI search research capture by
  attaching to an existing, researcher-controlled local Chrome browser instance
  via Chrome DevTools Protocol (CDP).

USAGE:
  npm run research:capture:assisted -- [options]

OPTIONS:
  --help, -h               Show this help message and exit.
  --dry-run                (Default) Validate parameters, query, system domain,
                           and paths offline without connecting to browser.
  --system <name>          Specify target canonical AI search system.
                           Allowed values:
                             - "Google AI Overview"
                             - "ChatGPT"
                             - "Perplexity"
                             - "Claude"
                             - "Gemini"
                             - "Microsoft Copilot"
  --query <Q-ID>           Specify query ID from registry (e.g. Q-001 to Q-096).
                           Default: Q-001.
  --cdp-url <url>          Specify local Chrome DevTools Protocol endpoint.
                           Must resolve to local loopback (localhost or 127.0.0.1).
                           Default: ${DEFAULT_CDP_ENDPOINT}
  --cohort <cohort>        Specify research cohort:
                             - COHORT_A_LOGGED_OUT
                             - COHORT_B_AUTHENTICATED_PERSONAL
                             - COHORT_C_RESEARCH_CLEAN (Default)
  --account-class <class>  Specify account class:
                             - LOGGED_OUT
                             - PERSONAL
                             - RESEARCH_CLEAN (Default)
  --tier <tier>            Specify subscription tier (FREE, PAID, UNKNOWN, NOT_APPLICABLE).
                           Default: FREE.
  --assisted-live          Opt-in flag required for live browser attachment.
                           (Blocked in Phase 8I.7.2 pending Gate 2 sign-off).

SAFETY RULES:
  1. The harness never performs login, enters passwords, or handles MFA.
  2. The harness never bypasses, automates, or solves CAPTCHA challenges.
  3. No credentials, tokens, cookies, or personal identifiers are stored.
  4. Remote CDP endpoints outside 127.0.0.1 or localhost are strictly rejected.

EXAMPLES:
  npm run research:capture:assisted -- --dry-run --system "ChatGPT" --query Q-001
  npm run research:capture:assisted -- --system "Google AI Overview" --query Q-050
  npm run research:capture:assisted -- --system "Claude" --query Q-065 --cdp-url "http://localhost:9222"
================================================================================
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse command-line arguments
  let queryId = "Q-001";
  let systemName = "ChatGPT";
  let cdpUrl = DEFAULT_CDP_ENDPOINT;
  let userRunNumber: number | undefined;
  let userSuppliedCohort: ResearchCohort | undefined;
  let userSuppliedAccountClass: AccountClass | undefined;
  let userSuppliedTier: AccountSubscriptionTier | undefined;
  let phaseId: string = "8I.7.5";
  let isLive = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--query" && args[i + 1]) {
      queryId = args[i + 1];
      i++;
    } else if (arg === "--system" && args[i + 1]) {
      systemName = args[i + 1];
      i++;
    } else if (arg === "--cdp-url" && args[i + 1]) {
      cdpUrl = args[i + 1];
      i++;
    } else if (arg === "--run-number" && args[i + 1]) {
      userRunNumber = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === "--cohort" && args[i + 1]) {
      userSuppliedCohort = args[i + 1] as ResearchCohort;
      i++;
    } else if (arg === "--account-class" && args[i + 1]) {
      userSuppliedAccountClass = args[i + 1] as AccountClass;
      i++;
    } else if (arg === "--tier" && args[i + 1]) {
      userSuppliedTier = args[i + 1] as AccountSubscriptionTier;
      i++;
    } else if (arg === "--phase-id" && args[i + 1]) {
      phaseId = args[i + 1];
      i++;
    } else if (arg === "--assisted-live") {
      isLive = true;
    }
  }

  // Fallbacks for offline dry-run only
  const cohort: ResearchCohort = userSuppliedCohort || "COHORT_C_RESEARCH_CLEAN";
  const accountClass: AccountClass = userSuppliedAccountClass || "RESEARCH_CLEAN";
  const tier: AccountSubscriptionTier = userSuppliedTier || "FREE";

  if (isLive) {
    if (userRunNumber === undefined || isNaN(userRunNumber) || userRunNumber <= 0) {
      console.error("\n[SAFETY ERROR] Live assisted capture requires an explicit --run-number (e.g. --run-number 7).\n");
      process.exit(1);
    }
    if (!userSuppliedCohort) {
      console.error("\n[SAFETY ERROR] Live assisted capture requires an explicit --cohort flag (COHORT_A_LOGGED_OUT, COHORT_B_AUTHENTICATED_PERSONAL, COHORT_C_RESEARCH_CLEAN).\n");
      process.exit(1);
    }
    if (!userSuppliedAccountClass) {
      console.error("\n[SAFETY ERROR] Live assisted capture requires an explicit --account-class flag (LOGGED_OUT, PERSONAL, RESEARCH_CLEAN).\n");
      process.exit(1);
    }
    if (!userSuppliedTier) {
      console.error("\n[SAFETY ERROR] Live assisted capture requires an explicit --tier flag (FREE, PAID, UNKNOWN).\n");
      process.exit(1);
    }
  }

  console.log("================================================================================");
  console.log(" DIXITH Research Assisted Capture — Execution Runner");
  console.log("================================================================================");
  console.log(`Execution Mode:  ${isLive ? "LIVE ASSISTED ATTEMPT" : "DRY-RUN (Offline Validation)"}`);
  console.log(`Phase ID:        ${phaseId}`);
  console.log(`Target System:   ${systemName}`);
  console.log(`Query ID:        ${queryId}`);
  console.log(`Run Number:      ${userRunNumber ?? (isLive ? "REQUIRED" : 1)}`);
  console.log(`CDP Endpoint:    ${cdpUrl}`);
  console.log(`Research Cohort: ${cohort}`);
  console.log(`Account Class:   ${accountClass} (${tier})`);
  console.log("--------------------------------------------------------------------------------");

  if (!isLive) {
    try {
      const plan = executeAssistedDryRun({
        queryId,
        systemName,
        phaseId,
        cdpUrl,
        cohort,
        accountClass,
        subscriptionTier: tier,
        runNumber: userRunNumber || 1,
      });

      console.log("\n[Dry-Run Validation Result]");
      console.log(`  ✓ System Verified:        ${plan.system}`);
      console.log(`  ✓ Expected Domain:        ${plan.expectedDomain}`);
      console.log(`  ✓ Query Resolved:         "${plan.exactQuery}"`);
      console.log(`  ✓ Deterministic Run ID:   ${plan.runId}`);
      console.log(`  ✓ Relative Raw Text:      ${plan.plannedPaths.relative.rawText}`);
      console.log(`  ✓ Relative DOM Snapshot:  ${plan.plannedPaths.relative.domSnapshot}`);
      console.log(`  ✓ Relative Screenshot:    ${plan.plannedPaths.relative.screenshot}`);
      console.log(`  ✓ Relative Run Record:    ${plan.plannedPaths.relative.runRecord}`);

      console.log("\n[Intended Harness Actions]");
      for (const act of plan.intendedActions) {
        console.log(`  ${act}`);
      }

      console.log("\n[Safety Guards Verified]");
      console.log(`  ✓ Local Loopback:         ${plan.safetyGuardsVerified.isLocalLoopback}`);
      console.log(`  ✓ Zero Credential Storage:${plan.safetyGuardsVerified.zeroCredentialStorage}`);
      console.log(`  ✓ No Stealth Plugins:     ${plan.safetyGuardsVerified.noStealthPlugins}`);
      console.log(`  ✓ No Proxy Rotation:      ${plan.safetyGuardsVerified.noProxyRotation}`);
      console.log(`  ✓ No Captcha Bypass:      ${plan.safetyGuardsVerified.noCaptchaBypass}`);
      console.log(`  ✓ Disk Storage Preserved: ${plan.safetyGuardsVerified.dryRunPreservesDisk}`);

      console.log("\n================================================================================");
      console.log(" DRY-RUN COMPLETED SUCCESSFULLY — 0 Network Requests, 0 Files Written");
      console.log("================================================================================\n");
    } catch (err: any) {
      console.error("\n[DRY-RUN ERROR]", err.message);
      process.exit(1);
    }
  } else {
    try {
      const record = await executeAssistedLiveCapture({
        queryId,
        systemName,
        phaseId,
        cdpUrl,
        cohort,
        accountClass,
        subscriptionTier: tier,
        runNumber: userRunNumber,
        assistedLive: true,
      });

      console.log("\n================================================================================");
      console.log(" LIVE ASSISTED CAPTURE EXECUTION COMPLETED");
      console.log("================================================================================");
      console.log(`  ✓ Run ID:             ${record.runId}`);
      console.log(`  ✓ System:             ${record.system}`);
      console.log(`  ✓ Query:              ${record.queryId} ("${record.exactQuery}")`);
      console.log(`  ✓ Execution Status:   ${record.executionStatus}`);
      console.log(`  ✓ Response Length:    ${record.responseLengthWords} words (${record.responseLengthChars} chars)`);
      console.log(`  ✓ Citations Observed: ${record.totalCitationsObserved} (Distinct Domains: ${record.distinctDomainsCited})`);
      console.log(`  ✓ Raw Text:           evidence/exp-001/${record.evidence.rawTextPath}`);
      console.log(`  ✓ DOM Snapshot:       evidence/exp-001/${record.evidence.domSnapshotPath}`);
      console.log(`  ✓ Screenshot:         evidence/exp-001/${record.evidence.screenshotPath}`);
      console.log(`  ✓ SHA-256 Digest:     ${record.evidence.sha256Hash}`);
      console.log("================================================================================\n");
    } catch (err: any) {
      console.error("\n[LIVE ATTEMPT FAILED / BLOCKED]", err.message);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal CLI Error:", err);
  process.exit(1);
});
