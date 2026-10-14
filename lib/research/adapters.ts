/**
 * DIXITH Research Capture System Adapters
 * Phase 8I.6 — Local Evidence Capture Infrastructure
 * 
 * Defines the adapter interface and canonical provider stubs for cross-engine
 * generative search capture without introducing brittle scraping selectors or
 * making unauthorized network connections.
 */

import { CanonicalAISearchSystem, CitationObservation } from "../../data/research-protocol-types";

export interface CaptureRequest {
  queryId: string;
  exactQuery: string;
  system: CanonicalAISearchSystem;
  runNumber?: number;
  dryRun: boolean;
  notes?: string;
}

export interface CaptureResult {
  system: CanonicalAISearchSystem;
  queryId: string;
  rawText: string;
  rawHtml?: string;
  screenshotBuffer?: Buffer;
  citations: CitationObservation[];
  observations: string[];
  reproducibilityLimitations: string[];
  isDryRun: boolean;
}

export interface CaptureAdapter {
  readonly systemName: CanonicalAISearchSystem;
  readonly isLiveAvailable: boolean;
  executeCapture(request: CaptureRequest): Promise<CaptureResult>;
}

/**
 * Base abstract adapter providing shared dry-run validation logic
 */
abstract class BaseCaptureAdapter implements CaptureAdapter {
  abstract readonly systemName: CanonicalAISearchSystem;
  readonly isLiveAvailable: boolean = false; // Intentionally disabled in Phase 8I.6

  async executeCapture(request: CaptureRequest): Promise<CaptureResult> {
    if (!request.dryRun) {
      throw new Error(
        `Live automated capture for "${this.systemName}" is disabled in Phase 8I.6. ` +
        `Only --dry-run validation is permitted.`
      );
    }

    return {
      system: this.systemName,
      queryId: request.queryId,
      rawText: `[DRY_RUN_PLACEHOLDER] Offline harness validation for query ${request.queryId} on ${this.systemName}. No external network request was executed.`,
      rawHtml: `<!-- DRY_RUN_PLACEHOLDER: ${this.systemName} / ${request.queryId} -->\n<!DOCTYPE html><html><head><title>Dry Run Fixture</title></head><body><main><p>Offline validation placeholder</p></main></body></html>`,
      citations: [],
      observations: [
        `Harness pipeline dry-run executed for system "${this.systemName}".`,
        `Zero live queries or web requests submitted.`
      ],
      reproducibilityLimitations: [
        `Dry-run execution mode: no live response or DOM captured.`,
        `Engine model parameters and index state are not observable.`
      ],
      isDryRun: true
    };
  }
}

export class GoogleAIOverviewAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "Google AI Overview";
}

export class ChatGPTAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "ChatGPT";
}

export class PerplexityAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "Perplexity";
}

export class ClaudeAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "Claude";
}

export class GeminiAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "Gemini";
}

export class MicrosoftCopilotAdapter extends BaseCaptureAdapter {
  readonly systemName: CanonicalAISearchSystem = "Microsoft Copilot";
}

const ADAPTER_REGISTRY: Record<CanonicalAISearchSystem, CaptureAdapter> = {
  "Google AI Overview": new GoogleAIOverviewAdapter(),
  "ChatGPT": new ChatGPTAdapter(),
  "Perplexity": new PerplexityAdapter(),
  "Claude": new ClaudeAdapter(),
  "Gemini": new GeminiAdapter(),
  "Microsoft Copilot": new MicrosoftCopilotAdapter(),
};

/**
 * Resolves the appropriate system adapter for a canonical search engine.
 */
export function getCaptureAdapter(system: CanonicalAISearchSystem): CaptureAdapter {
  const adapter = ADAPTER_REGISTRY[system];
  if (!adapter) {
    throw new Error(`No capture adapter registered for canonical system: "${system}"`);
  }
  return adapter;
}
