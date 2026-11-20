import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { buildPropagationGraph, runNlpPreprocessing } from './truthgraphEngine.ts';
import type { AnalysisResult, PropagationParams } from '../types/truthgraph.ts';

export interface AnalyzePayload {
  headline?: string;
  content?: string;
  propagation?: PropagationParams;
}

export class AnalysisHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AnalysisHttpError(
      500,
      'GEMINI_API_KEY is not configured. Add it in your environment variables.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function runTruthGraphAnalysis(payload: AnalyzePayload) {
  const cleanHeadline = (payload.headline ?? '').trim();
  const cleanContent = (payload.content ?? '').trim();

  if (!cleanHeadline || !cleanContent) {
    throw new AnalysisHttpError(
      400,
      'Both a news headline and article content are required.'
    );
  }

  const safePropagation: PropagationParams = {
    shareVelocity: Math.min(100, Math.max(1, Number(payload.propagation?.shareVelocity ?? 50))),
    suspiciousRatio: Math.min(100, Math.max(0, Number(payload.propagation?.suspiciousRatio ?? 25))),
    cascadeDepth: Math.min(5, Math.max(1, Number(payload.propagation?.cascadeDepth ?? 3))),
    sourceDiversity: Math.min(100, Math.max(0, Number(payload.propagation?.sourceDiversity ?? 50))),
    incompleteData: Boolean(payload.propagation?.incompleteData),
    platforms:
      Array.isArray(payload.propagation?.platforms) && payload.propagation.platforms.length > 0
        ? payload.propagation.platforms
        : ['X', 'Facebook'],
  };

  const nlp = runNlpPreprocessing(cleanHeadline, cleanContent);
  const graph = buildPropagationGraph(cleanHeadline, safePropagation);
  const ai = getGeminiClient();

  const prompt = [
    'You are the TruthGraph Fake News Detection inference engine (combining Module 1: NLP Text Analysis, Module 2: Social Propagation Graph GNN Analysis, and Module 3: Feature Fusion Classification).',
    '',
    'Evaluate the following news article and its observed social media propagation graph metrics independently, then perform feature fusion to classify the article as Real or Fake.',
    '',
    `HEADLINE: ${cleanHeadline}`,
    `CONTENT: ${cleanContent}`,
    '',
    'MODULE 1 (NLP PREPROCESSING SUMMARY):',
    `- Raw words: ${nlp.rawWordCount}, Clean tokens: ${nlp.cleanTokenCount}, Removed stop words: ${nlp.removedStopWords}`,
    `- Exclamation marks: ${nlp.exclamationCount}, ALL-CAPS words: ${nlp.allCapsWordCount}`,
    `- Top weighted tokens: ${nlp.topTokens.map((t) => `${t.term} (${t.weight})`).join(', ')}`,
    '',
    'MODULE 2 (PROPAGATION GRAPH SUMMARY):',
    `- Platforms: ${safePropagation.platforms.join(', ')}`,
    `- Graph nodes: ${graph.metrics.nodeCount}, Directed edges: ${graph.metrics.edgeCount}, Max cascade depth: ${graph.metrics.maxDepth}`,
    `- Average node degree: ${graph.metrics.avgDegree}, Burst index: ${graph.metrics.burstIndex}`,
    `- Coordinated/suspicious bot cluster ratio: ${graph.metrics.botClusterRatio}%`,
    `- Verified independent source share ratio: ${graph.metrics.verifiedShareRatio}%`,
    `- Propagation data completeness: ${graph.metrics.completeness}% (${safePropagation.incompleteData ? 'INCOMPLETE EARLY DATA' : 'COMPLETE TRACE'})`,
    '',
    'SCORING RULES:',
    '- textOnlyFakeProb (0-100): Probability the article is Fake looking ONLY at the text content and linguistic style (note: formal, neutral fake rumors should have a moderate/lower textOnlyFakeProb around 30-55 if the prose sounds plausible, whereas sensational clickbait has high 80-98).',
    '- graphOnlyFakeProb (0-100): Probability the article is Fake looking ONLY at the propagation graph structure (high bot cluster ratio + high burst + low verified source diversity => high 75-97; high verified sources + low bots => low 5-25; incomplete data => more uncertain, nearer 40-65).',
    '- fusedFakeProb (0-100): TruthGraph combined feature-fusion Fake probability weighing both modalities (if propagation data is incomplete, lean more on text features and note the lower graph weight).',
    '- verdict: "Fake" if fusedFakeProb >= 50 else "Real".',
    '- confidence (50-99): Overall classification confidence aligned with distance of fusedFakeProb from 50.',
    '- Keep explanations concise, empirical, and specific to this article and graph.',
  ].join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: {
            type: Type.STRING,
            description: 'Final classification: strictly "Real" or "Fake".',
          },
          confidence: {
            type: Type.NUMBER,
            description: 'Overall confidence score from 50 to 99.',
          },
          textOnlyFakeProb: {
            type: Type.NUMBER,
            description: 'Fake probability from Module 1 NLP text analysis alone (0 to 100).',
          },
          graphOnlyFakeProb: {
            type: Type.NUMBER,
            description: 'Fake probability from Module 2 GNN propagation graph alone (0 to 100).',
          },
          fusedFakeProb: {
            type: Type.NUMBER,
            description: 'Final TruthGraph fused Fake probability (0 to 100).',
          },
          textAssessment: {
            type: Type.STRING,
            description: 'Concise 2-sentence assessment of linguistic patterns, claims, and credibility cues.',
          },
          graphAssessment: {
            type: Type.STRING,
            description: 'Concise 2-sentence assessment of sharing topology, velocity, bot clustering, and source diversity.',
          },
          fusionSummary: {
            type: Type.STRING,
            description: 'Concise 2-sentence explanation of how combining text and graph features produced the final verdict.',
          },
          linguisticSignals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 4 concise textual cues identified in the headline or body.',
          },
          propagationSignals: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '3 to 4 concise propagation patterns observed in the graph metrics.',
          },
          flaggedPhrases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phrase: { type: Type.STRING, description: 'Exact short quote from the article.' },
                reason: { type: Type.STRING, description: 'Why this phrase raises or lowers credibility.' },
                severity: { type: Type.STRING, description: 'One of: high, medium, low.' },
              },
              required: ['phrase', 'reason', 'severity'],
            },
            description: 'Up to 3 notable phrases from the headline or content.',
          },
          fusionDisagreementNote: {
            type: Type.STRING,
            description: 'One sentence describing whether text and graph modules agreed or whether fusion resolved a conflict.',
          },
        },
        required: [
          'verdict',
          'confidence',
          'textOnlyFakeProb',
          'graphOnlyFakeProb',
          'fusedFakeProb',
          'textAssessment',
          'graphAssessment',
          'fusionSummary',
          'linguisticSignals',
          'propagationSignals',
          'flaggedPhrases',
          'fusionDisagreementNote',
        ],
      },
    },
  });

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new AnalysisHttpError(502, 'Model returned an empty analysis payload.');
  }

  const parsed = JSON.parse(rawText);
  const normalizedVerdict: 'Real' | 'Fake' =
    String(parsed.verdict).toLowerCase() === 'fake' ? 'Fake' : 'Real';

  const analysis: AnalysisResult = {
    verdict: normalizedVerdict,
    confidence: Math.round(Math.min(99, Math.max(50, Number(parsed.confidence) || 75))),
    textOnlyFakeProb: Math.round(Math.min(100, Math.max(0, Number(parsed.textOnlyFakeProb) || 50))),
    graphOnlyFakeProb: Math.round(Math.min(100, Math.max(0, Number(parsed.graphOnlyFakeProb) || 50))),
    fusedFakeProb: Math.round(Math.min(100, Math.max(0, Number(parsed.fusedFakeProb) || 50))),
    textAssessment: String(parsed.textAssessment || ''),
    graphAssessment: String(parsed.graphAssessment || ''),
    fusionSummary: String(parsed.fusionSummary || ''),
    linguisticSignals: Array.isArray(parsed.linguisticSignals)
      ? parsed.linguisticSignals.slice(0, 4)
      : [],
    propagationSignals: Array.isArray(parsed.propagationSignals)
      ? parsed.propagationSignals.slice(0, 4)
      : [],
    flaggedPhrases: Array.isArray(parsed.flaggedPhrases) ? parsed.flaggedPhrases.slice(0, 3) : [],
    fusionDisagreementNote: String(parsed.fusionDisagreementNote || ''),
  };

  return { nlp, graph, analysis };
}
