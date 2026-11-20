import { useState } from 'react';
import { AnalyzerWorkspace } from './components/AnalyzerWorkspace.tsx';
import { ArchitectureView } from './components/ArchitectureView.tsx';
import { EvaluationView } from './components/EvaluationView.tsx';
import { OverviewView } from './components/OverviewView.tsx';
import { SAMPLE_ARTICLES } from './data/presentationData.ts';
import type {
  AnalysisHistoryItem,
  AnalysisResult,
  PropagationParams,
  SampleArticle,
} from './types/truthgraph.ts';

type NavTab = 'analyzer' | 'architecture' | 'evaluation' | 'overview';

const DEFAULT_PROPAGATION: PropagationParams = {
  shareVelocity: 50,
  suspiciousRatio: 25,
  cascadeDepth: 3,
  sourceDiversity: 50,
  incompleteData: false,
  platforms: ['X', 'Facebook'],
};

export default function App() {
  const initialSample = SAMPLE_ARTICLES[0];

  const [activeTab, setActiveTab] = useState<NavTab>('analyzer');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(initialSample.id);
  const [headline, setHeadline] = useState<string>(initialSample.headline);
  const [content, setContent] = useState<string>(initialSample.content);
  const [propagation, setPropagation] = useState<PropagationParams>(initialSample.propagation);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  const handleSelectSample = (sample: SampleArticle) => {
    setSelectedSampleId(sample.id);
    setHeadline(sample.headline);
    setContent(sample.content);
    setPropagation(sample.propagation);
    setAnalysis(null);
    setError(null);
  };

  const handleHeadlineChange = (val: string) => {
    setSelectedSampleId(null);
    setHeadline(val);
  };

  const handleContentChange = (val: string) => {
    setSelectedSampleId(null);
    setContent(val);
  };

  const handleNewAnalysis = () => {
    setActiveTab('analyzer');
    setSelectedSampleId(null);
    setHeadline('');
    setContent('');
    setPropagation(DEFAULT_PROPAGATION);
    setAnalysis(null);
    setError(null);
  };

  const handleRunAnalysis = async () => {
    if (!headline.trim() || !content.trim()) {
      setError('Please enter both a headline and article content before running analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, content, propagation }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || `Analysis failed with status ${response.status}.`);
      }

      const result = payload.analysis as AnalysisResult;
      setAnalysis(result);

      const matchedSample = SAMPLE_ARTICLES.find((s) => s.id === selectedSampleId);
      const timeLabel = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setHistory((prev) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: timeLabel,
          headline: headline.trim(),
          verdict: result.verdict,
          confidence: result.confidence,
          textOnlyFakeProb: result.textOnlyFakeProb,
          graphOnlyFakeProb: result.graphOnlyFakeProb,
          fusedFakeProb: result.fusedFakeProb,
          groundTruth: matchedSample?.expectedLabel,
        },
        ...prev,
      ]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to complete TruthGraph analysis. Please try again.';
      setError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const navItems: Array<{ id: NavTab; label: string }> = [
    { id: 'analyzer', label: 'Analyzer' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'evaluation', label: 'Evaluation' },
    { id: 'overview', label: 'Overview' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#analyzer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('analyzer');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            TruthGraph
          </a>

          {/* Zone 2: 4 Clean Single-Line Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-6 overflow-x-auto text-sm font-medium"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'text-slate-900 border-blue-700'
                      : 'text-slate-500 border-transparent hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={handleNewAnalysis}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              New Analysis
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-7">
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Fake News Detection Workbench
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Combines NLP article analysis with Graph Neural Network social propagation modeling to classify news as Real or Fake.
                </p>
              </div>
              <div className="text-xs text-slate-500">
                Module 1 (NLP) · Module 2 (Propagation GNN) · Module 3 (Feature Fusion)
              </div>
            </div>

            <AnalyzerWorkspace
              headline={headline}
              content={content}
              propagation={propagation}
              selectedSampleId={selectedSampleId}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              error={error}
              onHeadlineChange={handleHeadlineChange}
              onContentChange={handleContentChange}
              onPropagationChange={setPropagation}
              onSelectSample={handleSelectSample}
              onRunAnalysis={handleRunAnalysis}
            />
          </div>
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView onOpenAnalyzer={() => setActiveTab('analyzer')} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView
            history={history}
            onOpenAnalyzer={() => setActiveTab('analyzer')}
          />
        )}

        {activeTab === 'overview' && <OverviewView />}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-[1360px] mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>TruthGraph · Fake News Detection Using Text and Propagation Graphs</span>
          <span>SIMATS Engineering · Saveetha School of Engineering · CSA4705 Deep Learning</span>
        </div>
      </footer>
    </div>
  );
}
