import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Express } from 'express';

let expressApp: Express | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!expressApp) {
    const { createNestApp } = require('../dist/bootstrap') as {
      createNestApp: () => Promise<{ expressApp: Express }>;
    };
    const result = await createNestApp();
    expressApp = result.expressApp;
  }
  return expressApp(req, res);
}
