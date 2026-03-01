import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';
import { TravelAgentData, WeatherInfo, FlightOption } from './travel.schema';
import { Env } from '../../common/config/config.module';

@Injectable()
export class TravelAgent extends BaseAgent<TravelAgentData> {
  protected readonly agentId = 'travel';

  constructor(private readonly configService: ConfigService<Env>) {
    super(8000, 2); // 8s timeout for external APIs
  }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<TravelAgentData>> {
    const { context, userContext } = params;
    const results = await Promise.allSettled([
      this.fetchFlights(context),
      this.fetchWeather(context),
    ]);

    const flights = results[0].status === 'fulfilled' ? results[0].value : [];
    const weather = results[1].status === 'fulfilled' ? results[1].value : null;

    const data: TravelAgentData = {
      flights: flights.slice(0, 3),
      trains: this.getMockTrains(context),
      weather,
      travelTimeEstimateHours: flights.length > 0 ? parseFloat(flights[0].duration) || 2 : undefined,
      recommendedMode: flights.length > 0 ? 'flight' : 'train',
    };

    const actions = flights.slice(0, 3).map((f, i) => ({
      actionId: `book-flight-${i}`,
      label: `Book ${f.airline} ${f.flightNumber} — ₹${f.price.toLocaleString()}`,
      type: 'booking' as const,
      payload: { flightNumber: f.flightNumber, airline: f.airline },
      estimatedCost: f.price,
      currency: 'INR',
    }));

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.82,
        requiresUserConfirmation: true,
        actions,
      }),
      executionTimeMs: 0, // set by run()
    };
  }

  private async fetchFlights(context: Record<string, unknown>): Promise<FlightOption[]> {
    const apiKey = this.configService.get('AMADEUS_API_KEY');
    const apiSecret = this.configService.get('AMADEUS_API_SECRET');

    if (!apiKey || !apiSecret || !context.city || !context.date) {
      return this.getMockFlights(context);
    }

    try {
      // Get Amadeus access token
      const tokenResponse = await axios.post(
        'https://test.api.amadeus.com/v1/security/oauth2/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: apiSecret,
        }),
        { timeout: 5000, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const accessToken = tokenResponse.data.access_token as string;

      // Simplified IATA lookup (would use Maps API in production)
      const destCode = this.cityToIata(context.city as string);

      const flightsResp = await axios.get(
        'https://test.api.amadeus.com/v2/shopping/flight-offers',
        {
          params: {
            originLocationCode: 'DEL',
            destinationLocationCode: destCode,
            departureDate: context.date,
            adults: 1,
            max: 5,
            currencyCode: 'INR',
          },
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 5000,
        },
      );

      return this.parseAmadeusFlights(flightsResp.data);
    } catch {
      return this.getMockFlights(context);
    }
  }

  private parseAmadeusFlights(data: Record<string, unknown>): FlightOption[] {
    const offers = (data.data as Array<Record<string, unknown>>) ?? [];
    return offers.slice(0, 3).map((offer) => {
      const itinerary = (offer.itineraries as Array<Record<string, unknown>>)[0];
      const segment = (itinerary.segments as Array<Record<string, unknown>>)[0];
      const price = (offer.price as Record<string, unknown>);
      return {
        airline: segment.carrierCode as string,
        flightNumber: `${segment.carrierCode as string}-${segment.number as string}`,
        departure: (segment.departure as Record<string, string>).iataCode,
        arrival: (segment.arrival as Record<string, string>).iataCode,
        departureTime: (segment.departure as Record<string, string>).at,
        arrivalTime: (segment.arrival as Record<string, string>).at,
        duration: itinerary.duration as string,
        price: parseFloat(price.total as string),
        currency: price.currency as string,
        cabin: 'economy',
      };
    });
  }

  private async fetchWeather(context: Record<string, unknown>): Promise<WeatherInfo | null> {
    const apiKey = this.configService.get('OPENWEATHER_API_KEY');
    if (!apiKey || !context.city) return null;

    try {
      const resp = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
        params: {
          q: context.city,
          appid: apiKey,
          units: 'metric',
          cnt: 1,
        },
        timeout: 4000,
      });

      const item = (resp.data.list as Array<Record<string, unknown>>)[0];
      const weather = (item.weather as Array<Record<string, unknown>>)[0];
      const main = item.main as Record<string, number>;

      return {
        date: context.date as string,
        city: context.city as string,
        temperatureCelsius: Math.round(main.temp),
        humidity: main.humidity,
        description: weather.description as string,
        icon: weather.icon as string,
      };
    } catch {
      return this.getMockWeather(context);
    }
  }

  private getMockFlights(context: Record<string, unknown>): FlightOption[] {
    const city = (context.city as string) ?? 'Mumbai';
    const date = (context.date as string) ?? '2026-03-02';
    return [
      {
        airline: 'IndiGo',
        flightNumber: '6E-204',
        departure: 'DEL',
        arrival: 'BOM',
        departureTime: `${date}T06:00:00`,
        arrivalTime: `${date}T08:15:00`,
        duration: '2h 15m',
        price: 4850,
        currency: 'INR',
        cabin: 'economy',
      },
      {
        airline: 'Air India',
        flightNumber: 'AI-663',
        departure: 'DEL',
        arrival: 'BOM',
        departureTime: `${date}T08:30:00`,
        arrivalTime: `${date}T10:45:00`,
        duration: '2h 15m',
        price: 6200,
        currency: 'INR',
        cabin: 'economy',
      },
      {
        airline: 'Vistara',
        flightNumber: 'UK-181',
        departure: 'DEL',
        arrival: 'BOM',
        departureTime: `${date}T10:00:00`,
        arrivalTime: `${date}T12:20:00`,
        duration: '2h 20m',
        price: 7400,
        currency: 'INR',
        cabin: 'economy',
      },
    ];
  }

  private getMockTrains(context: Record<string, unknown>) {
    const date = (context.date as string) ?? '2026-03-02';
    return [
      {
        trainName: 'Rajdhani Express',
        trainNumber: '12951',
        departure: 'NDLS',
        arrival: 'MMCT',
        departureTime: `${date}T16:25:00`,
        arrivalTime: `${date + 'T08:15:00'}`,
        duration: '15h 50m',
        price: 2100,
        currency: 'INR',
        class: '3AC',
      },
    ];
  }

  private getMockWeather(context: Record<string, unknown>): WeatherInfo {
    return {
      date: (context.date as string) ?? '2026-03-02',
      city: (context.city as string) ?? 'Mumbai',
      temperatureCelsius: 32,
      humidity: 78,
      description: 'Hot and humid. Light showers possible.',
      icon: '10d',
    };
  }

  private cityToIata(city: string): string {
    const map: Record<string, string> = {
      mumbai: 'BOM', delhi: 'DEL', bangalore: 'BLR', bengaluru: 'BLR',
      hyderabad: 'HYD', chennai: 'MAA', kolkata: 'CCU', pune: 'PNQ',
      goa: 'GOI', ahmedabad: 'AMD',
    };
    return map[city.toLowerCase()] ?? 'BOM';
  }
}
