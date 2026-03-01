// Queue name constants — never use magic strings in job queue calls
export const QUEUE_NAMES = {
  AGENTS: 'agents',
  CONTEXT_EXTRACTION: 'context-extraction',
} as const;

export const JOB_NAMES = {
  TRAVEL: 'travel-agent',
  CALENDAR: 'calendar-agent',
  MUSIC: 'music-agent',
  WARDROBE: 'wardrobe-agent',
  FOOD: 'food-agent',
  ACCOMMODATION: 'accommodation-agent',
  FINANCE: 'finance-agent',
  MEETING_PREP: 'meeting-prep-agent',
  WEATHER: 'weather-agent',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];

export interface AgentJobData {
  queryId: string;
  userId: string;
  extractedContext: Record<string, unknown>;
  userContext: string; // RAG-retrieved context string
}
