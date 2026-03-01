import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/config.module';
import { DatabaseModule } from './common/database/database.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PreferencesModule } from './preferences/preferences.module';
import { RagModule } from './rag/rag.module';
import { AgentsModule } from './agents/agents.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';

@Module({
  imports: [
    // Core infrastructure (global)
    AppConfigModule,
    DatabaseModule,
    QueueModule,

    // Feature modules
    AuthModule,
    UsersModule,
    PreferencesModule,
    RagModule,
    AgentsModule,
    OrchestratorModule,
  ],
})
export class AppModule {}
