import { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Play,
  XCircle,
} from 'lucide-react';
import { SAMPLE_ARTICLES } from '../data/presentationData.ts';
import { buildPropagationGraph, runNlpPreprocessing } from '../lib/truthgraphEngine.ts';
import type {
  AnalysisResult,
  PlatformName,
  PropagationParams,
  SampleArticle,
} from '../types/truthgraph.ts';
import { PropagationGraphCanvas } from './PropagationGraphCanvas.tsx';

interface AnalyzerWorkspaceProps {
  headline: string;
  content: string;
  propagation: PropagationParams;
  selectedSampleId: string | null;
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  onHeadlineChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onPropagationChange: (next: PropagationParams) => void;
  onSelectSample: (sample: SampleArticle) => void;
  onRunAnalysis: () => void;
}

const ALL_PLATFORMS: PlatformName[] = ['X', 'Facebook', 'Instagram', 'YouTube'];

function ProbabilityBar({
  label,
  sublabel,
  fakeProb,
  emphasized = false,
}: {
  label: string;
  sublabel: string;
  fakeProb: number;
  emphasized?: boolean;
}) {
  const isFake = fakeProb >= 50;
  const barColor = isFake ? 'bg-red-600' : 'bg-emerald-600';
  const verdictText = isFake ? 'Fake' : 'Real';

  return (
    <div className={emphasized ? 'pt-3 border-t border-slate-200' : ''}>
      <div className="flex items-baseline justify-between gap-2 text-xs mb-1.5">
        <div>
          <span className={emphasized ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}>
            {label}
          </span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span className="text-slate-500">{sublabel}</span>
        </div>
        <div className="font-mono tabular-nums font-semibold shrink-0">
          <span className={isFake ? 'text-red-700' : 'text-emerald-700'}>
            {fakeProb}% Fake ({verdictText})
          </span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-sm overflow-hidden">
        <div
          className={`h-full ${barColor} transition-transform duration-300 origin-left`}
          style={{ width: `${Math.max(4, fakeProb)}%` }}
        />
      </div>
    </div>
  );
}

export function AnalyzerWorkspace({
  headline,
  content,
  propagation,
  selectedSampleId,
  analysis,
  isAnalyzing,
  error,
  onHeadlineChange,
  onContentChange,
  onPropagationChange,
  onSelectSample,
  onRunAnalysis,
}: AnalyzerWorkspaceProps) {
  const nlp = useMemo(() => runNlpPreprocessing(headline, content), [headline, content]);
  const graph = useMemo(
    () => buildPropagationGraph(headline, propagation),
    [headline, propagation]
  );

  const togglePlatform = (platform: PlatformName) => {
    const exists = propagation.platforms.includes(platform);
    const nextPlatforms = exists
      ? propagation.platforms.filter((p) => p !== platform)
      : [...propagation.platforms, platform];
    onPropagationChange({
      ...propagation,
      platforms: nextPlatforms.length > 0 ? nextPlatforms : [platform],
    });
  };

  const canAnalyze = headline.trim().length > 0 && content.trim().length > 0 && !isAnalyzing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
      {/* Left Control Column */}
      <aside className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-200">
        {/* Sample Presets */}
        <div className="p-5">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Sample Test Cases</h2>
            <span className="text-xs text-slate-500">Click to load</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {SAMPLE_ARTICLES.map((sample) => {
              const active = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className={`text-left px-3.5 py-2.5 rounded-md border transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-50/60'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {sample.title}
                    </span>
                    <span
                      className={`text-[11px] font-mono shrink-0 ${
                        sample.expectedLabel === 'Fake' ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      Expected: {sample.expectedLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{sample.category}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Article Input */}
        <div className="p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">News Article Input</h2>

          <div>
            <label
              htmlFor="article-headline"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Headline
            </label>
            <input
              id="article-headline"
              type="text"
              value={headline}
              onChange={(e) => onHeadlineChange(e.target.value)}
              placeholder="Enter news headline to analyze..."
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="article-content"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Article Content
            </label>
            <textarea
              id="article-content"
              rows={5}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Paste the article body text..."
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Social Propagation Controls */}
        <div className="p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Social Propagation Trace</h2>
            <span className="text-xs text-slate-500">Module 2 inputs</span>
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-700 mb-1.5">
              Active Platforms
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {ALL_PLATFORMS.map((platform) => {
                const selected = propagation.platforms.includes(platform);
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`py-1.5 px-2 text-xs font-medium rounded border whitespace-nowrap transition-colors ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {platform}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-velocity" className="text-slate-700 font-medium">
                  Share Velocity
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {propagation.shareVelocity}/100
                </span>
              </div>
              <input
                id="slider-velocity"
                type="range"
                min={5}
                max={100}
                value={propagation.shareVelocity}
                onChange={(e) =>
                  onPropagationChange({ ...propagation, shareVelocity: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-bots" className="text-slate-700 font-medium">
                  Coordinated / Bot Account Ratio
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {propagation.suspiciousRatio}%
                </span>
              </div>
              <input
                id="slider-bots"
                type="range"
                min={0}
                max={95}
                value={propagation.suspiciousRatio}
                onChange={(e) =>
                  onPropagationChange({ ...propagation, suspiciousRatio: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-diversity" className="text-slate-700 font-medium">
                  Verified Source Diversity
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {propagation.sourceDiversity}%
                </span>
              </div>
              <input
                id="slider-diversity"
                type="range"
                min={0}
                max={100}
                value={propagation.sourceDiversity}
                onChange={(e) =>
                  onPropagationChange({ ...propagation, sourceDiversity: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="slider-depth" className="text-slate-700 font-medium">
                  Cascade Depth (Hops)
                </label>
                <span className="font-mono tabular-nums text-slate-900">
                  {propagation.cascadeDepth} hops
                </span>
              </div>
              <input
                id="slider-depth"
                type="range"
                min={1}
                max={5}
                value={propagation.cascadeDepth}
                onChange={(e) =>
                  onPropagationChange({ ...propagation, cascadeDepth: Number(e.target.value) })
                }
                className="w-full accent-blue-700"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={propagation.incompleteData}
              onChange={(e) =>
                onPropagationChange({ ...propagation, incompleteData: e.target.checked })
              }
              className="mt-0.5 rounded border-slate-300 accent-blue-700"
            />
            <span>
              Simulate incomplete propagation data (tests early-stage sharing gap from Slide 5)
            </span>
          </label>
        </div>

        {/* Action Footer */}
        <div className="p-5">
          <button
            type="button"
            disabled={!canAnalyze}
            onClick={onRunAnalysis}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running NLP + GNN Fusion...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Analyze Article
              </>
            )}
          </button>

          {error && (
            <div
              role="alert"
              className="mt-3 p-3 text-xs text-red-800 bg-red-50 border border-red-200 rounded-md flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-700" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Right Main Analysis Stage */}
      <div className="space-y-6 min-w-0">
        {/* Module 3: Combined Classification Verdict */}
        <section className="bg-white border border-slate-200 rounded-lg">
          {isAnalyzing ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
                <span>Executing TruthGraph feature fusion across NLP and GNN modules...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="h-14 bg-slate-100 rounded animate-pulse" />
                <div className="h-14 bg-slate-100 rounded animate-pulse" />
                <div className="h-14 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
          ) : analysis ? (
            <div>
              {/* Verdict banner */}
              <div className="px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {analysis.verdict === 'Real' ? (
                    <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-7 h-7 text-red-700 shrink-0" />
                  )}
                  <div>
                    <div className="text-xs text-slate-500">
                      Module 3 · Combined Prediction Result
                    </div>
                    <h2
                      className={`text-2xl font-bold tracking-tight ${
                        analysis.verdict === 'Real' ? 'text-emerald-800' : 'text-red-800'
                      }`}
                    >
                      {analysis.verdict === 'Real' ? 'Real News' : 'Fake News'}
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-500">Fusion Confidence</div>
                  <div className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                    {analysis.confidence}%
                  </div>
                </div>
              </div>

              {/* Modality probability bars */}
              <div className="p-6 space-y-4">
                <ProbabilityBar
                  label="Module 1: Text-Only NLP"
                  sublabel="Headline & linguistic content"
                  fakeProb={analysis.textOnlyFakeProb}
                />
                <ProbabilityBar
                  label="Module 2: Graph-Only GNN"
                  sublabel="Social sharing topology"
                  fakeProb={analysis.graphOnlyFakeProb}
                />
                <ProbabilityBar
                  label="Module 3: TruthGraph Combined Fusion"
                  sublabel="Joint text + graph classifier"
                  fakeProb={analysis.fusedFakeProb}
                  emphasized
                />

                {analysis.fusionDisagreementNote && (
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-md px-3.5 py-2.5">
                    <span className="font-semibold text-slate-900">Fusion Insight: </span>
                    {analysis.fusionDisagreementNote}
                  </p>
                )}

                {/* Concise 3-column attribution */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-200 text-xs leading-relaxed">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1.5">Text Analysis (NLP)</h4>
                    <p className="text-slate-600">{analysis.textAssessment}</p>
                    {analysis.linguisticSignals.length > 0 && (
                      <ul className="mt-2.5 space-y-1 text-slate-700 list-disc pl-4">
                        {analysis.linguisticSignals.map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1.5">
                      Propagation Graph (GNN)
                    </h4>
                    <p className="text-slate-600">{analysis.graphAssessment}</p>
                    {analysis.propagationSignals.length > 0 && (
                      <ul className="mt-2.5 space-y-1 text-slate-700 list-disc pl-4">
                        {analysis.propagationSignals.map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1.5">Combined Decision</h4>
                    <p className="text-slate-600">{analysis.fusionSummary}</p>
                    {analysis.flaggedPhrases.length > 0 && (
                      <div className="mt-2.5 space-y-2">
                        {analysis.flaggedPhrases.map((item, i) => (
                          <div key={i} className="text-slate-700">
                            <span className="font-mono text-[11px] text-slate-900 font-medium">
                              “{item.phrase}”
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {item.reason}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <div className="text-xs text-slate-500">Module 3 · Combined Prediction Ready</div>
                <h2 className="text-lg font-semibold text-slate-900 mt-1">
                  Run TruthGraph Feature Fusion
                </h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  Adjust the article text or social propagation sliders on the left, then run classification to compare Text-Only NLP, Graph-Only GNN, and Combined TruthGraph predictions.
                </p>
              </div>
              <button
                type="button"
                disabled={!canAnalyze}
                onClick={onRunAnalysis}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
              >
                Analyze Article
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* Module 2: Live Interactive Propagation Graph */}
        <PropagationGraphCanvas
          graph={graph}
          incompleteData={propagation.incompleteData}
        />

        {/* Module 1: Text Preprocessing & Feature Extraction */}
        <section className="bg-white border border-slate-200 rounded-lg">
          <div className="px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Module 1. Text Preprocessing & Feature Extraction
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live cleaning, tokenization, stop-word removal, and TF-IDF salience weights
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-500">
              {nlp.rawWordCount} raw words · {nlp.cleanTokenCount} tokens · {nlp.removedStopWords} stop words removed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Weighted Terms */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-slate-700 mb-3">
                Extracted Feature Vector Terms (Top 8)
              </h4>
              {nlp.topTokens.length > 0 ? (
                <div className="space-y-2.5">
                  {nlp.topTokens.slice(0, 8).map((item) => (
                    <div key={item.term} className="grid grid-cols-[110px_1fr_48px] items-center gap-3 text-xs">
                      <span className="font-mono text-slate-800 truncate">{item.term}</span>
                      <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-blue-700"
                          style={{ width: `${Math.min(100, Math.round((item.weight / 1.4) * 100))}%` }}
                        />
                      </div>
                      <span className="font-mono tabular-nums text-right text-slate-600">
                        {item.weight.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Enter a headline and article body to inspect extracted NLP tokens.
                </p>
              )}
            </div>

            {/* Preprocessing Metrics & Clean Token Stream */}
            <div className="p-5 space-y-4">
              <h4 className="text-xs font-semibold text-slate-700">
                Stylometric & Tokenization Diagnostics
              </h4>
              <dl className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <dt className="text-slate-500">Avg Token Length</dt>
                  <dd className="text-base font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                    {nlp.avgWordLength} chars
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Stop-Word Reduction</dt>
                  <dd className="text-base font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                    {nlp.rawWordCount > 0
                      ? `${Math.round((nlp.removedStopWords / nlp.rawWordCount) * 100)}%`
                      : '0%'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Exclamation Marks</dt>
                  <dd className="text-base font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                    {nlp.exclamationCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">ALL-CAPS Words</dt>
                  <dd className="text-base font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
                    {nlp.allCapsWordCount}
                  </dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-slate-200">
                <div className="text-xs text-slate-500 mb-1.5">Cleaned Token Sequence</div>
                <p className="text-xs font-mono text-slate-700 leading-relaxed break-words">
                  {nlp.sampleTokens.length > 0
                    ? nlp.sampleTokens.join(' · ')
                    : 'No tokens extracted yet.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
