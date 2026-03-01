import { z } from 'zod';

export const CalendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  calendarLink: z.string().optional(),
  reminderMinutes: z.array(z.number()).default([60, 1440]),
  conflictsDetected: z.array(z.string()).default([]),
});

export const CalendarAgentDataSchema = z.object({
  event: CalendarEventSchema,
  travelReminder: CalendarEventSchema.nullable(),
  packingReminder: CalendarEventSchema.nullable(),
  suggestedPreparationTime: z.number().optional(), // minutes before event
});

export type CalendarAgentData = z.infer<typeof CalendarAgentDataSchema>;
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;
