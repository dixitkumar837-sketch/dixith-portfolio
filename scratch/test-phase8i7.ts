import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {
  CANONICAL_AI_SEARCH_SYSTEMS,
  ExperimentRunRecord,
} from "../data/research-protocol-types";
import { validateRunRecord } from "../lib/research/capture-harness";

function runVerification() {
  console.log("=== PHASE 8I.7 PILOT EXECUTION VERIFICATION ===");
  const baseDir = path.join(process.cwd(), "evidence", "exp-001");

  // 1. Check pilot config
  const pilotConfigPath = path.join(baseDir, "registry", "pilot-001.json");
  if (!fs.existsSync(pilotConfigPath)) {
    throw new Error("pilot-001.json not found");
  }
  const pilotConfig = JSON.parse(fs.readFileSync(pilotConfigPath, "utf-8"));
  console.log(`[PASS] pilot-001.json exists. Status: ${pilotConfig.status}, Planned runs: ${pilotConfig.plannedRuns}`);
  if (pilotConfig.queryIds.length !== 8) {
    throw new Error(`Expected 8 query IDs, found ${pilotConfig.queryIds.length}`);
  }
  if (pilotConfig.systems.length !== 6) {
    throw new Error(`Expected 6 systems, found ${pilotConfig.systems.length}`);
  }

  // 2. Check summary metrics
  const summaryPath = path.join(baseDir, "metrics", "pilot-001-summary.json");
  if (!fs.existsSync(summaryPath)) {
    throw new Error("pilot-001-summary.json not found");
  }
  const summary = JSON.parse(fs.readFileSync(summaryPath, "utf-8"));
  console.log(`[PASS] pilot-001-summary.json exists. Attempted: ${summary.actualRunsAttempted}, Run records: ${summary.runRecordsCreated}`);
  if (summary.plannedRuns !== 48 || summary.actualRunsAttempted !== 48 || summary.runRecordsCreated !== 48) {
    throw new Error(`Summary counts mismatch: planned=${summary.plannedRuns}, attempted=${summary.actualRunsAttempted}`);
  }

  // 3. Check runs directory
  const runsDir = path.join(baseDir, "runs");
  const subdirs = fs.readdirSync(runsDir).filter((d) => d === "2026-09-24");
  let totalRunFiles = 0;
  const foundSystems = new Set<string>();
  const forbiddenSystems = ["You.com", "SearchGPT", "Phind", "Genspark"];

  for (const dateDir of subdirs) {
    const fullDateDir = path.join(runsDir, dateDir);
    if (!fs.statSync(fullDateDir).isDirectory()) continue;
    const files = fs.readdirSync(fullDateDir).filter((f) => f.endsWith(".json"));
    totalRunFiles += files.length;

    for (const f of files) {
      const runPath = path.join(fullDateDir, f);
      const content = fs.readFileSync(runPath, "utf-8");
      
      // Check for sensitive leakage
      const lower = content.toLowerCase();
      if (lower.includes("password") || lower.includes("authorization: bearer") || lower.includes("secret_key")) {
        throw new Error(`Potential sensitive credential leak in ${f}`);
      }

      const runRecord: ExperimentRunRecord = JSON.parse(content);
      const validation = validateRunRecord(runRecord);
      if (!validation.isValid) {
        throw new Error(`Validation failed for ${f}: ${validation.errors.join(", ")}`);
      }

      foundSystems.add(runRecord.system);

      // Check forbidden systems
      for (const forbidden of forbiddenSystems) {
        if (runRecord.system.includes(forbidden)) {
          throw new Error(`Forbidden system detected: ${forbidden} in ${f}`);
        }
      }

      // Check raw evidence references
      if (!runRecord.evidence || !runRecord.evidence.rawTextPath || !runRecord.evidence.domSnapshotPath || !runRecord.evidence.screenshotPath) {
        throw new Error(`Evidence reference paths missing for ${f}`);
      }
      const rawTxtPath = path.join(baseDir, runRecord.evidence.rawTextPath);
      const rawHtmlPath = path.join(baseDir, runRecord.evidence.domSnapshotPath);
      const rawPngPath = path.join(baseDir, runRecord.evidence.screenshotPath);

      if (!fs.existsSync(rawTxtPath)) throw new Error(`Raw txt missing: ${rawTxtPath}`);
      if (!fs.existsSync(rawHtmlPath)) throw new Error(`Raw html missing: ${rawHtmlPath}`);
      if (!fs.existsSync(rawPngPath)) throw new Error(`Raw png missing: ${rawPngPath}`);

      // Verify SHA256 of raw text file
      const rawTxtBytes = fs.readFileSync(rawTxtPath);
      const expectedHash = crypto.createHash("sha256").update(rawTxtBytes).digest("hex");
      if (expectedHash !== runRecord.evidence.sha256Hash) {
        throw new Error(`SHA256 mismatch for ${f}: expected ${expectedHash}, got ${runRecord.evidence.sha256Hash}`);
      }
    }
  }

  console.log(`[PASS] Verified ${totalRunFiles} run records on disk.`);
  if (totalRunFiles !== 48) {
    throw new Error(`Expected 48 run files, got ${totalRunFiles}`);
  }

  // 4. Verify canonical systems
  for (const sys of CANONICAL_AI_SEARCH_SYSTEMS) {
    if (!foundSystems.has(sys)) {
      throw new Error(`Canonical system missing from pilot runs: ${sys}`);
    }
  }
  console.log(`[PASS] All 6 canonical systems represented: ${Array.from(foundSystems).join(", ")}`);

  console.log("\nALL PILOT 8I.7 VERIFICATION CHECKS PASSED PERFECTLY!\n");
}

runVerification();
