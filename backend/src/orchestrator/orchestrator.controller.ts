import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Sse,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { MessageEvent } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { OrchestratorService } from './orchestrator.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { z } from 'zod';

interface AuthUser {
  id: string;
  email: string;
}

const QueryInputSchema = z.object({
  input: z.string().min(1).max(2000),
});

@Controller('query')
@UseGuards(JwtAuthGuard)
export class OrchestratorController {
  constructor(private readonly orchestratorService: OrchestratorService) {}

  @Post()
  async submitQuery(@Req() req: Request, @Body() body: unknown) {
    const dto = QueryInputSchema.safeParse(body);
    if (!dto.success) throw new BadRequestException(dto.error.flatten());

    const user = req.user as AuthUser;
    return this.orchestratorService.submitQuery(user.id, dto.data.input);
  }

  @Get(':queryId/stream')
  @Sse()
  streamQueryUpdates(
    @Param('queryId') queryId: string,
  ): Observable<MessageEvent> {
    const stream = this.orchestratorService.getQueryStream(queryId);
    return stream.pipe(
      map((event) => ({
        type: event.type,
        data: JSON.stringify(event),
      })),
    );
  }

  @Get(':queryId')
  async getQueryResult(@Param('queryId') queryId: string) {
    return this.orchestratorService.getQueryResult(queryId);
  }

  @Get()
  async getHistory(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.orchestratorService.getQueryHistory(user.id);
  }
}
