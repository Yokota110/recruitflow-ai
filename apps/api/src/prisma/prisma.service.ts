import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool | null;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      super();
      this.pool = null;
      return;
    }

    const pool = new Pool({
      connectionString,
      ssl: connectionString.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : undefined,
    });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set — database features will not work');
      return;
    }
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool?.end();
  }
}
