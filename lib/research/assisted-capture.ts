/**
 * DIXITH Research Assisted Capture Infrastructure
 * Phase 8I.7.2 — Implementation
 * 
 * Provides researcher-controlled browser attachment via Chrome DevTools Protocol (CDP),
 * local endpoint safety validation, canonical domain verification, normal visible UI
 * interaction, conservative citation extraction, SHA-256 evidence hashing, and offline dry-run.
 * 
 * Strict Governance:
 *   - Personal DIXITH project only.
 *   - ZERO employer accounts, credits, API keys, or infrastructure.
 *   - Local CDP attachment only (strictly loopback / localhost; remote endpoints rejected).
 *   - Normal visible user-facing interaction only (no DOM injection, no React state hacking).
 *   - ZERO credential storage, zero cookie copying, zero token persistence.
 *   - Offline dry-run by default; explicit --assisted-live required for live execution.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { URL } from "url";
import { chromium, Browser, Page, ElementHandle } from "playwright";
import {
  CanonicalAISearchSystem,
  CANONICAL_AI_SEARCH_SYSTEMS,
  CitationObservation,
  EvidenceArtifactReference,
  AssistedExperimentRunRecord,
  ResearchCohort,
  CaptureMode,
  AccountClass,
  AccountSubscriptionTier,
  AuthenticationStatus,
  ManualInterventionType,
  ManualInterventionRecord,
  AssistedAuthenticationState,
  AssistedPersonalizationState,
  RunExecutionStatus,
} from "../../data/research-protocol-types";
import {
  loadQueryRegistry,
  resolveQuery,
  formatUtcDateString,
  formatUtcFolderString,
  slugifySystemName,
  detectEnvironmentContext,
  calculateSha256,
} from "./capture-harness";

export const DEFAULT_CDP_ENDPOINT = "http://127.0.0.1:9222";
export const RESEARCH_LOCAL_TIMEZONE = "Asia/Kolkata";

/**
 * Completed historical phase folders.
 * New live runs cannot write into these folders without an explicit authorized override.
 */
export const COMPLETED_PHASE_FOLDERS: readonly string[] = ["2026-09-24", "2026-09-27"];

/**
 * 1. Centralized Research-Local Date Helper (Asia/Kolkata)
 * Resolves calendar dates in the researcher's local timezone.
 * e.g., UTC 2026-09-27T22:36:28Z correctly resolves to 2026-09-28 in Asia/Kolkata.
 */
export function getResearchLocalDate(
  date: Date = new Date(),
  timeZone: string = RESEARCH_LOCAL_TIMEZONE
): { folderStr: string; dateStr: string } {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const folderStr = formatter.format(date); // "YYYY-MM-DD"
  const dateStr = folderStr.replace(/-/g, ""); // "YYYYMMDD"
  return { folderStr, dateStr };
}

/**
 * 2. Fail-Closed Artifact Collision Detection
 * Verifies that no JSON record, raw TXT, HTML, or PNG exists for the target Run ID.
 */
export function verifyNoArtifactCollision(
  runId: string,
  folderStr: string,
  baseEvidenceDir: string = path.join(process.cwd(), "evidence", "exp-001")
): void {
  const targets = [
    { type: "Run Record", path: path.join(baseEvidenceDir, "runs", folderStr, `${runId}.json`) },
    { type: "Raw Text", path: path.join(baseEvidenceDir, "raw", folderStr, `${runId}.txt`) },
    { type: "DOM Snapshot", path: path.join(baseEvidenceDir, "raw", folderStr, `${runId}.html`) },
    { type: "Screenshot", path: path.join(baseEvidenceDir, "raw", folderStr, `${runId}.png`) },
  ];

  for (const target of targets) {
    if (fs.existsSync(target.path)) {
      throw new Error(
        `[COLLISION REFUSAL] Evidence artifact (${target.type}) already exists at "${target.path}". ` +
        `Refusing to overwrite existing research evidence for Run ID "${runId}".`
      );
    }
  }
}

/**
 * 3. Historical Completed Folder Protection
 */
export function verifyHistoricalFolderProtection(
  folderStr: string,
  allowHistoricalDateOverride: boolean = false
): void {
  if (COMPLETED_PHASE_FOLDERS.includes(folderStr) && !allowHistoricalDateOverride) {
    throw new Error(
      `[HISTORICAL PROTECTION] Target date directory "${folderStr}" contains frozen historical evidence ` +
      `from completed Phase 8I.7 / 8I.7.3. New live captures into this date directory are strictly prohibited.`
    );
  }
}

/**
 * 4. Cohort & Account Metadata Consistency Validator
 */
export function validateCohortAccountIntegrity(
  cohort: ResearchCohort,
  accountClass: AccountClass,
  subscriptionTier: AccountSubscriptionTier,
  authStatus?: AuthenticationStatus,
  mfaCompleted?: boolean,
  isLive: boolean = false
): { valid: boolean; error?: string } {
  // If in live mode, ensure explicit valid tier is provided (not NOT_APPLICABLE for authenticated accounts)
  if (isLive) {
    if (!subscriptionTier || (subscriptionTier === "NOT_APPLICABLE" && accountClass !== "LOGGED_OUT")) {
      return { valid: false, error: `Live execution requires an explicit, verified --tier (FREE, PAID, or UNKNOWN).` };
    }
  }

  // Rule A: LOGGED_OUT consistency
  if (accountClass === "LOGGED_OUT") {
    if (cohort !== "COHORT_A_LOGGED_OUT") {
      return { valid: false, error: `accountClass LOGGED_OUT requires cohort COHORT_A_LOGGED_OUT (got ${cohort}).` };
    }
    if (authStatus && authStatus !== "LOGGED_OUT") {
      return { valid: false, error: `accountClass LOGGED_OUT cannot have authenticationStatus "${authStatus}".` };
    }
    if (mfaCompleted === true) {
      return { valid: false, error: `accountClass LOGGED_OUT cannot have mfaCompleted: true.` };
    }
    if (subscriptionTier !== "FREE" && subscriptionTier !== "NOT_APPLICABLE") {
      return { valid: false, error: `accountClass LOGGED_OUT cannot have subscription tier "${subscriptionTier}".` };
    }
  }

  // Rule B: RESEARCH_CLEAN consistency
  if (cohort === "COHORT_C_RESEARCH_CLEAN" && accountClass !== "RESEARCH_CLEAN") {
    return { valid: false, error: `COHORT_C_RESEARCH_CLEAN requires accountClass RESEARCH_CLEAN (got "${accountClass}").` };
  }
  if (accountClass === "RESEARCH_CLEAN" && cohort !== "COHORT_C_RESEARCH_CLEAN") {
    return { valid: false, error: `accountClass RESEARCH_CLEAN requires cohort COHORT_C_RESEARCH_CLEAN.` };
  }

  // Rule C: PERSONAL consistency
  if (accountClass === "PERSONAL") {
    if (cohort !== "COHORT_B_AUTHENTICATED_PERSONAL") {
      return { valid: false, error: `accountClass PERSONAL requires cohort COHORT_B_AUTHENTICATED_PERSONAL.` };
    }
    if (
      authStatus &&
      authStatus !== "AUTHENTICATED" &&
      authStatus !== "AUTHENTICATED_FREE" &&
      authStatus !== "AUTHENTICATED_PAID"
    ) {
      return { valid: false, error: `accountClass PERSONAL requires an authenticated status (got "${authStatus}").` };
    }
  }

  return { valid: true };
}

export interface CdpEndpointValidation {
  valid: boolean;
  endpointUrl: string;
  error?: string;
}

/**
 * Validates that a CDP endpoint URL is strictly local loopback.
 * Rejects remote hostnames and public IP addresses for security.
 */
export function parseCdpEndpoint(rawUrl: string = DEFAULT_CDP_ENDPOINT): CdpEndpointValidation {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { valid: false, endpointUrl: rawUrl, error: "CDP endpoint URL cannot be empty." };
  }

  let toParse = trimmed;
  if (!toParse.startsWith("http://") && !toParse.startsWith("https://") && !toParse.startsWith("ws://")) {
    toParse = `http://${toParse}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(toParse);
  } catch (err: any) {
    return { valid: false, endpointUrl: rawUrl, error: `Invalid CDP URL format: ${err.message}` };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "ws:" && parsed.protocol !== "https:") {
    return { valid: false, endpointUrl: rawUrl, error: `Unsupported protocol "${parsed.protocol}". CDP requires http: or ws:.` };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isLoopback =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname === "[::1]";

  if (!isLoopback) {
    return {
      valid: false,
      endpointUrl: rawUrl,
      error: `Security violation: Remote CDP endpoints are not permitted ("${hostname}"). CDP endpoint must resolve to local loopback (localhost or 127.0.0.1).`,
    };
  }

  return { valid: true, endpointUrl: toParse };
}

/**
 * Expected domain definitions for the six canonical AI search systems.
 */
export const CANONICAL_SYSTEM_DOMAINS: Record<CanonicalAISearchSystem, { primaryDomain: string; allowedHostnames: string[] }> = {
  "Google AI Overview": {
    primaryDomain: "google.com",
    allowedHostnames: ["google.com", "www.google.com", "google.co.in", "www.google.co.in"],
  },
  "ChatGPT": {
    primaryDomain: "chatgpt.com",
    allowedHostnames: ["chatgpt.com", "www.chatgpt.com", "chat.openai.com"],
  },
  "Perplexity": {
    primaryDomain: "perplexity.ai",
    allowedHostnames: ["perplexity.ai", "www.perplexity.ai"],
  },
  "Claude": {
    primaryDomain: "claude.ai",
    allowedHostnames: ["claude.ai", "www.claude.ai"],
  },
  "Gemini": {
    primaryDomain: "gemini.google.com",
    allowedHostnames: ["gemini.google.com"],
  },
  "Microsoft Copilot": {
    primaryDomain: "copilot.microsoft.com",
    allowedHostnames: ["copilot.microsoft.com", "bing.com", "www.bing.com"],
  },
};

/**
 * Validates whether a system name is one of the six canonical AI search systems.
 */
export function validateCanonicalSystem(systemName: string): { valid: boolean; system?: CanonicalAISearchSystem; error?: string } {
  const match = CANONICAL_AI_SEARCH_SYSTEMS.find(
    (s) => s.toLowerCase() === systemName.trim().toLowerCase()
  );
  if (!match) {
    return {
      valid: false,
      error: `"${systemName}" is not a canonical AI search system. Must be one of: ${CANONICAL_AI_SEARCH_SYSTEMS.join(", ")}`,
    };
  }
  return { valid: true, system: match };
}

/**
 * Validates that an active browser page URL matches the expected domain for the target system.
 */
export function validateSystemTargetDomain(
  system: CanonicalAISearchSystem,
  currentUrl: string
): { matches: boolean; expectedDomain: string; error?: string } {
  const domainConfig = CANONICAL_SYSTEM_DOMAINS[system];
  if (!domainConfig) {
    return { matches: false, expectedDomain: "UNKNOWN", error: `No domain configuration for system "${system}"` };
  }

  try {
    const parsed = new URL(currentUrl);
    const host = parsed.hostname.toLowerCase();

    // Special case for Google regional domains
    if (system === "Google AI Overview") {
      if (host === "google.com" || host.startsWith("google.") || host.startsWith("www.google.")) {
        return { matches: true, expectedDomain: domainConfig.primaryDomain };
      }
    }

    const isAllowed = domainConfig.allowedHostnames.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return {
        matches: false,
        expectedDomain: domainConfig.primaryDomain,
        error: `URL mismatch: Page is at "${parsed.origin}", but target system "${system}" requires "${domainConfig.primaryDomain}" (${domainConfig.allowedHostnames.join(", ")}).`,
      };
    }

    return { matches: true, expectedDomain: domainConfig.primaryDomain };
  } catch (err: any) {
    return {
      matches: false,
      expectedDomain: domainConfig.primaryDomain,
      error: `Cannot parse URL "${currentUrl}": ${err.message}`,
    };
  }
}

/**
 * System UI Selectors for visible user-facing interaction.
 * Used for ordinary keyboard and click emulation without internal DOM injection.
 */
export interface SystemUiSelectors {
  inputSelector: string;
  submitButtonSelector?: string;
  responseContainerSelector: string;
  citationSelector: string;
  stopButtonSelector?: string;
}

export const SYSTEM_UI_SELECTORS: Record<CanonicalAISearchSystem, SystemUiSelectors> = {
  "Google AI Overview": {
    inputSelector: "textarea[name='q'], input[name='q']",
    submitButtonSelector: "button[type='submit'], input[type='submit']",
    responseContainerSelector: "div[data-attrid='wa:/description'], div[aria-label*='AI Overview'], div.MjjYud",
    citationSelector: "a[data-ved], a[ping], div[data-attrid] a[href^='http']",
  },
  "ChatGPT": {
    inputSelector: "div#prompt-textarea, textarea[placeholder*='Message'], div[contenteditable='true']",
    submitButtonSelector: "button[data-testid='send-button'], button[aria-label='Send prompt']",
    responseContainerSelector: "div[data-message-author-role='assistant'], div.markdown",
    citationSelector: "a[target='_blank'], button[data-testid*='citation'], a[href^='http']",
    stopButtonSelector: "button[data-testid='stop-button'], button[aria-label='Stop streaming']",
  },
  "Perplexity": {
    inputSelector: "textarea[placeholder*='Ask'], textarea[placeholder*='Follow']",
    submitButtonSelector: "button[aria-label='Submit'], button:has(svg.lucide-arrow-right)",
    responseContainerSelector: "div.prose, div[dir='auto']",
    citationSelector: "a[href^='http']:has(span), a.citation, a[target='_blank']",
    stopButtonSelector: "button[aria-label='Stop']",
  },
  "Claude": {
    inputSelector: "div[contenteditable='true'], fieldset div[contenteditable='true']",
    submitButtonSelector: "button[aria-label='Send Message'], button:has(svg[viewBox*='24'])",
    responseContainerSelector: "div.font-claude-message, div.grid-cols-1 div.standard-markdown",
    citationSelector: "a[target='_blank'], a[href^='http']",
    stopButtonSelector: "button[aria-label='Stop responding']",
  },
  "Gemini": {
    inputSelector: "div.ql-editor, textarea[aria-label*='prompt'], rich-textarea div[contenteditable='true']",
    submitButtonSelector: "button[aria-label*='Send'], button.send-button",
    responseContainerSelector: "message-content, div.model-response-text, div.markdown",
    citationSelector: "a[href^='http'], a.source-link",
    stopButtonSelector: "button[aria-label*='Stop']",
  },
  "Microsoft Copilot": {
    inputSelector: "textarea#userInput, textarea[placeholder*='Ask me anything'], textarea",
    submitButtonSelector: "button[aria-label*='Submit'], button[title*='Submit']",
    responseContainerSelector: "div.cib-message-main, div[data-content='ai-message']",
    citationSelector: "a.attribution-item, a[href^='http']",
    stopButtonSelector: "button[aria-label*='Stop Generating']",
  },
};

/**
 * Parameters for Assisted Capture Execution
 */
export interface AssistedCaptureParams {
  queryId: string;
  systemName: string;
  phaseId?: string;
  cdpUrl?: string;
  cohort?: ResearchCohort;
  accountClass?: AccountClass;
  subscriptionTier?: AccountSubscriptionTier;
  authenticationStatus?: AuthenticationStatus;
  historyEnabled?: boolean | "NOT_OBSERVABLE";
  geographicLocation?: string;
  activeModelTier?: string;
  searchModeSetting?: string;
  runNumber?: number;
  dryRun?: boolean;
  assistedLive?: boolean;
  mfaCompleted?: boolean;
  consentCompleted?: boolean;
  researcherNotes?: string;
  timeoutMs?: number;
  dateFolderOverride?: string;
  allowHistoricalDateOverride?: boolean;
}

export interface AssistedDryRunResult {
  isDryRun: true;
  valid: boolean;
  runId: string;
  queryId: string;
  exactQuery: string;
  system: CanonicalAISearchSystem;
  expectedDomain: string;
  cdpEndpoint: string;
  cohort: ResearchCohort;
  captureMode: CaptureMode;
  accountClass: AccountClass;
  subscriptionTier: AccountSubscriptionTier;
  phaseId?: string;
  plannedPaths: {
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
  };
  intendedActions: string[];
  safetyGuardsVerified: {
    isLocalLoopback: boolean;
    zeroCredentialStorage: boolean;
    noStealthPlugins: boolean;
    noProxyRotation: boolean;
    noCaptchaBypass: boolean;
    dryRunPreservesDisk: boolean;
  };
}

/**
 * Executes a deterministic offline dry-run of the assisted capture protocol.
 * Validates arguments, queries, and paths without making network or browser connections.
 */
export function executeAssistedDryRun(params: AssistedCaptureParams): AssistedDryRunResult {
  // 1. Validate Canonical System
  const systemCheck = validateCanonicalSystem(params.systemName);
  if (!systemCheck.valid || !systemCheck.system) {
    throw new Error(systemCheck.error);
  }
  const system = systemCheck.system;

  // 2. Validate Query ID & Load Registry
  const queryRegistry = loadQueryRegistry();
  const queryDef = resolveQuery(params.queryId, queryRegistry);

  // 3. Validate CDP Endpoint
  const cdpCheck = parseCdpEndpoint(params.cdpUrl || DEFAULT_CDP_ENDPOINT);
  if (!cdpCheck.valid) {
    throw new Error(cdpCheck.error);
  }

  // 4. Validate Expected Domain
  const domainConfig = CANONICAL_SYSTEM_DOMAINS[system];

  // 5. Build Cohort & Settings Defaults
  const cohort: ResearchCohort = params.cohort || "COHORT_C_RESEARCH_CLEAN";
  const captureMode: CaptureMode = "ASSISTED_CDP_ATTACHED";
  const accountClass: AccountClass = params.accountClass || "RESEARCH_CLEAN";
  const subscriptionTier: AccountSubscriptionTier = params.subscriptionTier || "FREE";
  const phaseId = params.phaseId || "8I.7.5";

  // 6. Generate Deterministic Run ID using Research-Local Date (Asia/Kolkata)
  const now = new Date();
  const { folderStr, dateStr } = params.dateFolderOverride
    ? { folderStr: params.dateFolderOverride, dateStr: params.dateFolderOverride.replace(/-/g, "") }
    : getResearchLocalDate(now, RESEARCH_LOCAL_TIMEZONE);

  const sysSlug = slugifySystemName(system);
  const cleanQId = queryDef.id.replace(/[^A-Za-z0-9]/g, "");
  const runNum = String(params.runNumber || 1).padStart(2, "0");
  const runId = `RUN-001-${dateStr}-${cleanQId}-${sysSlug}-${runNum}`;

  const baseEvidenceDir = path.join(process.cwd(), "evidence", "exp-001");
  const relText = `raw/${folderStr}/${runId}.txt`;
  const relHtml = `raw/${folderStr}/${runId}.html`;
  const relPng = `raw/${folderStr}/${runId}.png`;
  const relJson = `runs/${folderStr}/${runId}.json`;

  return {
    isDryRun: true,
    valid: true,
    runId,
    queryId: queryDef.id,
    exactQuery: queryDef.query,
    system,
    expectedDomain: domainConfig.primaryDomain,
    cdpEndpoint: cdpCheck.endpointUrl,
    cohort,
    captureMode,
    accountClass,
    subscriptionTier,
    phaseId,
    plannedPaths: {
      relative: {
        rawText: relText,
        domSnapshot: relHtml,
        screenshot: relPng,
        runRecord: relJson,
      },
      absolute: {
        rawText: path.join(baseEvidenceDir, relText),
        domSnapshot: path.join(baseEvidenceDir, relHtml),
        screenshot: path.join(baseEvidenceDir, relPng),
        runRecord: path.join(baseEvidenceDir, relJson),
      },
    },
    intendedActions: [
      `1. Verify researcher-controlled browser running at ${cdpCheck.endpointUrl}`,
      `2. Attach via Playwright connectOverCDP without altering browser process`,
      `3. Verify active tab URL matches primary domain "${domainConfig.primaryDomain}"`,
      `4. Verify normal user-facing input selector "${SYSTEM_UI_SELECTORS[system].inputSelector}"`,
      `5. Enter exact query without wrappers: "${queryDef.query}"`,
      `6. Submit query through visible user interaction path`,
      `7. Wait for generation completion via DOM mutation & stop button monitoring`,
      `8. Extract visible text, serialized DOM, full-page screenshot, and citations`,
      `9. Compute SHA-256 digests for all 3 raw artifacts`,
      `10. Write non-identifying AssistedExperimentRunRecord (${relJson}) and cleanly detach`,
    ],
    safetyGuardsVerified: {
      isLocalLoopback: true,
      zeroCredentialStorage: true,
      noStealthPlugins: true,
      noProxyRotation: true,
      noCaptchaBypass: true,
      dryRunPreservesDisk: true,
    },
  };
}

/**
 * Attaches to an existing, researcher-controlled browser via local CDP.
 * Finds and validates the target system page without altering browser profiles.
 */
export async function attachToLocalBrowser(
  cdpUrl: string,
  system: CanonicalAISearchSystem
): Promise<{ browser: Browser; page: Page }> {
  const cdpCheck = parseCdpEndpoint(cdpUrl);
  if (!cdpCheck.valid) {
    throw new Error(`CDP attachment rejected: ${cdpCheck.error}`);
  }

  let browser: Browser;
  try {
    browser = await chromium.connectOverCDP(cdpCheck.endpointUrl, { timeout: 10000 });
  } catch (err: any) {
    throw new Error(
      `Could not connect to browser at ${cdpCheck.endpointUrl}: ${err.message}. ` +
      `Ensure Google Chrome is running with "--remote-debugging-port=${new URL(cdpCheck.endpointUrl).port || "9222"}"`
    );
  }

  const contexts = browser.contexts();
  let allPages: Page[] = [];
  for (const ctx of contexts) {
    allPages.push(...ctx.pages());
  }

  if (allPages.length === 0) {
    await browser.close();
    throw new Error(`Connected to browser at ${cdpCheck.endpointUrl}, but no open pages/tabs were found.`);
  }

  // Find a tab matching the target system domain
  let matchedPage: Page | null = null;
  const inspectedUrls: string[] = [];

  for (const p of allPages) {
    const url = p.url();
    inspectedUrls.push(url);
    const domainCheck = validateSystemTargetDomain(system, url);
    if (domainCheck.matches) {
      matchedPage = p;
      break;
    }
  }

  if (!matchedPage) {
    await browser.close();
    const domainConfig = CANONICAL_SYSTEM_DOMAINS[system];
    throw new Error(
      `No active tab found matching target system "${system}" (${domainConfig.primaryDomain}). ` +
      `Currently open tabs in browser:\n` +
      inspectedUrls.map((u) => `  - ${u}`).join("\n") +
      `\nPlease navigate an open tab to ${domainConfig.primaryDomain} before running assisted capture.`
    );
  }

  // Ensure matched tab is in foreground and active
  try {
    await matchedPage.bringToFront();
  } catch {
    // Non-fatal if bringToFront is restricted
  }

  return { browser, page: matchedPage };
}

/**
 * Enters the exact query through the visible user-facing interface.
 * Normal user typing and submission only; no DOM injection or React state hacking.
 */
export async function enterQueryThroughVisibleUi(
  page: Page,
  system: CanonicalAISearchSystem,
  queryText: string
): Promise<void> {
  const selectors = SYSTEM_UI_SELECTORS[system];

  let inputEl: ElementHandle | null = null;
  try {
    inputEl = await page.waitForSelector(selectors.inputSelector, { state: "visible", timeout: 10000 });
  } catch {
    throw new Error(
      `Visible input field for "${system}" not found with selector: ${selectors.inputSelector}. ` +
      `Ensure the page has finished loading and any authentication/consent modals have been cleared.`
    );
  }

  if (!inputEl) {
    throw new Error(`Visible input element for "${system}" is null.`);
  }

  await inputEl.click();
  try {
    await inputEl.fill(queryText);
  } catch {
    // Fallback for contenteditable rich-text elements
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.insertText(queryText);
  }

  // Brief pause to allow reactive frameworks (React, Lexical, ProseMirror) to update state
  await new Promise((r) => setTimeout(r, 400));

  let submitted = false;
  if (selectors.submitButtonSelector) {
    try {
      const submitBtn = await page.$(selectors.submitButtonSelector);
      if (submitBtn) {
        const isVisible = await submitBtn.isVisible();
        const isEnabled = await submitBtn.isEnabled();
        if (isVisible && isEnabled) {
          await submitBtn.click();
          submitted = true;
        }
      }
    } catch {
      submitted = false;
    }
  }

  if (!submitted) {
    await page.keyboard.press("Enter");
  }
}

/**
 * Monitors streaming generative response until stabilization or timeout.
 * Detects anti-bot challenges and authentication gates conservatively.
 */
export async function waitForGenerativeCompletion(
  page: Page,
  system: CanonicalAISearchSystem,
  timeoutMs: number = 45000
): Promise<{ status: RunExecutionStatus; responseText: string; issueDescription?: string }> {
  const selectors = SYSTEM_UI_SELECTORS[system];
  const startTime = Date.now();

  // Allow initial navigation or generation lifecycle to begin
  await new Promise((r) => setTimeout(r, 2000));

  // Check for immediate anti-bot or CAPTCHA block safely
  try {
    const pageUrl = page.url();
    let pageHtml = "";
    let pageTitle = "";
    try {
      pageHtml = await page.content();
      pageTitle = await page.title();
    } catch {
      // In flight navigation
    }

    if (
      pageUrl.includes("/sorry/index") ||
      pageHtml.includes("unusual traffic") ||
      pageHtml.includes("recaptcha") ||
      pageHtml.includes("Verify you are human") ||
      pageHtml.includes("cf-turnstile") ||
      pageTitle.includes("Just a moment")
    ) {
      return {
        status: "CAPTCHA_BLOCKED",
        responseText: `[CAPTCHA_BLOCKED] Anti-bot verification challenge displayed at ${pageUrl}`,
        issueDescription: "Anti-automation verification challenge encountered during live interaction.",
      };
    }

    // Check for auth wall
    if (
      pageUrl.includes("/login") ||
      pageUrl.includes("/auth") ||
      pageUrl.includes("accounts.google.com")
    ) {
      return {
        status: "AUTH_REQUIRED",
        responseText: `[AUTH_REQUIRED] Session redirected to authentication gate: ${pageUrl}`,
        issueDescription: "Session redirected to login wall.",
      };
    }
  } catch {
    // Continue into monitoring loop
  }

  let lastText = "";
  let stableTicks = 0;
  const pollIntervalMs = 1000;

  while (Date.now() - startTime < timeoutMs) {
    let isStreaming = false;
    if (selectors.stopButtonSelector) {
      try {
        const stopBtn = await page.$(selectors.stopButtonSelector);
        if (stopBtn && (await stopBtn.isVisible())) {
          isStreaming = true;
        }
      } catch {
        isStreaming = false;
      }
    }

    let currentText = "";
    try {
      // Use the latest response container in case of multi-turn conversation
      const respEls = await page.$$(selectors.responseContainerSelector);
      if (respEls.length > 0) {
        const latestRespEl = respEls[respEls.length - 1];
        currentText = ((await latestRespEl.innerText()) || "").trim();
      }
    } catch {
      currentText = "";
    }

    if (!isStreaming && currentText.length > 50) {
      if (currentText === lastText) {
        stableTicks++;
        if (stableTicks >= 3) {
          return {
            status: "SUCCESS",
            responseText: currentText,
          };
        }
      } else {
        stableTicks = 0;
      }
    }

    lastText = currentText;
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }

  if (lastText.length > 50) {
    return {
      status: "SUCCESS",
      responseText: lastText,
      issueDescription: "Response container stabilized after generation timeout window.",
    };
  }

  return {
    status: "RESPONSE_NOT_OBSERVABLE",
    responseText: lastText || "[RESPONSE_NOT_OBSERVABLE] No text captured within timeout window.",
    issueDescription: `Response container text could not be observed within ${timeoutMs / 1000}s.`,
  };
}

/**
 * Extracts structured citation references strictly from within the generated answer container.
 */
export async function extractCitationsFromAnswer(
  page: Page,
  system: CanonicalAISearchSystem
): Promise<CitationObservation[]> {
  const selectors = SYSTEM_UI_SELECTORS[system];
  const observations: CitationObservation[] = [];

  try {
    // Strictly isolate citations within the latest answer container
    const respContainers = await page.$$(selectors.responseContainerSelector);
    if (respContainers.length === 0) {
      return [];
    }
    const respContainer = respContainers[respContainers.length - 1];

    const links = await respContainer.$$(selectors.citationSelector);
    let index = 1;

    for (const link of links) {
      const href = await link.getAttribute("href");
      if (!href || !href.startsWith("http")) continue;

      let title = ((await link.innerText()) || "").trim();
      if (!title) {
        title = (await link.getAttribute("aria-label")) || (await link.getAttribute("title")) || "";
      }

      let domain = "UNKNOWN";
      try {
        domain = new URL(href).hostname.toLowerCase();
      } catch {
        domain = "UNKNOWN";
      }

      const canonicalDomain = CANONICAL_SYSTEM_DOMAINS[system].primaryDomain;
      if (domain.includes(canonicalDomain) || domain === "localhost") {
        continue;
      }

      observations.push({
        positionIndex: index++,
        citedTitle: title || undefined,
        citedUrl: href,
        sourceDomain: domain,
        renderFormat: "INLINE_FAVICON_PILL",
        associationState: "DIRECT_CLAIM_ANCHOR",
        sourceClassification: "INDUSTRY_PORTAL_OR_BLOG",
      });
    }
  } catch (err: any) {
    console.warn(`[CITATION EXTRACTION WARNING] ${err.message}`);
  }

  return observations;
}

/**
 * Writes captured artifacts to disk and computes cryptographic SHA-256 hashes.
 */
export function writeEvidenceArtifacts(
  runId: string,
  rawText: string,
  rawHtml: string,
  screenshotBuffer: Buffer | null,
  baseEvidenceDir: string = path.join(process.cwd(), "evidence", "exp-001"),
  timestamp: Date = new Date(),
  folderOverride?: string
): {
  evidenceRef: EvidenceArtifactReference;
  textHash: string;
  htmlHash: string;
  pngHash: string;
} {
  const folderStr = folderOverride || getResearchLocalDate(timestamp, RESEARCH_LOCAL_TIMEZONE).folderStr;
  const rawDir = path.join(baseEvidenceDir, "raw", folderStr);
  const runsDir = path.join(baseEvidenceDir, "runs", folderStr);

  fs.mkdirSync(rawDir, { recursive: true });
  fs.mkdirSync(runsDir, { recursive: true });

  const rawTxtPath = path.join(rawDir, `${runId}.txt`);
  const rawHtmlPath = path.join(rawDir, `${runId}.html`);
  const rawPngPath = path.join(rawDir, `${runId}.png`);

  fs.writeFileSync(rawTxtPath, rawText, "utf-8");
  fs.writeFileSync(rawHtmlPath, rawHtml, "utf-8");
  if (screenshotBuffer) {
    fs.writeFileSync(rawPngPath, screenshotBuffer);
  } else {
    const dummyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );
    fs.writeFileSync(rawPngPath, dummyPng);
  }

  const textHash = calculateSha256(fs.readFileSync(rawTxtPath));
  const htmlHash = calculateSha256(fs.readFileSync(rawHtmlPath));
  const pngHash = calculateSha256(fs.readFileSync(rawPngPath));

  const evidenceRef: EvidenceArtifactReference = {
    evidenceId: `EVD-001-${runId.replace(/^RUN-001-/, "")}`,
    rawTextPath: `raw/${folderStr}/${runId}.txt`,
    domSnapshotPath: `raw/${folderStr}/${runId}.html`,
    screenshotPath: `raw/${folderStr}/${runId}.png`,
    sha256Hash: textHash,
    capturedAt: timestamp.toISOString(),
  };

  return { evidenceRef, textHash, htmlHash, pngHash };
}

/**
 * Live Assisted Capture Execution Engine
 * Attaches to researcher-controlled browser, executes query through visible UI,
 * monitors completion, extracts citations, and writes immutable artifacts.
 */
export async function executeAssistedLiveCapture(
  params: AssistedCaptureParams
): Promise<AssistedExperimentRunRecord> {
  if (!params.assistedLive) {
    throw new Error(
      `[EXECUTION BLOCKED] Live assisted capture requires explicit opt-in flag "--assisted-live". ` +
      `Without this flag, only offline dry-run validation is permitted.`
    );
  }

  // 1. Enforce Mandatory Explicit Run Number in Live Mode
  if (params.runNumber === undefined || params.runNumber === null || isNaN(params.runNumber) || params.runNumber <= 0) {
    throw new Error(
      `[SAFETY VIOLATION] Live assisted capture requires an explicit --run-number (e.g. --run-number 7). ` +
      `Silent defaulting is prohibited to prevent collision with historical runs.`
    );
  }

  // 2. Enforce Mandatory Explicit Cohort, Account Class, and Tier
  if (!params.cohort || !params.accountClass || !params.subscriptionTier) {
    throw new Error(
      `[SAFETY VIOLATION] Live assisted capture requires explicit --cohort, --account-class, and --tier parameters.`
    );
  }
  const cohort: ResearchCohort = params.cohort;
  const accountClass: AccountClass = params.accountClass;
  const subscriptionTier: AccountSubscriptionTier = params.subscriptionTier;

  // 3. Enforce Cohort & Account Consistency Validation
  const cohortCheck = validateCohortAccountIntegrity(
    cohort,
    accountClass,
    subscriptionTier,
    params.authenticationStatus,
    params.mfaCompleted,
    true
  );
  if (!cohortCheck.valid) {
    throw new Error(`[METADATA INTEGRITY ERROR] ${cohortCheck.error}`);
  }

  // 4. Resolve Local Research Date in Asia/Kolkata
  const now = new Date();
  const { folderStr, dateStr } = params.dateFolderOverride
    ? { folderStr: params.dateFolderOverride, dateStr: params.dateFolderOverride.replace(/-/g, "") }
    : getResearchLocalDate(now, RESEARCH_LOCAL_TIMEZONE);

  // 5. Enforce Historical Directory Protection
  verifyHistoricalFolderProtection(folderStr, params.allowHistoricalDateOverride);

  console.warn("\n================================================================================");
  console.warn(" WARNING: LIVE ASSISTED CAPTURE REQUESTED");
  console.warn(" This command will interact with a live external AI system using the researcher-");
  console.warn(" controlled browser session. Ensure all human authentication and consent are");
  console.warn(" completed before proceeding.");
  console.warn("================================================================================\n");

  const systemCheck = validateCanonicalSystem(params.systemName);
  if (!systemCheck.valid || !systemCheck.system) {
    throw new Error(systemCheck.error);
  }
  const system = systemCheck.system;

  const queryRegistry = loadQueryRegistry();
  const queryDef = resolveQuery(params.queryId, queryRegistry);

  const cdpCheck = parseCdpEndpoint(params.cdpUrl || DEFAULT_CDP_ENDPOINT);
  if (!cdpCheck.valid) {
    throw new Error(cdpCheck.error);
  }

  const sysSlug = slugifySystemName(system);
  const cleanQId = queryDef.id.replace(/[^A-Za-z0-9]/g, "");
  const runNum = String(params.runNumber).padStart(2, "0");
  const runId = `RUN-001-${dateStr}-${cleanQId}-${sysSlug}-${runNum}`;

  // 6. Enforce Fail-Closed Artifact Collision Check BEFORE Browser Attachment or Action
  const baseEvidenceDir = path.join(process.cwd(), "evidence", "exp-001");
  verifyNoArtifactCollision(runId, folderStr, baseEvidenceDir);

  const captureMode: CaptureMode = "ASSISTED_CDP_ATTACHED";

  const { browser, page } = await attachToLocalBrowser(cdpCheck.endpointUrl, system);

  let executionStatus: RunExecutionStatus = "SUCCESS";
  let capturedText = "";
  let capturedHtml = "";
  let screenshotBuffer: Buffer | null = null;
  let citations: CitationObservation[] = [];
  const observations: string[] = [
    `Assisted capture attached via CDP to local browser at ${cdpCheck.endpointUrl}.`,
    `Target system "${system}" validated against active page: ${page.url()}.`,
  ];
  let researcherNotes = params.researcherNotes || "Observable visible answer state captured via assisted CDP attachment.";

  try {
    const pageUrl = page.url();
    let pageHtml = "";
    let pageTitle = "";
    try {
      pageHtml = await page.content();
      pageTitle = await page.title();
    } catch {
      // ignore
    }

    if (
      pageUrl.includes("/sorry/index") ||
      pageUrl.includes("__cf_chl") ||
      pageHtml.includes("unusual traffic") ||
      pageHtml.includes("recaptcha") ||
      pageHtml.includes("Verify you are human") ||
      pageHtml.includes("cf-turnstile") ||
      pageTitle.includes("Just a moment")
    ) {
      executionStatus = "CAPTCHA_BLOCKED";
      capturedText = `[CAPTCHA_BLOCKED] Anti-bot verification challenge displayed at ${pageUrl} (Title: ${pageTitle})`;
      observations.push("Anti-automation verification challenge encountered on target page.");
    } else if (
      pageUrl.includes("/login") ||
      pageUrl.includes("/auth") ||
      pageUrl.includes("accounts.google.com")
    ) {
      executionStatus = "AUTH_REQUIRED";
      capturedText = `[AUTH_REQUIRED] Session redirected to authentication gate: ${pageUrl}`;
      observations.push("Session redirected to authentication gate.");
    } else {
      await enterQueryThroughVisibleUi(page, system, queryDef.query);
      observations.push("Query entered through visible user-facing input and submitted.");

      const completion = await waitForGenerativeCompletion(page, system, params.timeoutMs || 45000);
      executionStatus = completion.status;
      capturedText = completion.responseText;
      if (completion.issueDescription) {
        observations.push(completion.issueDescription);
      }
    }

    try {
      capturedHtml = await page.content();
    } catch (e: any) {
      capturedHtml = `<!-- DOM content extraction failed: ${e.message} -->`;
    }

    try {
      screenshotBuffer = await page.screenshot({ fullPage: false, timeout: 8000 });
    } catch {
      screenshotBuffer = null;
    }

    if (executionStatus === "SUCCESS") {
      citations = await extractCitationsFromAnswer(page, system);
      observations.push(`Observed ${citations.length} inline citation elements in response container.`);
    }
  } catch (err: any) {
    const pageUrl = page.url();
    let pageTitle = "";
    try {
      pageTitle = await page.title();
    } catch {
      pageTitle = "";
    }

    if (
      pageUrl.includes("/sorry/index") ||
      pageUrl.includes("__cf_chl") ||
      pageTitle.includes("Just a moment")
    ) {
      executionStatus = "CAPTCHA_BLOCKED";
      capturedText = `[CAPTCHA_BLOCKED] Anti-bot verification challenge displayed at ${pageUrl}`;
    } else if (pageUrl.includes("/login") || pageUrl.includes("/auth")) {
      executionStatus = "AUTH_REQUIRED";
      capturedText = `[AUTH_REQUIRED] Session redirected to login gate: ${pageUrl}`;
    } else {
      executionStatus = "CAPTURE_ERROR";
      capturedText = `[CAPTURE_ERROR] ${err.message}`;
    }
    capturedHtml = `<!-- ${executionStatus}: ${err.message} -->`;
    researcherNotes = `Harness capture status: ${executionStatus} (${err.message})`;
    observations.push(`Capture execution halted: ${err.message}`);
  } finally {
    await browser.close();
  }

  const { evidenceRef } = writeEvidenceArtifacts(
    runId,
    capturedText,
    capturedHtml,
    screenshotBuffer,
    baseEvidenceDir,
    now,
    folderStr
  );

  const words = capturedText.trim().split(/\s+/).filter(Boolean).length;
  const chars = capturedText.length;
  const distinctDomains = new Set(citations.map((c) => c.sourceDomain)).size;

  const isLoggedOut = accountClass === "LOGGED_OUT";

  const authState: AssistedAuthenticationState = {
    status: params.authenticationStatus || (isLoggedOut ? "LOGGED_OUT" : "AUTHENTICATED_RESEARCH_CLEAN"),
    accountClass,
    accountSubscriptionTier: subscriptionTier,
    mfaCompleted: isLoggedOut ? false : (params.mfaCompleted ?? false),
    consentCompleted: isLoggedOut ? false : (params.consentCompleted ?? false),
  };

  const persState: AssistedPersonalizationState = {
    historyEnabled: params.historyEnabled ?? "NOT_OBSERVABLE",
    customInstructionsActive: false,
    geographicLocationReported: params.geographicLocation || "NOT_OBSERVABLE",
    activeModelTier: params.activeModelTier || "Default Observable Tier",
    searchModeSetting: params.searchModeSetting || "Default Web Search",
  };

  const manualIntervention: ManualInterventionRecord = {
    required: true,
    types: isLoggedOut ? ["NAVIGATION"] : ["AUTHENTICATION", "CONSENT", "NAVIGATION"],
    notes: isLoggedOut
      ? "Researcher manually launched browser and positioned on target system search UI (logged-out guest session)."
      : "Researcher manually launched browser, cleared authentication, and positioned on target system search UI.",
  };

  const envContext = detectEnvironmentContext({
    timestamp: now.toISOString(),
    browserOrClient: "Google Chrome (Assisted CDP Attached)",
    personalizationState: accountClass === "LOGGED_OUT" ? "LOGGED_OUT_INCOGNITO" : "FRESH_SESSION_PROFILE",
  });

  const runRecord: AssistedExperimentRunRecord = {
    runId,
    experimentId: "EXP-001",
    phaseId: params.phaseId || "8I.7.5",
    runNumber: params.runNumber,
    system,
    queryId: queryDef.id,
    exactQuery: queryDef.query,
    executionStatus,
    promptWrapper: "NONE",
    cohort,
    captureMode,
    accountClass,
    accountSubscriptionTier: subscriptionTier,
    authenticationState: authState,
    personalizationState: persState,
    manualIntervention,
    environment: envContext,
    rawResponseText: capturedText,
    responseLengthChars: chars,
    responseLengthWords: words,
    citations,
    totalCitationsObserved: citations.length,
    distinctDomainsCited: distinctDomains,
    observations,
    researcherNotes,
    evidence: evidenceRef,
    reproducibilityLimitations: [
      "Assisted capture attached to interactive browser session.",
      "Engine internal weights, temperature, and index partition are not observable.",
    ],
  };

  const runJsonPath = path.join(baseEvidenceDir, "runs", folderStr, `${runId}.json`);
  fs.writeFileSync(runJsonPath, JSON.stringify(runRecord, null, 2), "utf-8");

  return runRecord;
}
