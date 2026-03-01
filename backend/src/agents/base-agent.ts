import { Logger } from '@nestjs/common';
import { AgentResponse, AgentAction } from '../common/types/agent-response';
import { ExtractedContext } from '../common/types/agent-response';

const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_MAX_RETRIES = 2;

export interface AgentExecuteParams {
  queryId: string;
  userId: string;
  context: ExtractedContext;
  userContext: string; // RAG-retrieved context string for prompt enrichment
}

/**
 * BaseAgent — all agents extend this class.
 * Provides: timeout, retry logic, structured error handling, execution time tracking.
 * Never override `run()`, only override `execute()`.
 */
export abstract class BaseAgent<T> {
  protected abstract readonly agentId: string;
  protected readonly logger: Logger;
  protected readonly timeoutMs: number;
  protected readonly maxRetries: number;

  constructor(timeoutMs = DEFAULT_TIMEOUT_MS, maxRetries = DEFAULT_MAX_RETRIES) {
    this.logger = new Logger(this.constructor.name);
    this.timeoutMs = timeoutMs;
    this.maxRetries = maxRetries;
  }

  /**
   * Implement the agent's core logic here. Throw on failure.
   */
  protected abstract execute(params: AgentExecuteParams): Promise<AgentResponse<T>>;

  /**
   * Public entry point — wraps execute() with timing, retry, and error isolation.
   * A failing agent NEVER throws — it returns an error-status AgentResponse.
   */
  async run(params: AgentExecuteParams): Promise<AgentResponse<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.withTimeout(
          this.execute(params),
          this.timeoutMs,
        );
        return {
          ...result,
          executionTimeMs: Date.now() - startTime,
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(
          `Agent ${this.agentId} attempt ${attempt + 1} failed: ${lastError.message}`,
        );

        if (attempt < this.maxRetries) {
          // Exponential backoff: 500ms, 1000ms
          await this.sleep(Math.pow(2, attempt) * 500);
        }
      }
    }

    // All attempts failed — return structured error, never throw
    this.logger.error(
      `Agent ${this.agentId} failed after ${this.maxRetries + 1} attempts: ${lastError?.message}`,
    );
    return this.buildErrorResponse(
      lastError?.message ?? 'Unknown error',
      Date.now() - startTime,
    );
  }

  protected buildErrorResponse(
    errorMessage: string,
    executionTimeMs: number,
  ): AgentResponse<T> {
    return {
      agentId: this.agentId,
      status: 'error',
      executionTimeMs,
      data: null,
      error: errorMessage,
      confidence: 0,
      requiresUserConfirmation: false,
      actions: [],
    };
  }

  protected buildSkippedResponse(): AgentResponse<T> {
    return {
      agentId: this.agentId,
      status: 'skipped',
      executionTimeMs: 0,
      data: null,
      error: null,
      confidence: 1,
      requiresUserConfirmation: false,
      actions: [],
    };
  }

  protected buildSuccessResponse(
    data: T,
    options: {
      confidence?: number;
      requiresUserConfirmation?: boolean;
      actions?: AgentAction[];
    } = {},
  ): Omit<AgentResponse<T>, 'executionTimeMs'> {
    return {
      agentId: this.agentId,
      status: 'success',
      data,
      error: null,
      confidence: options.confidence ?? 0.85,
      requiresUserConfirmation: options.requiresUserConfirmation ?? false,
      actions: options.actions ?? [],
    };
  }

  private async withTimeout<R>(promise: Promise<R>, ms: number): Promise<R> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Agent ${this.agentId} timed out after ${ms}ms`)), ms),
    );
    return Promise.race([promise, timeout]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
