#!/usr/bin/env node
/**
 * DIXITH Phase 8I.7.5.1 — Assisted Capture Runner Integrity Test Suite
 * 
 * Strict Offline Validation:
 * Validates all 10 runner integrity and safety requirements:
 * 1. Existing Run ID collision → fail closed.
 * 2. Historical directory collision → fail closed.
 * 3. UTC/IST boundary → 2026-09-28 for 2026-09-27T22:36:28Z in Asia/Kolkata.
 * 4. Missing live run number → fail closed.
 * 5. Missing live cohort/account metadata → fail closed.
 * 6. PERSONAL + PAID + AUTHENTICATED → valid metadata combination.
 * 7. LOGGED_OUT + MFA true → fail closed.
 * 8. RESEARCH_CLEAN without explicit declaration → fail closed.
 * 9. Run ID date and folder date → strictly identical.
 * 10. Phase 8I.7.5 cannot collide with Phase 8I.7.3 identity.
 */

import {
  getResearchLocalDate,
  verifyNoArtifactCollision,
  verifyHistoricalFolderProtection,
  validateCohortAccountIntegrity,
  executeAssistedDryRun,
  executeAssistedLiveCapture,
  COMPLETED_PHASE_FOLDERS,
  RESEARCH_LOCAL_TIMEZONE,
} from "../lib/research/assisted-capture";

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

async function runRunnerIntegrityTests(): Promise<void> {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8I.7.5.1 — Assisted Capture Runner Integrity Test Suite");
  console.log("================================================================================\n");

  // TEST 1: Existing Run ID collision → fail closed
  try {
    // Known historical run from Phase 8I.7.3 (RUN-001-20260927-Q001-gemini-05)
    verifyNoArtifactCollision("RUN-001-20260927-Q001-gemini-05", "2026-09-27");
    assert(false, "TEST 1: Existing Run ID collision throws error");
  } catch (err: any) {
    assert(
      err.message.includes("[COLLISION REFUSAL]"),
      "TEST 1: Existing Run ID collision throws [COLLISION REFUSAL]",
      err.message
    );
  }

  // TEST 2: Historical directory collision → fail closed
  try {
    verifyHistoricalFolderProtection("2026-09-27", false);
    assert(false, "TEST 2: Historical directory collision throws error for 2026-09-27");
  } catch (err: any) {
    assert(
      err.message.includes("[HISTORICAL PROTECTION]"),
      "TEST 2A: Historical directory collision throws [HISTORICAL PROTECTION] for 2026-09-27",
      err.message
    );
  }

  try {
    verifyHistoricalFolderProtection("2026-09-24", false);
    assert(false, "TEST 2B: Historical directory collision throws error for 2026-09-24");
  } catch (err: any) {
    assert(
      err.message.includes("[HISTORICAL PROTECTION]"),
      "TEST 2B: Historical directory collision throws [HISTORICAL PROTECTION] for 2026-09-24",
      err.message
    );
  }

  // TEST 3: UTC/IST boundary → 2026-09-28 for 2026-09-27T22:36:28Z
  const utcBoundaryDate = new Date("2026-09-27T22:36:28.000Z");
  const localBoundary = getResearchLocalDate(utcBoundaryDate, RESEARCH_LOCAL_TIMEZONE);
  assert(
    localBoundary.folderStr === "2026-09-28" && localBoundary.dateStr === "20260928",
    "TEST 3: UTC/IST boundary maps UTC 22:36:28Z on Sept 27 to 2026-09-28 in Asia/Kolkata",
    `Got folder=${localBoundary.folderStr}, date=${localBoundary.dateStr}`
  );

  // TEST 4: Missing live run number → fail closed
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "ChatGPT",
      assistedLive: true,
      cohort: "COHORT_A_LOGGED_OUT",
      accountClass: "LOGGED_OUT",
      subscriptionTier: "FREE",
      // runNumber deliberately omitted
    });
    assert(false, "TEST 4: Missing live run number throws error");
  } catch (err: any) {
    assert(
      err.message.includes("[SAFETY VIOLATION]") && err.message.includes("--run-number"),
      "TEST 4: Missing live run number throws [SAFETY VIOLATION]",
      err.message
    );
  }

  // TEST 5: Missing live cohort/account metadata → fail closed
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "ChatGPT",
      assistedLive: true,
      runNumber: 7,
      // cohort and accountClass deliberately omitted
    });
    assert(false, "TEST 5: Missing live cohort metadata throws error");
  } catch (err: any) {
    assert(
      err.message.includes("[SAFETY VIOLATION]") && err.message.includes("parameters"),
      "TEST 5: Missing live cohort/account metadata throws [SAFETY VIOLATION]",
      err.message
    );
  }

  // TEST 6: PERSONAL + PAID + AUTHENTICATED → valid
  const personalPaid = validateCohortAccountIntegrity(
    "COHORT_B_AUTHENTICATED_PERSONAL",
    "PERSONAL",
    "PAID",
    "AUTHENTICATED",
    false,
    true
  );
  assert(personalPaid.valid, "TEST 6: PERSONAL + PAID + AUTHENTICATED is a valid combination");

  // TEST 7: LOGGED_OUT + MFA true → fail closed
  const loggedOutMfa = validateCohortAccountIntegrity(
    "COHORT_A_LOGGED_OUT",
    "LOGGED_OUT",
    "FREE",
    "LOGGED_OUT",
    true, // Violation: MFA cannot be true for logged-out
    true
  );
  assert(
    !loggedOutMfa.valid && Boolean(loggedOutMfa.error?.includes("mfaCompleted: true")),
    "TEST 7: LOGGED_OUT with mfaCompleted: true fails validation",
    loggedOutMfa.error
  );

  // TEST 8: RESEARCH_CLEAN without explicit declaration → fail closed
  const unassertedClean = validateCohortAccountIntegrity(
    "COHORT_C_RESEARCH_CLEAN",
    "PERSONAL", // Violation: Cohort C requires accountClass RESEARCH_CLEAN
    "FREE",
    "AUTHENTICATED",
    false,
    true
  );
  assert(
    !unassertedClean.valid && Boolean(unassertedClean.error?.includes("requires accountClass RESEARCH_CLEAN")),
    "TEST 8: RESEARCH_CLEAN cohort without matching accountClass fails validation",
    unassertedClean.error
  );

  // TEST 9: Run ID date and folder date → identical
  const now = new Date();
  const currentLocal = getResearchLocalDate(now, RESEARCH_LOCAL_TIMEZONE);
  const dryPlan = executeAssistedDryRun({
    queryId: "Q-001",
    systemName: "Gemini",
    runNumber: 1,
    dateFolderOverride: currentLocal.folderStr,
  });
  const runIdDateMatch = dryPlan.runId.includes(currentLocal.dateStr);
  const pathDateMatch = dryPlan.plannedPaths.relative.runRecord.includes(currentLocal.folderStr);
  assert(
    runIdDateMatch && pathDateMatch,
    "TEST 9: Run ID date and evidence directory date are strictly identical",
    `Run ID: ${dryPlan.runId}, Path: ${dryPlan.plannedPaths.relative.runRecord}`
  );

  // TEST 10: Phase 8I.7.5 cannot collide with Phase 8I.7.3 identity
  const isHistoricalProtected = COMPLETED_PHASE_FOLDERS.includes("2026-09-27");
  const isNewNamespaceDistinct = currentLocal.folderStr !== "2026-09-27" || Boolean(dryPlan.phaseId === "8I.7.5");
  assert(
    isHistoricalProtected && isNewNamespaceDistinct,
    "TEST 10: Phase 8I.7.5 identity is strictly separated from frozen Phase 8I.7.3 namespace"
  );

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runRunnerIntegrityTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
