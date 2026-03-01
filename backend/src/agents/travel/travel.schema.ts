import { z } from 'zod';

export const FlightOptionSchema = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  departure: z.string(),
  arrival: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  price: z.number(),
  currency: z.string(),
  bookingUrl: z.string().optional(),
  cabin: z.string().default('economy'),
});

export const TrainOptionSchema = z.object({
  trainName: z.string(),
  trainNumber: z.string(),
  departure: z.string(),
  arrival: z.string(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.string(),
  price: z.number(),
  currency: z.string(),
  class: z.string(),
});

export const WeatherInfoSchema = z.object({
  date: z.string(),
  city: z.string(),
  temperatureCelsius: z.number(),
  humidity: z.number(),
  description: z.string(),
  icon: z.string().optional(),
});

export const TravelAgentDataSchema = z.object({
  flights: z.array(FlightOptionSchema),
  trains: z.array(TrainOptionSchema),
  weather: WeatherInfoSchema.nullable(),
  travelTimeEstimateHours: z.number().optional(),
  recommendedMode: z.enum(['flight', 'train', 'either']).default('either'),
});

export type TravelAgentData = z.infer<typeof TravelAgentDataSchema>;
export type FlightOption = z.infer<typeof FlightOptionSchema>;
export type TrainOption = z.infer<typeof TrainOptionSchema>;
export type WeatherInfo = z.infer<typeof WeatherInfoSchema>;
