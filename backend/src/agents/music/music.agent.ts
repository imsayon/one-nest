import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BaseAgent, AgentExecuteParams } from '../base-agent';
import { AgentResponse } from '../../common/types/agent-response';
import { MusicAgentData, SpotifyTrack } from './music.schema';
import { Env } from '../../common/config/config.module';

@Injectable()
export class MusicAgent extends BaseAgent<MusicAgentData> {
  protected readonly agentId = 'music';
  private spotifyToken: string | null = null;
  private tokenExpiresAt = 0;

  constructor(private readonly configService: ConfigService<Env>) {
    super(8000, 2);
  }

  protected async execute(params: AgentExecuteParams): Promise<AgentResponse<MusicAgentData>> {
    const { context } = params;

    const clientId = this.configService.get('SPOTIFY_CLIENT_ID');
    const clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET');
    const hasSpotify = clientId && clientSecret;

    const mood = this.determineMood(context);
    const playlistName = `One-Nest: ${mood} Vibes for ${(context.city as string) ?? 'Your Trip'}`;

    let tracks: SpotifyTrack[];
    let playlistUrl: string | undefined;

    if (hasSpotify) {
      try {
        await this.ensureSpotifyToken(clientId, clientSecret);
        tracks = await this.searchTracks(mood);
      } catch {
        tracks = this.getMockTracks(mood);
      }
    } else {
      tracks = this.getMockTracks(mood);
    }

    const durationMins = context.travelRequired ? 150 : 45;

    const data: MusicAgentData = {
      playlistName,
      playlistUrl,
      tracks: tracks.slice(0, 10),
      mood,
      estimatedDurationMinutes: durationMins,
      platform: 'spotify',
    };

    const actions = playlistUrl
      ? [{
          actionId: 'open-playlist',
          label: 'Open Playlist in Spotify',
          type: 'open' as const,
          payload: { url: playlistUrl },
        }]
      : [{
          actionId: 'create-playlist',
          label: 'Create This Playlist on Spotify',
          type: 'create' as const,
          payload: { tracks: tracks.map((t) => t.uri).filter(Boolean), name: playlistName },
        }];

    return {
      ...this.buildSuccessResponse(data, {
        confidence: 0.88,
        requiresUserConfirmation: false,
        actions,
      }),
      executionTimeMs: 0,
    };
  }

  private determineMood(context: Record<string, unknown>): string {
    const formality = context.formality as string;
    const eventType = context.eventType as string;

    if (formality === 'formal' || eventType === 'meeting') return 'Focus & Confidence';
    if (eventType === 'travel') return 'Road Trip Energy';
    return 'Good Vibes';
  }

  private async ensureSpotifyToken(clientId: string, clientSecret: string): Promise<void> {
    if (this.spotifyToken && Date.now() < this.tokenExpiresAt) return;

    const resp = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      },
    );

    this.spotifyToken = resp.data.access_token as string;
    this.tokenExpiresAt = Date.now() + ((resp.data.expires_in as number) - 60) * 1000;
  }

  private async searchTracks(mood: string): Promise<SpotifyTrack[]> {
    const queryMap: Record<string, string> = {
      'Focus & Confidence': 'focus work instrumental',
      'Road Trip Energy': 'road trip feel good',
      'Good Vibes': 'feel good indie pop',
    };

    const resp = await axios.get('https://api.spotify.com/v1/search', {
      params: { q: queryMap[mood] ?? 'feel good', type: 'track', limit: 10 },
      headers: { Authorization: `Bearer ${this.spotifyToken}` },
      timeout: 5000,
    });

    const tracks = resp.data.tracks.items as Array<Record<string, unknown>>;
    return tracks.map((t) => ({
      name: t.name as string,
      artist: ((t.artists as Array<Record<string, string>>)[0]).name,
      uri: t.uri as string,
      previewUrl: t.preview_url as string | undefined,
    }));
  }

  private getMockTracks(mood: string): SpotifyTrack[] {
    const tracksByMood: Record<string, SpotifyTrack[]> = {
      'Focus & Confidence': [
        { name: 'The Less I Know The Better', artist: 'Tame Impala' },
        { name: 'Breathe (2 AM)', artist: 'Anna Nalick' },
        { name: 'Midnight City', artist: 'M83' },
        { name: 'Electric Feel', artist: 'MGMT' },
        { name: 'Digital Love', artist: 'Daft Punk' },
      ],
      'Road Trip Energy': [
        { name: 'Highway to Hell', artist: 'AC/DC' },
        { name: 'Mr. Brightside', artist: 'The Killers' },
        { name: 'Take Me Home, Country Roads', artist: 'John Denver' },
        { name: 'Africa', artist: 'Toto' },
        { name: 'Don\'t Stop Believin\'', artist: 'Journey' },
      ],
      'Good Vibes': [
        { name: 'Good 4 U', artist: 'Olivia Rodrigo' },
        { name: 'Levitating', artist: 'Dua Lipa' },
        { name: 'Blinding Lights', artist: 'The Weeknd' },
        { name: 'Peaches', artist: 'Justin Bieber' },
        { name: 'Stay', artist: 'The Kid LAROI' },
      ],
    };
    return tracksByMood[mood] ?? tracksByMood['Good Vibes'];
  }
}
