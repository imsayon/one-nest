import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './dto/register.dto';
import type { Env } from '../common/config/config.module';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

export interface UserLike {
  id: string;
  email: string;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<Env>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      homeCity: dto.homeCity,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens(user);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthTokens> {
    const user = await this.usersService.findById(userId);

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user as UserLike);
  }

  async validateJwt(payload: JwtPayload): Promise<UserLike | null> {
    return this.usersService.findById(payload.sub) as Promise<UserLike | null>;
  }

  private generateTokens(user: UserLike): AuthTokens {
    const payload: JwtPayload = { sub: user.id, email: user.email };

    const jwtSecret = this.configService.get<string>('JWT_SECRET') ?? '';
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') ?? '';

    const accessToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: jwtSecret,
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      {
        secret: jwtRefreshSecret,
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }
}
