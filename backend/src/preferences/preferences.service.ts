import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

export interface UpdatePreferencesDto {
  travelMode?: string;
  budgetTier?: string;
  dietaryRestrictions?: string[];
  musicPlatforms?: string[];
  wardrobeStyle?: string;
  currency?: string;
  timezone?: string;
}

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPreferences(userId: string) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...(dto.travelMode && { travelMode: dto.travelMode }),
        ...(dto.budgetTier && { budgetTier: dto.budgetTier }),
        ...(dto.dietaryRestrictions && { dietaryRestrictions: dto.dietaryRestrictions }),
        ...(dto.musicPlatforms && { musicPlatforms: dto.musicPlatforms }),
        ...(dto.wardrobeStyle && { wardrobeStyle: dto.wardrobeStyle }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.timezone && { timezone: dto.timezone }),
      },
      create: { userId, ...dto },
    });
  }
}
