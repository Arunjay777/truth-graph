import { useState } from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { MODEL_BENCHMARKS } from '../data/presentationData.ts';
import type { AnalysisHistoryItem } from '../types/truthgraph.ts';

type MetricKey = 'accuracy' | 'precision' | 'recall' | 'f1';

const METRICS: Array<{ key: MetricKey; label: string }> = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
  { key: 'f1', label: 'F1-Score' },
];

export function EvaluationView({
  history,
  onOpenAnalyzer,
}: {
  history: AnalysisHistoryItem[];
  onOpenAnalyzer: () => void;
}) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('f1');
  const truthGraph = MODEL_BENCHMARKS[2];

  const verifiedRuns = history.filter((item) => item.groundTruth !== undefined);
  const matchedRuns = verifiedRuns.filter((item) => item.verdict === item.groundTruth);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-slate-500">Module 3 · Model Evaluation & Comparison</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">
          Evaluation Metrics & Ablation Study
        </h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Comparing Text-Only NLP, Graph-Only GNN, and Combined TruthGraph Feature Fusion across standard classification metrics.
        </p>
      </div>

      {/* 4-column KPI Strip for TruthGraph Fusion */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-lg divide-y lg:divide-y-0 divide-x divide-slate-200">
        {METRICS.map((metric) => {
          const val = truthGraph[metric.key];
          const textDelta = (val - MODEL_BENCHMARKS[0][metric.key]).toFixed(1);
          return (
            <div key={metric.key} className="p-5">
              <div className="text-xs text-slate-500">TruthGraph {metric.label}</div>
              <div className="text-3xl font-mono font-bold tabular-nums text-slate-900 mt-1">
                {val.toFixed(1)}
                <span className="text-sm font-normal text-slate-400 ml-1">%</span>
              </div>
              <div className="text-xs font-mono tabular-nums text-emerald-700 mt-1.5">
                +{textDelta}% vs Text-Only
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Metric Comparison Bar Chart + Table */}
      <section className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Approach Comparison by Metric
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluates how combining text features and propagation graph embeddings reduces classification errors
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
            {METRICS.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => setSelectedMetric(metric.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {MODEL_BENCHMARKS.map((row) => {
            const score = row[selectedMetric];
            return (
              <div key={row.model}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs mb-1.5">
                  <div>
                    <span
                      className={
                        row.highlight
                          ? 'font-semibold text-slate-900'
                          : 'font-medium text-slate-700'
                      }
                    >
                      {row.model}
                    </span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-500">{row.scope}</span>
                  </div>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    {score.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      row.highlight ? 'bg-blue-700' : 'bg-slate-400'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{row.note}</p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-200 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <th className="py-3 px-6 font-medium">Model Architecture</th>
                <th className="py-3 px-4 font-medium">Modality Scope</th>
                <th className="py-3 px-4 font-medium text-right">Accuracy</th>
                <th className="py-3 px-4 font-medium text-right">Precision</th>
                <th className="py-3 px-4 font-medium text-right">Recall</th>
                <th className="py-3 px-6 font-medium text-right">F1-Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODEL_BENCHMARKS.map((row) => (
                <tr
                  key={row.model}
                  className={row.highlight ? 'bg-blue-50/40' : 'hover:bg-slate-50'}
                >
                  <td className="py-3 px-6 font-medium text-slate-900">{row.model}</td>
                  <td className="py-3 px-4 text-slate-600">{row.scope}</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {row.accuracy.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {row.precision.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                    {row.recall.toFixed(1)}%
                  </td>
                  <td className="py-3 px-6 text-right font-mono tabular-nums font-semibold text-slate-900">
                    {row.f1.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Session Analysis History */}
      <section className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Live Session Classification Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Articles evaluated in this browser session via TruthGraph inference
            </p>
          </div>
          {verifiedRuns.length > 0 && (
            <div className="text-xs font-mono tabular-nums text-slate-700">
              Sample Match Rate: {matchedRuns.length}/{verifiedRuns.length} (
              {Math.round((matchedRuns.length / verifiedRuns.length) * 100)}%)
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-900">No articles analyzed yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Run an article through the TruthGraph Analyzer to log Text-Only, Graph-Only, and Fused probabilities here.
            </p>
            <button
              type="button"
              onClick={onOpenAnalyzer}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors"
            >
              Go to Analyzer
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="py-3 px-6 font-medium">Time</th>
                  <th className="py-3 px-4 font-medium">Headline</th>
                  <th className="py-3 px-4 font-medium text-right">Text Fake %</th>
                  <th className="py-3 px-4 font-medium text-right">Graph Fake %</th>
                  <th className="py-3 px-4 font-medium text-right">Fused Fake %</th>
                  <th className="py-3 px-6 font-medium text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-6 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-md truncate">
                      {item.headline}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {item.textOnlyFakeProb}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      {item.graphOnlyFakeProb}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {item.fusedFakeProb}%
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          item.verdict === 'Real' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {item.verdict === 'Real' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {item.verdict} ({item.confidence}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
