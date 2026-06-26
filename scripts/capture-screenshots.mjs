/**
 * Capture portfolio screenshots for GitHub README.
 * Prerequisites: docker compose up -d, pnpm db:seed, pnpm dev
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const WEB_URL = process.env.WEB_URL ?? 'http://localhost:3000';
const API_URL = process.env.API_URL ?? 'http://localhost:3001';
const DEMO_EMAIL = 'demo@recruitflow.ai';
const DEMO_PASSWORD = 'demo1234';

async function login(page) {
  await page.goto(`${WEB_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', DEMO_EMAIL);
  await page.fill('input[type="password"]', DEMO_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

async function getAuthToken(page) {
  return page.evaluate(() => localStorage.getItem('token'));
}

async function fetchJson(token, endpoint) {
  const res = await fetch(`${API_URL}/api/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API ${endpoint} failed: ${res.status}`);
  return res.json();
}

async function findBestCandidateId(token) {
  const candidates = await fetchJson(token, '/candidates?limit=100');
  const list = Array.isArray(candidates) ? candidates : candidates.data ?? candidates.items ?? [];

  let best = null;
  for (const c of list) {
    const detail = await fetchJson(token, `/candidates/${c.id}`);
    const apps = detail.applications ?? [];
    const topScore = apps.reduce((max, app) => {
      const score = app.candidateInsight?.matchScore ?? app.matchScore ?? 0;
      return Math.max(max, score);
    }, 0);
    if (!best || topScore > best.score) {
      best = { id: c.id, score: topScore, name: `${detail.firstName} ${detail.lastName}` };
    }
  }

  if (!best?.id) throw new Error('No candidate found for AI screenshot');
  console.log(`  AI candidate: ${best.name} (${best.score}% match)`);
  return best.id;
}

async function findBestJobId(token) {
  const jobs = await fetchJson(token, '/jobs');
  const list = Array.isArray(jobs) ? jobs : jobs.data ?? jobs.items ?? [];
  const open = list.find((j) => j.status === 'OPEN') ?? list[0];
  if (!open?.id) throw new Error('No job found');
  console.log(`  Job: ${open.title}`);
  return open.id;
}

async function capture(page, name, url, { fullPage = true, delay = 800 } = {}) {
  await page.goto(`${WEB_URL}${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(delay);
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage });
  console.log(`  OK ${name}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    console.log('Logging in...');
    await login(page);
    const token = await getAuthToken(page);
    if (!token) throw new Error('Login succeeded but no JWT token in localStorage');

    const candidateId = await findBestCandidateId(token);
    const jobId = await findBestJobId(token);

    console.log('Capturing screenshots...');
    await capture(page, '01-dashboard.png', '/');
    await capture(page, '02-ai-intelligence.png', `/candidates/${candidateId}`);
    await capture(page, '03-job-details.png', `/jobs/${jobId}`);
    await capture(page, '04-pipeline.png', '/pipeline');
    await capture(page, '05-interviews.png', '/interviews');
    await capture(page, '06-analytics.png', '/analytics');

    const manifest = {
      capturedAt: new Date().toISOString(),
      viewport: '1440x900 @2x',
      urls: {
        dashboard: '/',
        aiIntelligence: `/candidates/${candidateId}`,
        jobDetails: `/jobs/${jobId}`,
        pipeline: '/pipeline',
        interviews: '/interviews',
        analytics: '/analytics',
      },
    };
    await writeFile(path.join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log(`\nDone! Screenshots saved to docs/screenshots/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('\nScreenshot capture failed:', err.message);
  console.error('\nMake sure Docker, DB seed, and dev servers are running:');
  console.error('  docker compose up -d && pnpm db:seed && pnpm dev');
  process.exit(1);
});
