import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AnalysisHttpError, runTruthGraphAnalysis } from './src/lib/analyzeHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();
app.use(express.json({ limit: '1mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const result = await runTruthGraphAnalysis(req.body ?? {});
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof AnalysisHttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Analysis request failed.';
    console.error('[/api/analyze] error:', message);
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthGraph server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
