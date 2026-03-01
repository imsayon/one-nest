import { Injectable } from '@nestjs/common';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';

interface FoodAgentData {
  breakfastOptions: Array<{ name: string; cuisine: string; distance: string; rating: number; priceRange: string }>;
  dinnerOptions: Array<{ name: string; cuisine: string; distance: string; rating: number; priceRange: string }>;
  nearVenue: boolean;
}

/** STUB — Zomato/Swiggy integration is V1. Realistic mock with actual Oberoi-area restaurants for the demo scenario. */
@Injectable()
export class FoodAgent extends BaseAgent<FoodAgentData> {
  protected readonly agentId = 'food';
  constructor() { super(); }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<FoodAgentData>> {
    const { context } = params;
    const isVegUser = false;

    const data: FoodAgentData = {
      breakfastOptions: [
        { name: 'Café Mosaic (Oberoi)', cuisine: 'Continental', distance: '0.1 km', rating: 4.8, priceRange: '₹₹₹₹' },
        { name: 'Cha Bar', cuisine: 'Indian, Tea', distance: '0.8 km', rating: 4.5, priceRange: '₹₹' },
        { name: 'Starbucks Marine Drive', cuisine: 'Café', distance: '0.5 km', rating: 4.3, priceRange: '₹₹₹' },
      ],
      dinnerOptions: [
        { name: 'Ziya (Oberoi)', cuisine: 'Indian Fine Dining', distance: '0.1 km', rating: 4.9, priceRange: '₹₹₹₹' },
        { name: 'La Folie', cuisine: 'French, Desserts', distance: '1.2 km', rating: 4.7, priceRange: '₹₹₹' },
        { name: 'Khyber', cuisine: 'North Indian', distance: '2.1 km', rating: 4.6, priceRange: '₹₹₹' },
      ],
      nearVenue: true,
    };

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.78,
        actions: [{
          actionId: 'reserve-breakfast',
          label: 'Reserve at Café Mosaic',
          type: 'booking',
          payload: { restaurant: 'Café Mosaic', date: context.date, time: '08:00' },
          estimatedCost: 1200,
          currency: 'INR',
        }],
      }),
      executionTimeMs: 0,
    };
  }
}
