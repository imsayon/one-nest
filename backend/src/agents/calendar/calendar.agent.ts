import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';
import { CalendarAgentData, CalendarEvent } from './calendar.schema';
import { Env } from '../../common/config/config.module';

@Injectable()
export class CalendarAgent extends BaseAgent<CalendarAgentData> {
  protected readonly agentId = 'calendar';

  constructor(private readonly configService: ConfigService<Env>) {
    super(6000, 2);
  }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<CalendarAgentData>> {
    const { context } = params;

    const event = this.buildEvent(context);
    const travelReminder = context.travelRequired ? this.buildTravelReminder(context) : null;
    const packingReminder = context.travelRequired ? this.buildPackingReminder(context) : null;

    const data: CalendarAgentData = {
      event,
      travelReminder,
      packingReminder,
      suggestedPreparationTime: context.formality === 'formal' ? 120 : 60,
    };

    const actions = [
      {
        actionId: 'create-calendar-event',
        label: `Add "${event.title}" to Google Calendar`,
        type: 'create' as const,
        payload: { event },
      },
      ...(travelReminder
        ? [{
            actionId: 'create-travel-reminder',
            label: 'Add travel-day reminders',
            type: 'create' as const,
            payload: { event: travelReminder },
          }]
        : []),
    ];

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.95,
        requiresUserConfirmation: true,
        actions,
      }),
      executionTimeMs: 0,
    };
  }

  private buildEvent(context: Record<string, unknown>): CalendarEvent {
    const date = (context.date as string) ?? new Date().toISOString().split('T')[0];
    const startDateTime = `${date}T10:00:00`;
    const endDateTime = `${date}T11:00:00`;

    return {
      title: `Meeting at ${(context.location as string) ?? 'Location TBD'}`,
      startDateTime,
      endDateTime,
      location: context.location as string | undefined,
      description: `Auto-added by One-Nest. Event type: ${(context.eventType as string) ?? 'meeting'}`,
      reminderMinutes: [60, 1440, 2880],
      conflictsDetected: [],
    };
  }

  private buildTravelReminder(context: Record<string, unknown>): CalendarEvent {
    const date = (context.date as string) ?? new Date().toISOString().split('T')[0];
    const travelDate = new Date(date);
    travelDate.setDate(travelDate.getDate() - 1);
    const travelDateStr = travelDate.toISOString().split('T')[0];

    return {
      title: '✈️ Travel Day — Depart for Meeting',
      startDateTime: `${travelDateStr}T06:00:00`,
      endDateTime: `${travelDateStr}T12:00:00`,
      description: 'Travel reminder auto-created by One-Nest for your upcoming event.',
      reminderMinutes: [120],
      conflictsDetected: [],
    };
  }

  private buildPackingReminder(context: Record<string, unknown>): CalendarEvent {
    const date = (context.date as string) ?? new Date().toISOString().split('T')[0];
    const packDate = new Date(date);
    packDate.setDate(packDate.getDate() - 2);
    const packDateStr = packDate.toISOString().split('T')[0];

    return {
      title: '🎒 Pack for Trip',
      startDateTime: `${packDateStr}T20:00:00`,
      endDateTime: `${packDateStr}T21:00:00`,
      description: 'Prepare luggage for upcoming trip — reminder from One-Nest.',
      reminderMinutes: [60],
      conflictsDetected: [],
    };
  }
}
