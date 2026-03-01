import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import { ConfigService } from '@nestjs/config'
import { Env } from './common/config/config.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const configService = app.get(ConfigService<Env>);
  const frontendUrl = configService.get('FRONTEND_URL') ?? 'http://localhost:5173';
  const port = configService.get('PORT') ?? 3000;

  // CORS — allow credentials (for httpOnly cookies)
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cookie parser for reading httpOnly JWT cookies
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use((cookieParser as unknown as () => unknown)())

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable SSE (disable body parsing compression for streaming endpoints)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  await app.listen(port);
  console.log(`🚀 One-Nest backend running at http://localhost:${port}/api`);
}

bootstrap();
