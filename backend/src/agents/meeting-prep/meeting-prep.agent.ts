import { Injectable } from '@nestjs/common';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';

interface MeetingPrepAgentData {
  talkingPoints: string[];
  backgroundInfo: string;
  suggestedAgenda: string[];
  documentsToCarry: string[];
  tipOfTheDay: string;
}

/** STUB — Real contact/company intelligence requires LinkedIn / CRM integration (V1). */
@Injectable()
export class MeetingPrepAgent extends BaseAgent<MeetingPrepAgentData> {
  protected readonly agentId = 'meeting-prep';
  constructor() { super(); }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<MeetingPrepAgentData>> {
    const { context } = params;

    const data: MeetingPrepAgentData = {
      talkingPoints: [
        'Prepare a clear one-page overview of your key ask/proposal',
        'Research the venue — Oberoi Mumbai is commonly used for investor/partner meetings',
        'Confirm attendees and their roles in advance',
        'Prepare your pitch deck in both PDF and PowerPoint format',
      ],
      backgroundInfo: 'No contact information found. Connect your contacts in One-Nest V1 to get automatic person briefs before each meeting.',
      suggestedAgenda: [
        '0-5 min: Introductions',
        '5-20 min: Current situation / problem statement',
        '20-40 min: Proposed solution walkthrough',
        '40-55 min: Q&A and objections',
        '55-60 min: Next steps and follow-up date',
      ],
      documentsToCarry: [
        'Business cards (minimum 10)',
        'NDA (signed copy)',
        'One-page executive summary',
        'Pitch deck (printed + digital)',
      ],
      tipOfTheDay: 'Arrive 15 minutes early. Confirm your contact\'s mobile number before you go — hotel lobbies can be challenging to navigate.',
    };

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.60,
        actions: [{
          actionId: 'save-prep',
          label: 'Save meeting prep to Notes',
          type: 'save',
          payload: { agenda: data.suggestedAgenda, talkingPoints: data.talkingPoints },
        }],
      }),
      executionTimeMs: 0,
    };
  }
}
