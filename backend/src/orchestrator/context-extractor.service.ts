import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { ExtractedContext, ExtractedContextSchema } from '../common/types/agent-response';
import { Env } from '../common/config/config.module';

// The set of agents One-Nest supports in V0
const ALL_AGENTS = ['travel', 'calendar', 'music', 'wardrobe', 'food', 'accommodation', 'finance', 'meeting-prep'];

@Injectable()
export class ContextExtractorService {
  private readonly logger = new Logger(ContextExtractorService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService<Env>) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async extract(rawInput: string): Promise<ExtractedContext> {
    if (!this.genAI) {
      this.logger.warn('GEMINI_API_KEY not set — using fallback context extraction');
      return this.buildFallbackContext(rawInput);
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `
You are a structured data extraction engine. Analyze the user's natural language input and extract structured context.
Return ONLY valid JSON conforming to this schema (omit fields you cannot determine):

{
  "eventType": "meeting|travel|social|appointment|other",
  "date": "ISO 8601 date string (YYYY-MM-DD)",
  "location": "full location name",
  "city": "city name",
  "country": "country name",
  "formality": "casual|smart-casual|formal|black-tie",
  "durationDays": number,
  "participants": ["name1", "name2"],
  "estimatedBudget": number in INR,
  "travelRequired": boolean,
  "accommodationRequired": boolean,
  "agentsToActivate": array from ["travel","calendar","music","wardrobe","food","accommodation","finance","meeting-prep"]
}

RULES:
- agentsToActivate must include at minimum: "calendar" for any event with a date.
- Include "travel" if travel is explicitly or implicitly required.
- Include "accommodation" only if multi-day travel is likely.
- Include "music" if travel time > 1 hour or if mood/focus content is relevant.
- Include "finance" if significant spend is involved.
- Include "meeting-prep" only if a formal business meeting with identifiable participants.
- Include "wardrobe" if formality or climate context is relevant.
- Include "food" always (default on).

User input: "${rawInput.replace(/"/g, '\\"')}"
`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text) as unknown;

      const validated = ExtractedContextSchema.safeParse(parsed);
      if (!validated.success) {
        this.logger.warn('Context extraction schema validation failed, using partial result');
        // Use what we can
        const partial = parsed as Partial<ExtractedContext>;
        return {
          ...partial,
          agentsToActivate: partial.agentsToActivate ?? ['calendar', 'music', 'food'],
        };
      }

      return validated.data;
    } catch (err) {
      this.logger.error('Context extraction failed:', err);
      return this.buildFallbackContext(rawInput);
    }
  }

  private buildFallbackContext(rawInput: string): ExtractedContext {
    const hasDate = /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})/i.test(rawInput);
    const hasTravel = /flight|train|travel|airport|hotel|stay/i.test(rawInput);
    const hasMeeting = /meeting|conference|call/i.test(rawInput);

    return {
      agentsToActivate: [
        ...(hasDate ? ['calendar'] : []),
        ...(hasTravel ? ['travel', 'accommodation'] : []),
        ...(hasMeeting ? ['meeting-prep'] : []),
        'music',
        'food',
        'wardrobe',
      ],
    };
  }
}
