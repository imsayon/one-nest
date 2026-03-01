import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { PreferencesService } from './preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

interface AuthUser { id: string }

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  getPreferences(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.preferencesService.getPreferences(user.id);
  }

  @Put()
  updatePreferences(@Req() req: Request, @Body() body: unknown) {
    const user = req.user as AuthUser;
    return this.preferencesService.updatePreferences(user.id, body as Record<string, unknown>);
  }
}
