#!/usr/bin/env node
/**
 * DIXITH Phase 8I.7.3 — Assisted 1x6 Controlled Pilot Execution Runner
 * 
 * Strict Governance:
 * - Exactly Q-001 across the 6 canonical AI search systems.
 * - Maximum 6 primary attempts (1 attempt per system).
 * - Zero external API keys, zero credential storage, zero CAPTCHA bypass.
 * - Preserves historical Phase 8I.7 evidence.
 */

import fs from "fs";
import path from "path";
import {
  executeAssistedLiveCapture,
  DEFAULT_CDP_ENDPOINT,
} from "../lib/research/assisted-capture";
import {
  formatUtcDateString,
  formatUtcFolderString,
} from "../lib/research/capture-harness";
import {
  CANONICAL_AI_SEARCH_SYSTEMS,
  CanonicalAISearchSystem,
  AssistedExperimentRunRecord,
} from "../data/research-protocol-types";

async function runPilot(): Promise<void> {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8I.7.3 — Assisted 1x6 Controlled Pilot Execution");
  console.log(" Experiment: EXP-001 | Query: Q-001 | Canonical Systems: 6");
  console.log("================================================================================\n");

  const queryId = "Q-001";
  const systemsToExecute: CanonicalAISearchSystem[] = [
    "Google AI Overview",
    "ChatGPT",
    "Perplexity",
    "Claude",
    "Gemini",
    "Microsoft Copilot",
  ];

  const results: AssistedExperimentRunRecord[] = [];
  const startTime = new Date();

  for (let idx = 0; idx < systemsToExecute.length; idx++) {
    const system = systemsToExecute[idx];
    const runNum = idx + 1;

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`[EXECUTION ${runNum}/6] System: ${system} | Query: ${queryId}`);
    console.log(`--------------------------------------------------------------------------------`);

    try {
      const record = await executeAssistedLiveCapture({
        queryId,
        systemName: system,
        cdpUrl: DEFAULT_CDP_ENDPOINT,
        runNumber: runNum,
        cohort: "COHORT_A_LOGGED_OUT",
        accountClass: "LOGGED_OUT",
        subscriptionTier: "FREE",
        assistedLive: true,
      });

      results.push(record);

      console.log(`  ✓ Status:             ${record.executionStatus}`);
      console.log(`  ✓ Run ID:             ${record.runId}`);
      console.log(`  ✓ Response Words:     ${record.responseLengthWords}`);
      console.log(`  ✓ Citations Observed: ${record.totalCitationsObserved}`);
      console.log(`  ✓ Raw Text Path:      ${record.evidence.rawTextPath}`);
      console.log(`  ✓ Raw HTML Path:      ${record.evidence.domSnapshotPath}`);
      console.log(`  ✓ Screenshot Path:    ${record.evidence.screenshotPath}`);
      console.log(`  ✓ SHA-256 Digest:     ${record.evidence.sha256Hash}\n`);
    } catch (err: any) {
      console.error(`  ✗ Execution Halted for ${system}: ${err.message}\n`);
    }

    // Small delay between primary system attempts
    if (idx < systemsToExecute.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  const endTime = new Date();
  const folderStr = formatUtcFolderString(startTime);
  const baseEvidenceDir = path.join(process.cwd(), "evidence", "exp-001");
  const runsDir = path.join(baseEvidenceDir, "runs", folderStr);

  const summary = {
    pilotId: "PILOT-8I.7.3-1X6",
    experimentId: "EXP-001",
    phase: "8I.7.3",
    timestamp: startTime.toISOString(),
    completedAt: endTime.toISOString(),
    queryId: "Q-001",
    totalPlannedAttempts: 6,
    totalExecutedAttempts: results.length,
    successfulAnswers: results.filter((r) => r.executionStatus === "SUCCESS").length,
    blockedOrFailed: results.filter((r) => r.executionStatus !== "SUCCESS").length,
    statusBreakdown: results.reduce((acc: Record<string, number>, r) => {
      const st = String(r.executionStatus || "UNKNOWN");
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, {}),
    runs: results.map((r) => ({
      runId: r.runId,
      system: r.system,
      status: r.executionStatus,
      words: r.responseLengthWords,
      citations: r.totalCitationsObserved,
      textSha256: r.evidence.sha256Hash,
      jsonPath: `runs/${folderStr}/${r.runId}.json`,
    })),
  };

  const summaryPath = path.join(runsDir, "pilot-8i73-summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");

  console.log("================================================================================");
  console.log(" PHASE 8I.7.3 — PILOT EXECUTION SUMMARY");
  console.log("================================================================================");
  console.log(`Planned Attempts:    ${summary.totalPlannedAttempts}`);
  console.log(`Executed Attempts:   ${summary.totalExecutedAttempts}`);
  console.log(`Successful Answers:  ${summary.successfulAnswers}`);
  console.log(`Blocked / Failed:    ${summary.blockedOrFailed}`);
  console.log(`Status Breakdown:    ${JSON.stringify(summary.statusBreakdown)}`);
  console.log(`Summary JSON Path:   evidence/exp-001/runs/${folderStr}/pilot-8i73-summary.json`);
  console.log("================================================================================\n");
}

runPilot().catch((err) => {
  console.error("Fatal Pilot Runner Error:", err);
  process.exit(1);
});
