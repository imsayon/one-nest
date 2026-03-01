import { z } from 'zod';

export const AgentActionSchema = z.object({
  actionId: z.string(),
  label: z.string(),
  type: z.enum(['booking', 'create', 'save', 'open']),
  payload: z.record(z.string(), z.unknown()),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
});

export const AgentResponseSchema = z.object({
  agentId: z.string(),
  status: z.enum(['success', 'error', 'skipped']),
  executionTimeMs: z.number().int().nonnegative(),
  data: z.unknown().nullable(),
  error: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  requiresUserConfirmation: z.boolean(),
  actions: z.array(AgentActionSchema),
});

export type AgentAction = z.infer<typeof AgentActionSchema>;
export type AgentResponse<T> = {
  agentId: string;
  status: 'success' | 'error' | 'skipped';
  executionTimeMs: number;
  data: T | null;
  error: string | null;
  confidence: number;
  requiresUserConfirmation: boolean;
  actions: AgentAction[];
};

export const ExtractedContextSchema = z.object({
  eventType: z.string().optional(),
  date: z.string().optional(),        // ISO 8601
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  formality: z.enum(['casual', 'smart-casual', 'formal', 'black-tie']).optional(),
  durationDays: z.number().optional(),
  participants: z.array(z.string()).optional(),
  estimatedBudget: z.number().optional(),
  travelRequired: z.boolean().optional(),
  accommodationRequired: z.boolean().optional(),
  agentsToActivate: z.array(z.string()),
});

export type ExtractedContext = z.infer<typeof ExtractedContextSchema>;

export type SseEventType =
  | 'agent_started'
  | 'agent_completed'
  | 'agent_failed'
  | 'query_completed'
  | 'heartbeat';

export interface SseEvent {
  type: SseEventType;
  queryId: string;
  agentId?: string;
  data?: unknown;
  timestamp: string;
}
