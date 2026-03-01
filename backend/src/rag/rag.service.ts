import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../common/database/prisma.service';
import { Env } from '../common/config/config.module';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<Env>,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Generate a text embedding using Google Generative AI
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.genAI) {
      this.logger.warn('Gemini API key not set — skipping embedding generation');
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      this.logger.error('Failed to generate embedding:', err);
      return null;
    }
  }

  /**
   * Store a user context embedding for RAG retrieval
   */
  async storeEmbedding(
    userId: string,
    contentText: string,
    contextType: 'trip' | 'preference' | 'feedback',
  ): Promise<void> {
    const embedding = await this.generateEmbedding(contentText);

    if (!embedding) {
      // Still store the text even without embedding for fallback
      await this.prisma.userContextEmbedding.create({
        data: { userId, contentText, contextType },
      });
      return;
    }

    const vectorStr = `[${embedding.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO user_context_embeddings (id, user_id, content_text, embedding, context_type, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3::vector, $4, NOW())`,
      userId,
      contentText,
      vectorStr,
      contextType,
    );
  }

  /**
   * Retrieve the top-5 most relevant past contexts for a user via pgvector similarity search
   */
  async retrieveRelevantContext(userId: string, queryText: string): Promise<string> {
    const embedding = await this.generateEmbedding(queryText);

    let rows: Array<{ content_text: string }>;

    if (embedding) {
      const vectorStr = `[${embedding.join(',')}]`;
      rows = await this.prisma.$queryRawUnsafe<Array<{ content_text: string }>>(
        `SELECT content_text FROM user_context_embeddings
         WHERE user_id = $1 AND embedding IS NOT NULL
         ORDER BY embedding <=> $2::vector
         LIMIT 5`,
        userId,
        vectorStr,
      );
    } else {
      // Fallback: just get most recent 5 embeddings
      rows = await this.prisma.$queryRawUnsafe<Array<{ content_text: string }>>(
        `SELECT content_text FROM user_context_embeddings
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        userId,
      );
    }

    if (rows.length === 0) return '';

    return rows.map((r) => r.content_text).join('\n\n');
  }
}
