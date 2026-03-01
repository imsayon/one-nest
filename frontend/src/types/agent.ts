import { z } from 'zod'

export const AgentActionSchema = z.object({
  actionId: z.string(),
  label: z.string(),
  type: z.enum(['booking', 'create', 'save', 'open']),
  payload: z.record(z.string(), z.unknown()),
  estimatedCost: z.number().optional(),
  currency: z.string().optional(),
})

export const AgentResponseSchema = z.object({
  agentId: z.string(),
  status: z.enum(['success', 'error', 'skipped']),
  executionTimeMs: z.number(),
  data: z.unknown().nullable(),
  error: z.string().nullable(),
  confidence: z.number(),
  requiresUserConfirmation: z.boolean(),
  actions: z.array(AgentActionSchema),
})

export type AgentAction = z.infer<typeof AgentActionSchema>
export type AgentResponse = z.infer<typeof AgentResponseSchema>

export interface SseEvent {
  type: 'agent_started' | 'agent_completed' | 'agent_failed' | 'query_completed' | 'heartbeat'
  queryId: string
  agentId?: string
  data?: AgentResponse
  timestamp: string
}

export interface QuerySubmitResponse {
  queryId: string
  agentsActivated: string[]
}

export interface QueryResult {
  id: string
  rawInput: string
  extractedContext: Record<string, unknown>
  status: string
  createdAt: string
  agentResults: AgentResponse[]
}

export interface User {
  id: string
  email: string
  fullName: string
}

export const AGENT_META: Record<string, {
  label: string
  icon: string
  color: string
  gradient: string
  description: string
}> = {
  travel: {
    label: 'Travel',
    icon: '✈️',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Flights, trains, weather',
  },
  calendar: {
    label: 'Calendar',
    icon: '📅',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Events & reminders',
  },
  music: {
    label: 'Music',
    icon: '🎵',
    color: '#1DB954',
    gradient: 'from-green-400 to-emerald-600',
    description: 'Spotify playlists',
  },
  wardrobe: {
    label: 'Wardrobe',
    icon: '👔',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    description: 'Outfit recommendations',
  },
  food: {
    label: 'Food',
    icon: '🍽️',
    color: '#ef4444',
    gradient: 'from-red-400 to-rose-600',
    description: 'Restaurant suggestions',
  },
  accommodation: {
    label: 'Stay',
    icon: '🏨',
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-teal-600',
    description: 'Hotel options',
  },
  finance: {
    label: 'Finance',
    icon: '💰',
    color: '#10b981',
    gradient: 'from-emerald-400 to-green-600',
    description: 'Budget breakdown',
  },
  'meeting-prep': {
    label: 'Meeting Prep',
    icon: '📋',
    color: '#6366f1',
    gradient: 'from-indigo-400 to-blue-600',
    description: 'Agenda & talking points',
  },
}
