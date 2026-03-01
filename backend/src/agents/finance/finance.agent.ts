import { Injectable } from '@nestjs/common';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';

interface FinanceAgentData {
  breakdown: Array<{ category: string; estimatedCost: number; currency: string }>;
  totalEstimate: number;
  currency: string;
  budgetStatus: 'within_budget' | 'over_budget' | 'unknown';
  savingsTip?: string;
}

/** STUB — Real budget tracking and bank integration is V1. */
@Injectable()
export class FinanceAgent extends BaseAgent<FinanceAgentData> {
  protected readonly agentId = 'finance';
  constructor() { super(); }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<FinanceAgentData>> {
    const { context } = params;

    const breakdown = [
      { category: 'Flights (round trip)', estimatedCost: 9700, currency: 'INR' },
      { category: 'Hotel (1 night)', estimatedCost: 16000, currency: 'INR' },
      { category: 'Food & Dining', estimatedCost: 3500, currency: 'INR' },
      { category: 'Local Transport', estimatedCost: 1500, currency: 'INR' },
      { category: 'Miscellaneous', estimatedCost: 2000, currency: 'INR' },
    ];

    const total = breakdown.reduce((sum, b) => sum + b.estimatedCost, 0);

    const data: FinanceAgentData = {
      breakdown,
      totalEstimate: total,
      currency: 'INR',
      budgetStatus: 'within_budget',
      savingsTip: 'Book IndiGo 6E-204 (cheapest) + Trident instead of Oberoi to save ₹13,750.',
    };

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.70,
        actions: [{
          actionId: 'save-budget',
          label: 'Save trip budget to Finance Tracker',
          type: 'save',
          payload: { tripTotal: total, breakdown },
        }],
      }),
      executionTimeMs: 0,
    };
  }
}
