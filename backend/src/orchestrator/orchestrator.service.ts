import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Subject, Observable } from 'rxjs';
import { PrismaService } from '../common/database/prisma.service';
import { ContextExtractorService } from './context-extractor.service';
import { RagService } from '../rag/rag.service';
import { QUEUE_NAMES, JOB_NAMES, AgentJobData } from '../queue/queue.constants';
import { SseEvent, ExtractedContext, AgentResponse } from '../common/types/agent-response';

interface QueryStream {
  subject: Subject<SseEvent>;
  agentCount: number;
  completedAgents: Set<string>;
}

// Map from agentId string to BullMQ job name
const AGENT_JOB_MAP: Record<string, string> = {
  travel: JOB_NAMES.TRAVEL,
  calendar: JOB_NAMES.CALENDAR,
  music: JOB_NAMES.MUSIC,
  wardrobe: JOB_NAMES.WARDROBE,
  food: JOB_NAMES.FOOD,
  accommodation: JOB_NAMES.ACCOMMODATION,
  finance: JOB_NAMES.FINANCE,
  'meeting-prep': JOB_NAMES.MEETING_PREP,
};

// Agents that depend on travel completing first
const TRAVEL_DEPENDENT = new Set(['accommodation', 'music']);

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);
  private readonly streams = new Map<string, QueryStream>();

  constructor(
    @InjectQueue(QUEUE_NAMES.AGENTS) private readonly agentsQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly contextExtractor: ContextExtractorService,
    private readonly ragService: RagService,
  ) {}

  async submitQuery(
    userId: string,
    rawInput: string,
  ): Promise<{ queryId: string; agentsActivated: string[] }> {
    // 1. Create query record
    const query = await this.prisma.query.create({
      data: { userId, rawInput, status: 'processing' },
    });

    // 2. Extract structured context
    const context = await this.contextExtractor.extract(rawInput);
    await this.prisma.query.update({
      where: { id: query.id },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { extractedContext: JSON.parse(JSON.stringify(context)) },
    });

    // 3. Retrieve RAG context
    const userContext = await this.ragService.retrieveRelevantContext(userId, rawInput);

    // 4. Store new embedding async (don't block response)
    void this.ragService
      .storeEmbedding(userId, JSON.stringify({ input: rawInput, context }), 'trip')
      .catch((err) => this.logger.warn('Failed to store embedding:', err));

    // 5. Set up SSE stream
    const agentsToActivate = context.agentsToActivate ?? [];
    this.initStream(query.id, agentsToActivate.length);

    // 6. Enqueue jobs (respecting DAG dependencies)
    await this.enqueueAgents(query.id, userId, context, userContext, agentsToActivate);

    return { queryId: query.id, agentsActivated: agentsToActivate };
  }

  private async enqueueAgents(
    queryId: string,
    userId: string,
    context: ExtractedContext,
    userContext: string,
    agentsToActivate: string[],
  ): Promise<void> {
    const jobData: Omit<AgentJobData, 'agentId'> = {
      queryId,
      userId,
      extractedContext: context as Record<string, unknown>,
      userContext,
    };

    // Separate dependent agents from independent ones
    const independentAgents = agentsToActivate.filter((a) => !TRAVEL_DEPENDENT.has(a));
    const dependentAgents = agentsToActivate.filter((a) => TRAVEL_DEPENDENT.has(a));

    // Enqueue all independent agents immediately
    await Promise.all(
      independentAgents.map((agentId) =>
        this.agentsQueue.add(AGENT_JOB_MAP[agentId] ?? agentId, { ...jobData } as AgentJobData, {
          jobId: `${queryId}:${agentId}`,
        }),
      ),
    );

    // Enqueue dependent agents with dependency on travel job
    const travelJobId = agentsToActivate.includes('travel')
      ? `${queryId}:travel`
      : undefined;

    await Promise.all(
      dependentAgents.map((agentId) =>
        this.agentsQueue.add(
          AGENT_JOB_MAP[agentId] ?? agentId,
          { ...jobData } as AgentJobData,
          {
            jobId: `${queryId}:${agentId}`,
            ...(travelJobId ? { delay: 0 } : {}),
          },
        ),
      ),
    );

    // Emit agent_started for all
    for (const agentId of agentsToActivate) {
      this.emitEvent(queryId, {
        type: 'agent_started',
        queryId,
        agentId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Called by agent workers when they complete
   */
  async onAgentComplete(queryId: string, result: AgentResponse<unknown>): Promise<void> {
    // Persist result
    await this.prisma.agentResult.create({
      data: {
        queryId,
        agentId: result.agentId,
        status: result.status,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: result.data ? JSON.parse(JSON.stringify(result.data)) : null,
        error: result.error,
        confidence: result.confidence,
        executionTimeMs: result.executionTimeMs,
        requiresConfirmation: result.requiresUserConfirmation,
        actions: JSON.parse(JSON.stringify(result.actions)),
      },
    });

    const eventType = result.status === 'error' ? 'agent_failed' : 'agent_completed';

    this.emitEvent(queryId, {
      type: eventType,
      queryId,
      agentId: result.agentId,
      data: result,
      timestamp: new Date().toISOString(),
    });

    // Check if all agents are done
    const stream = this.streams.get(queryId);
    if (stream) {
      stream.completedAgents.add(result.agentId);
      if (stream.completedAgents.size >= stream.agentCount) {
        await this.finalizeQuery(queryId);
      }
    }
  }

  private async finalizeQuery(queryId: string): Promise<void> {
    await this.prisma.query.update({
      where: { id: queryId },
      data: { status: 'completed' },
    });

    this.emitEvent(queryId, {
      type: 'query_completed',
      queryId,
      timestamp: new Date().toISOString(),
    });

    // Clean up stream after short delay
    setTimeout(() => this.streams.delete(queryId), 30_000);
  }

  getQueryStream(queryId: string): Observable<SseEvent> {
    const stream = this.streams.get(queryId);
    if (stream) return stream.subject.asObservable();

    // Return empty observable if stream not found
    const subject = new Subject<SseEvent>();
    setTimeout(() => subject.complete(), 100);
    return subject.asObservable();
  }

  private initStream(queryId: string, agentCount: number): void {
    const subject = new Subject<SseEvent>();
    this.streams.set(queryId, { subject, agentCount, completedAgents: new Set() });
  }

  private emitEvent(queryId: string, event: SseEvent): void {
    const stream = this.streams.get(queryId);
    if (stream) stream.subject.next(event);
  }

  async getQueryHistory(userId: string, limit = 20) {
    return this.prisma.query.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        agentResults: true,
      },
    });
  }

  async getQueryResult(queryId: string) {
    return this.prisma.query.findUnique({
      where: { id: queryId },
      include: { agentResults: true },
    });
  }
}
