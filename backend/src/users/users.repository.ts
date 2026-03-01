import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    homeCity?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        homeCity: data.homeCity,
        preferences: {
          create: {},
        },
      },
    });
  }

  async updateHomeCity(userId: string, homeCity: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { homeCity },
    });
  }
}
