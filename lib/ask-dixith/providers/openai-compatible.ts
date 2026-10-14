/**
 * DIXITH Phase 8M — OpenAI-Compatible Answer Generation Provider
 *
 * Implements AnswerGenerationProvider using native fetch.
 * Server-side ONLY. Never leaks credentials, authorization headers,
 * or raw error payloads to client components.
 */

import {
  AnswerGenerationProvider,
  AnswerGenerationRequest,
  AnswerGenerationResponse,
  AskDixithProviderErrorType,
} from "@/data/ask-dixith-types";
import {
  GROUNDING_SYSTEM_INSTRUCTIONS,
  buildProviderUserMessage,
} from "../grounding";

export interface OpenAiCompatibleProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

export class OpenAiCompatibleProvider implements AnswerGenerationProvider {
  readonly name = "openai-compatible";

  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config?: OpenAiCompatibleProviderConfig) {
    this.apiKey = config?.apiKey || process.env.ASK_DIXITH_PROVIDER_API_KEY;
    this.baseUrl = (
      config?.baseUrl ||
      process.env.ASK_DIXITH_PROVIDER_BASE_URL ||
      "https://api.openai.com/v1"
    ).replace(/\/$/, "");
    this.model = config?.model || process.env.ASK_DIXITH_MODEL || "gpt-4o-mini";
    this.timeoutMs = config?.timeoutMs || 25000;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateAnswer(
    request: AnswerGenerationRequest
  ): Promise<AnswerGenerationResponse> {
    if (!this.apiKey) {
      const err = new Error("Provider API key is not configured.");
      (err as any).code = "PROVIDER_NOT_CONFIGURED" as AskDixithProviderErrorType;
      throw err;
    }

    const systemPrompt = request.systemInstructions || GROUNDING_SYSTEM_INSTRUCTIONS;
    const userMessage = buildProviderUserMessage(request.query, request.groundedContext);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    const startTime = Date.now();

    try {
      const endpoint = `${this.baseUrl}/chat/completions`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
          max_tokens: 1000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (response.status === 429) {
        const err = new Error("Provider rate limit reached.");
        (err as any).code = "PROVIDER_RATE_LIMITED" as AskDixithProviderErrorType;
        throw err;
      }

      if (!response.ok) {
        const err = new Error(`Provider returned error status: ${response.status}`);
        (err as any).code = "PROVIDER_UNAVAILABLE" as AskDixithProviderErrorType;
        throw err;
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent || typeof rawContent !== "string") {
        const err = new Error("Malformed or empty response from provider.");
        (err as any).code = "PROVIDER_INVALID_RESPONSE" as AskDixithProviderErrorType;
        throw err;
      }

      return {
        answer: rawContent,
        answerStatus: "ANSWERED",
        citedEntityIds: [],
        providerName: this.name,
        modelVersion: this.model,
        durationMs,
        providerMetadata: {
          finishReason: data?.choices?.[0]?.finish_reason || "stop",
          usagePromptTokens: data?.usage?.prompt_tokens,
          usageCompletionTokens: data?.usage?.completion_tokens,
        },
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      const durationMs = Date.now() - startTime;

      if (error?.name === "AbortError" || controller.signal.aborted) {
        const err = new Error("Provider request timed out.");
        (err as any).code = "PROVIDER_TIMEOUT" as AskDixithProviderErrorType;
        (err as any).durationMs = durationMs;
        throw err;
      }

      if (error?.code) {
        throw error;
      }

      const err = new Error("Provider is unavailable.");
      (err as any).code = "PROVIDER_UNAVAILABLE" as AskDixithProviderErrorType;
      (err as any).durationMs = durationMs;
      throw err;
    }
  }
}
