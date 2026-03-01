import { z } from 'zod';

export const SpotifyTrackSchema = z.object({
  name: z.string(),
  artist: z.string(),
  uri: z.string().optional(),
  previewUrl: z.string().optional(),
});

export const MusicAgentDataSchema = z.object({
  playlistName: z.string(),
  playlistUrl: z.string().optional(),
  playlistUri: z.string().optional(),
  tracks: z.array(SpotifyTrackSchema),
  mood: z.string(),
  estimatedDurationMinutes: z.number(),
  platform: z.string().default('spotify'),
});

export type MusicAgentData = z.infer<typeof MusicAgentDataSchema>;
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
