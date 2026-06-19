import { createNestApp } from './bootstrap';

async function bootstrap() {
  const { app } = await createNestApp();
  const port = process.env.PORT || process.env.API_PORT || 3001;
  await app.listen(port);
  console.log(`RecruitFlow API running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start RecruitFlow API:', err);
  process.exit(1);
});
