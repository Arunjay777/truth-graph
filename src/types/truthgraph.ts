export type PlatformName = 'X' | 'Facebook' | 'Instagram' | 'YouTube';

export type NodeRole = 'news' | 'verified' | 'organic' | 'suspicious';

export type EdgeType = 'share' | 'reply' | 'amplify';

export interface PropagationParams {
  shareVelocity: number; // 1 (slow) to 100 (viral spike)
  suspiciousRatio: number; // 0 to 100 (% coordinated/bot-like accounts)
  cascadeDepth: number; // 1 to 5 hops from news root
  sourceDiversity: number; // 0 to 100 (% independent verified sources)
  incompleteData: boolean; // Simulates incomplete propagation data gap
  platforms: PlatformName[];
}

export interface GraphNode {
  id: string;
  label: string;
  handle: string;
  role: NodeRole;
  platform: PlatformName | 'Article';
  depth: number;
  x: number;
  y: number;
  followers: number;
  timestampMin: number;
  degree: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
}

export interface GraphMetrics {
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  avgDegree: number;
  botClusterRatio: number;
  verifiedShareRatio: number;
  burstIndex: number;
  completeness: number;
}

export interface PropagationGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: GraphMetrics;
  adjacencyPreview: {
    labels: string[];
    matrix: number[][];
  };
}

export interface NlpPreprocessingResult {
  rawWordCount: number;
  cleanTokenCount: number;
  removedStopWords: number;
  topTokens: Array<{ term: string; count: number; weight: number }>;
  exclamationCount: number;
  allCapsWordCount: number;
  avgWordLength: number;
  sampleTokens: string[];
}

export interface FlaggedPhrase {
  phrase: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  verdict: 'Real' | 'Fake';
  confidence: number; // 0-100
  textOnlyFakeProb: number; // 0-100
  graphOnlyFakeProb: number; // 0-100
  fusedFakeProb: number; // 0-100
  textAssessment: string;
  graphAssessment: string;
  fusionSummary: string;
  linguisticSignals: string[];
  propagationSignals: string[];
  flaggedPhrases: FlaggedPhrase[];
  fusionDisagreementNote: string;
}

export interface SampleArticle {
  id: string;
  title: string;
  category: string;
  expectedLabel: 'Real' | 'Fake';
  note: string;
  headline: string;
  content: string;
  propagation: PropagationParams;
}

export interface AnalysisHistoryItem {
  id: string;
  timestamp: string;
  headline: string;
  verdict: 'Real' | 'Fake';
  confidence: number;
  textOnlyFakeProb: number;
  graphOnlyFakeProb: number;
  fusedFakeProb: number;
  groundTruth?: 'Real' | 'Fake';
}
