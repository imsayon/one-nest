import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AgentsWorker } from './agents.worker';
import { TravelAgent } from './travel/travel.agent';
import { CalendarAgent } from './calendar/calendar.agent';
import { MusicAgent } from './music/music.agent';
import { WardrobeAgent } from './wardrobe/wardrobe.agent';
import { FoodAgent } from './food/food.agent';
import { AccommodationAgent } from './accommodation/accommodation.agent';
import { FinanceAgent } from './finance/finance.agent';
import { MeetingPrepAgent } from './meeting-prep/meeting-prep.agent';
import { QUEUE_NAMES } from '../queue/queue.constants';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUE_NAMES.AGENTS }),
    forwardRef(() => OrchestratorModule),
  ],
  providers: [
    AgentsWorker,
    TravelAgent,
    CalendarAgent,
    MusicAgent,
    WardrobeAgent,
    FoodAgent,
    AccommodationAgent,
    FinanceAgent,
    MeetingPrepAgent,
  ],
  exports: [
    TravelAgent,
    CalendarAgent,
    MusicAgent,
    WardrobeAgent,
    FoodAgent,
    AccommodationAgent,
    FinanceAgent,
    MeetingPrepAgent,
    AgentsWorker,
  ],
})
export class AgentsModule {}
