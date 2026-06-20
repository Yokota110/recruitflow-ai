declare const require: (moduleName: string) => unknown;

let expressApp: ((req: unknown, res: unknown) => void) | undefined;

export default async function handler(req: unknown, res: unknown) {
  if (!expressApp) {
    const { createNestApp } = require('../apps/api/dist/bootstrap') as {
      createNestApp: () => Promise<{ expressApp: (req: unknown, res: unknown) => void }>;
    };
    const result = await createNestApp();
    expressApp = result.expressApp;
  }

  return expressApp(req, res);
}
