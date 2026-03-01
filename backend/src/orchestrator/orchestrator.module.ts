import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrchestratorController } from './orchestrator.controller';
import { OrchestratorService } from './orchestrator.service';
import { ContextExtractorService } from './context-extractor.service';
import { RagModule } from '../rag/rag.module';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    RagModule,
    forwardRef(() => AgentsModule),
    BullModule.registerQueue({ name: QUEUE_NAMES.AGENTS }),
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService, ContextExtractorService],
  exports: [OrchestratorService],
})
export class OrchestratorModule {}
