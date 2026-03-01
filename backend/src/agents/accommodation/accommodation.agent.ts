import { Injectable } from '@nestjs/common';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';

interface AccommodationAgentData {
  options: Array<{
    name: string;
    starRating: number;
    pricePerNight: number;
    currency: string;
    distanceFromVenue: string;
    amenities: string[];
    bookingUrl?: string;
  }>;
  recommended: string;
  totalNights: number;
}

/** STUB — Real hotel search (Booking.com API) is V1. */
@Injectable()
export class AccommodationAgent extends BaseAgent<AccommodationAgentData> {
  protected readonly agentId = 'accommodation';
  constructor() { super(); }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<AccommodationAgentData>> {
    const { context } = params;
    const nights = (context.durationDays as number) ?? 1;

    const data: AccommodationAgentData = {
      options: [
        {
          name: 'The Oberoi Mumbai',
          starRating: 5,
          pricePerNight: 28000,
          currency: 'INR',
          distanceFromVenue: '0.0 km (same venue)',
          amenities: ['Pool', 'Spa', 'Gym', 'Business Center', 'Airport Transfer'],
        },
        {
          name: 'Trident Nariman Point',
          starRating: 5,
          pricePerNight: 16000,
          currency: 'INR',
          distanceFromVenue: '0.3 km',
          amenities: ['Pool', 'Spa', 'Restaurant', 'Business Center'],
        },
        {
          name: 'Gordon House Hotel',
          starRating: 4,
          pricePerNight: 8000,
          currency: 'INR',
          distanceFromVenue: '1.2 km',
          amenities: ['Restaurant', 'Gym', 'Wifi'],
        },
      ],
      recommended: 'Trident Nariman Point',
      totalNights: nights,
    };

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.75,
        requiresUserConfirmation: true,
        actions: [{
          actionId: 'book-hotel',
          label: `Book Trident Nariman Point — ₹${(16000 * nights).toLocaleString()} total`,
          type: 'booking',
          payload: { hotel: 'Trident Nariman Point', nights, checkIn: context.date },
          estimatedCost: 16000 * nights,
          currency: 'INR',
        }],
      }),
      executionTimeMs: 0,
    };
  }
}
