import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger, forwardRef } from '@nestjs/common';
import { QUEUE_NAMES, JOB_NAMES, AgentJobData } from '../queue/queue.constants';
import { OrchestratorService } from '../orchestrator/orchestrator.service';
import { TravelAgent } from './travel/travel.agent';
import { CalendarAgent } from './calendar/calendar.agent';
import { MusicAgent } from './music/music.agent';
import { WardrobeAgent } from './wardrobe/wardrobe.agent';
import { FoodAgent } from './food/food.agent';
import { AccommodationAgent } from './accommodation/accommodation.agent';
import { FinanceAgent } from './finance/finance.agent';
import { MeetingPrepAgent } from './meeting-prep/meeting-prep.agent';
import type { ExtractedContext, AgentResponse } from '../common/types/agent-response';

@Processor(QUEUE_NAMES.AGENTS)
export class AgentsWorker extends WorkerHost {
  private readonly logger = new Logger(AgentsWorker.name);

  constructor(
    @Inject(forwardRef(() => OrchestratorService))
    private readonly orchestratorService: OrchestratorService,
    private readonly travelAgent: TravelAgent,
    private readonly calendarAgent: CalendarAgent,
    private readonly musicAgent: MusicAgent,
    private readonly wardrobeAgent: WardrobeAgent,
    private readonly foodAgent: FoodAgent,
    private readonly accommodationAgent: AccommodationAgent,
    private readonly financeAgent: FinanceAgent,
    private readonly meetingPrepAgent: MeetingPrepAgent,
  ) {
    super();
  }

  async process(job: Job<AgentJobData>): Promise<void> {
    const { queryId, userId, extractedContext, userContext } = job.data;

    this.logger.log(`Processing job ${job.name} for query ${queryId}`);

    const params = {
      queryId,
      userId,
      context: extractedContext as ExtractedContext,
      userContext,
    };

    type AgentWithRun = { run: (p: typeof params) => Promise<AgentResponse<unknown>> };
    const agentMap: Record<string, AgentWithRun> = {
      [JOB_NAMES.TRAVEL]: this.travelAgent as AgentWithRun,
      [JOB_NAMES.CALENDAR]: this.calendarAgent as AgentWithRun,
      [JOB_NAMES.MUSIC]: this.musicAgent as AgentWithRun,
      [JOB_NAMES.WARDROBE]: this.wardrobeAgent as AgentWithRun,
      [JOB_NAMES.FOOD]: this.foodAgent as AgentWithRun,
      [JOB_NAMES.ACCOMMODATION]: this.accommodationAgent as AgentWithRun,
      [JOB_NAMES.FINANCE]: this.financeAgent as AgentWithRun,
      [JOB_NAMES.MEETING_PREP]: this.meetingPrepAgent as AgentWithRun,
    };

    const agent = agentMap[job.name];
    if (!agent) {
      this.logger.error(`No agent found for job name: ${job.name}`);
      return;
    }

    const result = await agent.run(params);
    await this.orchestratorService.onAgentComplete(queryId, result);
  }
}
