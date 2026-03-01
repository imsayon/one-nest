import { Injectable } from '@nestjs/common';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';

interface WardrobeAgentData {
  recommendedOutfit: { top: string; bottom: string; footwear: string; accessories: string[] };
  weatherConsideration: string;
  formalityMatch: string;
  packingList: string[];
}

/** STUB — Real wardrobe DB onboarding is V1. Returns realistic mock data conforming to AgentResponse contract. */
@Injectable()
export class WardrobeAgent extends BaseAgent<WardrobeAgentData> {
  protected readonly agentId = 'wardrobe';
  constructor() { super(); }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<WardrobeAgentData>> {
    const { context } = params;
    const isHot = true; // Mumbai in March is always hot
    const isFormal = (context.formality as string) === 'formal' || (context.formality as string) === 'black-tie';

    const data: WardrobeAgentData = {
      recommendedOutfit: {
        top: isFormal ? 'Light blue formal shirt (cotton/linen blend)' : 'White polo shirt',
        bottom: isFormal ? 'Charcoal grey formal trousers' : 'Beige chinos',
        footwear: isFormal ? 'Black oxford shoes' : 'White sneakers',
        accessories: isFormal ? ['Silk tie (navy)', 'Leather belt', 'Analog watch'] : ['Casual watch'],
      },
      weatherConsideration: `Hot & humid (${(context.city as string) ?? 'destination'} in ${(context.date as string)?.split('-')[1] ?? 'March'}). Opt for breathable fabrics.`,
      formalityMatch: isFormal ? 'Business formal — Oberoi-appropriate' : 'Smart casual',
      packingList: ['2x formal shirts', 'Formal trousers', 'Dress shoes', 'Toiletries (3-1-1 compliant)', 'Phone/laptop charger', 'Business cards'],
    };

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.72,
        actions: [{
          actionId: 'save-outfit',
          label: 'Save outfit to My Wardrobe',
          type: 'save',
          payload: { outfit: data.recommendedOutfit },
        }],
      }),
      executionTimeMs: 0,
    };
  }
}
