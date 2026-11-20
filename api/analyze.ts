import { AnalysisHttpError, runTruthGraphAnalysis } from '../src/lib/analyzeHandler.ts';
import type { AnalyzePayload } from '../src/lib/analyzeHandler.ts';

interface VercelRequestLike {
  method?: string;
  body?: AnalyzePayload | string;
}

interface VercelResponseLike {
  status: (code: number) => VercelResponseLike;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  try {
    const body: AnalyzePayload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const result = await runTruthGraphAnalysis(body);
    res.status(200).json(result);
  } catch (err: unknown) {
    if (err instanceof AnalysisHttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    const message = err instanceof Error ? err.message : 'Analysis request failed.';
    console.error('[api/analyze] error:', message);
    res.status(500).json({ error: message });
  }
}
