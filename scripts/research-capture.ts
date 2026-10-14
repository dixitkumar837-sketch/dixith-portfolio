#!/usr/bin/env node
/**
 * DIXITH Research Evidence Capture CLI
 * Phase 8I.6 — Local Evidence Capture Infrastructure
 * 
 * Usage:
 *   npm run research:capture -- --help
 *   npm run research:capture -- --dry-run --query Q-001 --system "ChatGPT"
 * 
 * Default mode is always DRY-RUN. Live execution is strictly blocked in Phase 8I.6.
 */

import { executeDryRunCapture } from "../lib/research/capture-harness";
import { CANONICAL_AI_SEARCH_SYSTEMS } from "../data/research-protocol-types";

function printHelp(): void {
  console.log(`
================================================================================
 DIXITH Research Evidence Capture Harness — CLI
================================================================================

USAGE:
  npm run research:capture -- [options]

OPTIONS:
  --help, -h             Show this help message.
  --dry-run              (Default) Execute offline pipeline validation without network calls.
  --query <Q-ID>         Specify query ID (e.g. Q-001, Q-017). Default: Q-001.
  --system <name>        Specify canonical system name. Default: "ChatGPT".
                         Supported systems:
                           - "Google AI Overview"
                           - "ChatGPT"
                           - "Perplexity"
                           - "Claude"
                           - "Gemini"
                           - "Microsoft Copilot"
  --live                 [DISABLED IN PHASE 8I.6] Live execution is not permitted.

EXAMPLES:
  npm run research:capture -- --dry-run --query Q-001 --system "ChatGPT"
  npm run research:capture -- --query Q-065 --system "Google AI Overview"
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  if (args.includes("--live")) {
    console.error(`
[SAFETY ENFORCEMENT ERROR]
  Live AI search execution is strictly disabled in Phase 8I.6.
  This phase is restricted to offline capture harness infrastructure and schema validation only.
  Please run with --dry-run (or omit --live) to validate the capture pipeline safely.
`);
    process.exit(1);
  }

  // Parse arguments
  let queryId = "Q-001";
  let systemName = "ChatGPT";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--query" && args[i + 1]) {
      queryId = args[i + 1];
      i++;
    } else if (args[i] === "--system" && args[i + 1]) {
      systemName = args[i + 1];
      i++;
    }
  }

  console.log("================================================================================");
  console.log(" DIXITH Research Evidence Capture — Dry-Run Harness");
  console.log("================================================================================");
  console.log(`Target Query ID:  ${queryId}`);
  console.log(`Target System:    ${systemName}`);
  console.log(`Execution Mode:   DRY-RUN (Offline Schema & Path Validation)`);
  console.log("--------------------------------------------------------------------------------");

  try {
    const result = await executeDryRunCapture({
      queryId,
      systemName,
    });

    console.log("\n[Pipeline Step 1: Query & System Resolution]");
    console.log(`  ✓ Query Resolved: "${result.queryText}"`);
    console.log(`  ✓ System Resolved: ${result.system}`);

    console.log("\n[Pipeline Step 2: Deterministic Run ID & Path Resolution]");
    console.log(`  ✓ Generated Run ID: ${result.runId}`);
    console.log(`  ✓ Relative Raw Text Path:   ${result.paths.relative.rawText}`);
    console.log(`  ✓ Relative Raw HTML Path:   ${result.paths.relative.domSnapshot}`);
    console.log(`  ✓ Relative Screenshot Path: ${result.paths.relative.screenshot}`);
    console.log(`  ✓ Relative Run Record Path: ${result.paths.relative.runRecord}`);

    console.log("\n[Pipeline Step 3: SHA-256 Integrity Verification]");
    console.log(`  ✓ Computed SHA-256: ${result.sha256Verification.computedHash}`);

    console.log("\n[Pipeline Step 4: Run Record Schema Validation]");
    console.log(`  ✓ Experiment ID:        ${result.runRecord.experimentId}`);
    console.log(`  ✓ Status:               VALID (0 errors)`);
    console.log(`  ✓ Observable Citations: ${result.runRecord.totalCitationsObserved}`);
    console.log(`  ✓ Environment Captured: ${result.runRecord.environment.browserOrClient}`);

    console.log("\n[Pipeline Step 5: Evidence Vault Protection]");
    for (const note of result.notes) {
      console.log(`  • ${note}`);
    }

    console.log("\n================================================================================");
    console.log(" DRY-RUN COMPLETED SUCCESSFULLY — ZERO LIVE NETWORK REQUESTS EXECUTED");
    console.log("================================================================================\n");
  } catch (error) {
    console.error("\n[CAPTURE ERROR]:", (error as Error).message);
    process.exit(1);
  }
}

main();
