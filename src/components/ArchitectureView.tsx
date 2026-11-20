import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface PipelineStage {
  id: string;
  index: string;
  title: string;
  moduleTag: string;
  summary: string;
  inputs: string[];
  operations: string[];
  outputs: string[];
  tools: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'input',
    index: '01',
    title: 'Input Data Collection',
    moduleTag: 'Data Layer',
    summary:
      'Ingests both news article content (headline + body text) and corresponding social media engagement traces (shares, reactions, and comments across X, Facebook, Instagram, and YouTube).',
    inputs: ['News headline and full article text', 'Social post shares, replies, and follower links'],
    operations: [
      'Aligns article IDs with social sharing timestamps',
      'Collects platform-level interaction metadata',
      'Validates completeness of early propagation traces',
    ],
    outputs: ['Structured article corpus', 'Raw social interaction event logs'],
    tools: 'Python · Pandas · Social Media APIs',
  },
  {
    id: 'nlp',
    index: '02',
    title: 'Text Analysis (NLP)',
    moduleTag: 'Module 1',
    summary:
      'Cleans raw headlines and articles, removes noise and stop words, and extracts dense semantic and stylometric representations capturing misleading phrasing.',
    inputs: ['Raw news headline', 'Article body paragraphs'],
    operations: [
      'Text preprocessing: punctuation cleaning, tokenization, stop-word removal',
      'Feature extraction via TF-IDF weighting and Transformer embeddings',
      'Encodes textual cues into a fixed-length Text Feature Vector',
    ],
    outputs: ['Cleaned token stream', 'Dense Text Feature Vector (h_text)'],
    tools: 'NLTK · Hugging Face Transformers · PyTorch',
  },
  {
    id: 'gnn',
    index: '03',
    title: 'Propagation Graph & GNN',
    moduleTag: 'Module 2',
    summary:
      'Models how news spreads across accounts as a directed graph of News and User nodes, then applies Graph Neural Networks to learn neighborhood amplification patterns.',
    inputs: ['User-article sharing logs', 'Follower / repost relationships'],
    operations: [
      'Builds propagation graph G = (V, E) with News root and User nodes',
      'Constructs Node Feature Matrix (X) and Adjacency Matrix (A)',
      'Applies GNN message passing to capture bot clusters and cascade depth',
    ],
    outputs: ['Adjacency matrix & node attributes', 'Learned Graph Embeddings (h_graph)'],
    tools: 'NetworkX · PyTorch Geometric',
  },
  {
    id: 'fusion',
    index: '04',
    title: 'Feature Fusion',
    moduleTag: 'Module 3A',
    summary:
      'Combines NLP text features with GNN propagation embeddings into a joint representation so neutral-sounding fake news is caught by anomalous sharing topology.',
    inputs: ['Text Feature Vector (from NLP)', 'Graph Feature Vector (from GNN)'],
    operations: [
      'Projects both modalities into a shared latent space',
      'Concatenates and weights textual and structural representations',
      'Handles modality disagreement when propagation data is sparse',
    ],
    outputs: ['Combined Feature Vector (h_fused)'],
    tools: 'PyTorch / TensorFlow Fusion Layers',
  },
  {
    id: 'classification',
    index: '05',
    title: 'Classification & Evaluation',
    moduleTag: 'Module 3B',
    summary:
      'Passes the fused feature vector through fully connected layers and Softmax activation to classify news as Real or Fake, benchmarked using Accuracy, Precision, Recall, and F1-Score.',
    inputs: ['Combined Feature Vector (h_fused)'],
    operations: [
      'Fully Connected (Dense) classification layers + Softmax',
      'Outputs calibrated Real News / Fake News probability',
      'Evaluates performance against Text-Only and Graph-Only baselines',
    ],
    outputs: ['Final Verdict: Real News or Fake News', 'Accuracy, Precision, Recall, F1-Score'],
    tools: 'Scikit-learn · Matplotlib',
  },
];

export function ArchitectureView({ onOpenAnalyzer }: { onOpenAnalyzer: () => void }) {
  const [selectedId, setSelectedId] = useState<string>('fusion');
  const activeStage =
    PIPELINE_STAGES.find((stage) => stage.id === selectedId) ?? PIPELINE_STAGES[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">System Design · CSA4705 Deep Learning</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            TruthGraph System Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Select any stage in the dual-stream pipeline below to inspect how textual NLP embeddings and social propagation GNN embeddings fuse for final classification.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAnalyzer}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
        >
          Test Pipeline Live
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Dual-Stream Flow Diagram */}
      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr_1fr_1fr] gap-4 items-stretch">
          {/* Column 1: Input */}
          <button
            type="button"
            onClick={() => setSelectedId('input')}
            className={`text-left p-4 rounded-md border transition-colors flex flex-col justify-between ${
              selectedId === 'input'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="text-xs font-mono text-slate-500">01 · Data Layer</div>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">Input Data</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                News Article (Headline + Content) & Social Media Data (Shares, Reactions, Comments)
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-200">
              Dual-source ingestion
            </div>
          </button>

          {/* Column 2: Parallel Streams (NLP + GNN) */}
          <div className="grid grid-rows-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedId('nlp')}
              className={`text-left p-4 rounded-md border transition-colors ${
                selectedId === 'nlp'
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-mono text-slate-500">02 · Module 1</div>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Text Analysis (NLP)
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">
                Preprocessing → TF-IDF / Embeddings → Text Feature Vector
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedId('gnn')}
              className={`text-left p-4 rounded-md border transition-colors ${
                selectedId === 'gnn'
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-mono text-slate-500">03 · Module 2</div>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Propagation Graph & GNN
              </h3>
              <p className="text-xs text-slate-600 mt-1.5">
                Graph Construction (Nodes + Adjacency) → GNN → Graph Embeddings
              </p>
            </button>
          </div>

          {/* Column 3: Feature Fusion */}
          <button
            type="button"
            onClick={() => setSelectedId('fusion')}
            className={`text-left p-4 rounded-md border transition-colors flex flex-col justify-between ${
              selectedId === 'fusion'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="text-xs font-mono text-slate-500">04 · Module 3A</div>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">Feature Fusion</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Combines Text Features (NLP) + Graph Features (GNN) into a unified vector.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-200">
              h_fused = [h_text ⊕ h_graph]
            </div>
          </button>

          {/* Column 4: Classification & Output */}
          <button
            type="button"
            onClick={() => setSelectedId('classification')}
            className={`text-left p-4 rounded-md border transition-colors flex flex-col justify-between ${
              selectedId === 'classification'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="text-xs font-mono text-slate-500">05 · Module 3B</div>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Classification & Evaluation
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Fully Connected Layers + Softmax → Real News or Fake News + Metrics.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 mt-4 pt-3 border-t border-slate-200">
              Acc · Prec · Rec · F1
            </div>
          </button>
        </div>
      </section>

      {/* Selected Stage Deep-Dive */}
      <section className="bg-white border border-slate-200 rounded-lg">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-blue-700">
              Stage {activeStage.index} · {activeStage.moduleTag}
            </span>
            <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
              {activeStage.title}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">{activeStage.tools}</span>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
            {activeStage.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5 border-t border-slate-200 text-xs">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Inputs</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                {activeStage.inputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Core Operations</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                {activeStage.operations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Outputs</h4>
              <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                {activeStage.outputs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
