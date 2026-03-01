import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client') as typeof import('@prisma/client');

type PrismaClientType = InstanceType<typeof PrismaClient>;

/**
 * PrismaService wraps the generated Prisma Client.
 * We use a different module resolution approach for Prisma 7 compatibility.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly client: PrismaClientType;

  constructor() {
    this.client = new PrismaClient({
      log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await (this.client as PrismaClientType & { $connect: () => Promise<void> }).$connect();
    this.logger.log('Database connected');
  }

  async onModuleDestroy() {
    await (this.client as PrismaClientType & { $disconnect: () => Promise<void> }).$disconnect();
    this.logger.log('Database disconnected');
  }

  get user() { return this.client.user; }
  get userPreferences() { return this.client.userPreferences; }
  get query() { return this.client.query; }
  get agentResult() { return this.client.agentResult; }
  get userContextEmbedding() { return this.client.userContextEmbedding; }
  get wardrobeItem() { return this.client.wardrobeItem; }

  // Raw query methods for pgvector similarity search
  $queryRawUnsafe<T = unknown>(query: string, ...args: unknown[]): Promise<T> {
    return (this.client as PrismaClientType & { $queryRawUnsafe: (q: string, ...a: unknown[]) => Promise<T> }).$queryRawUnsafe(query, ...args);
  }

  $executeRawUnsafe(query: string, ...args: unknown[]): Promise<number> {
    return (this.client as PrismaClientType & { $executeRawUnsafe: (q: string, ...a: unknown[]) => Promise<number> }).$executeRawUnsafe(query, ...args);
  }
}
