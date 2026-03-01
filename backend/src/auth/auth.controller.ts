import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDtoSchema, LoginDtoSchema } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt.guard';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../common/config/config.module';

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<Env>,
  ) {}

  @Post('register')
  async register(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = RegisterDtoSchema.safeParse(body);
    if (!dto.success) throw new BadRequestException(dto.error.flatten());

    const tokens = await this.authService.register(dto.data);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Registered successfully' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown, @Res({ passthrough: true }) res: Response) {
    const dto = LoginDtoSchema.safeParse(body);
    if (!dto.success) throw new BadRequestException(dto.error.flatten());

    const tokens = await this.authService.login(dto.data);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Logged in successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as Record<string, string> | undefined;
    const refreshToken = cookies?.['refresh_token'];
    const userId = cookies?.['userId'];

    if (!refreshToken || !userId) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'No refresh token' });
    }

    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setTokenCookies(res, tokens.accessToken, tokens.refreshToken);
    return { message: 'Tokens refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', COOKIE_CONFIG);
    res.clearCookie('refresh_token', COOKIE_CONFIG);
    res.clearCookie('userId', COOKIE_CONFIG);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    const user = req.user as AuthUser;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessMaxAge = 15 * 60 * 1000;
    const refreshMaxAge = 7 * 24 * 60 * 60 * 1000;

    res.cookie('access_token', accessToken, { ...COOKIE_CONFIG, maxAge: accessMaxAge });
    res.cookie('refresh_token', refreshToken, { ...COOKIE_CONFIG, maxAge: refreshMaxAge });
  }
}
