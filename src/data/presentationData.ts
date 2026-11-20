import type { SampleArticle } from '../types/truthgraph.ts';

export const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    id: 'disguised-financial',
    title: 'Disguised Policy Rumor',
    category: 'Neutral Text · Suspicious Graph',
    expectedLabel: 'Fake',
    note: 'Uses formal, realistic language that fools text-only models, but spreads via a coordinated bot burst.',
    headline: 'Reserve Bank Confirms Nationwide Digital Wallet Transition Starting Next Month',
    content:
      'According to an unverified circular attributed to senior banking officials, commercial banks will begin automatically converting savings balances above 50,000 into programmable digital tokens starting on the first of next month. Analysts cited in the report stated that account holders who do not opt out through a third-party registration portal before Friday may face temporary withdrawal restrictions during the transition phase.',
    propagation: {
      shareVelocity: 88,
      suspiciousRatio: 74,
      cascadeDepth: 4,
      sourceDiversity: 12,
      incompleteData: false,
      platforms: ['X', 'Facebook', 'Instagram'],
    },
  },
  {
    id: 'verified-science',
    title: 'Grid Battery Storage Report',
    category: 'Objective Text · Organic Graph',
    expectedLabel: 'Real',
    note: 'Measured reporting corroborated by verified news desks and steady multi-platform discussion.',
    headline: 'National Grid Operators Report 24% Rise in Utility-Scale Battery Storage Capacity',
    content:
      'Quarterly infrastructure filings published by the Energy Statistics Bureau show utility-scale lithium-iron-phosphate storage installations grew by 24 percent over the past twelve months. Regional grid operators attributed the increase to lower cell manufacturing costs and updated interconnection rules that allow storage facilities to participate in peak-hour frequency stabilization.',
    propagation: {
      shareVelocity: 36,
      suspiciousRatio: 8,
      cascadeDepth: 3,
      sourceDiversity: 82,
      incompleteData: false,
      platforms: ['X', 'YouTube'],
    },
  },
  {
    id: 'sensational-hoax',
    title: 'Viral Health Hoax',
    category: 'Sensational Text · Bot Cascade',
    expectedLabel: 'Fake',
    note: 'High emotional urgency, unverified cure claims, and rapid echo-chamber amplification.',
    headline: 'SHOCKING LEAK!! Doctors Hide Simple Kitchen Spice That Reverses Diabetes Overnight!',
    content:
      'SHARE THIS BEFORE IT GETS DELETED!! A whistleblower lab technician just revealed that pharmaceutical companies spent billions burying a 3-ingredient spice mixture that eliminates high blood sugar in 48 hours without any medication. Thousands of people are already throwing away their prescriptions after watching the secret clip!',
    propagation: {
      shareVelocity: 94,
      suspiciousRatio: 82,
      cascadeDepth: 5,
      sourceDiversity: 6,
      incompleteData: false,
      platforms: ['Facebook', 'Instagram', 'YouTube'],
    },
  },
  {
    id: 'civic-transit',
    title: 'Metro Rail Expansion Update',
    category: 'Journalistic Text · Verified Cascade',
    expectedLabel: 'Real',
    note: 'Official municipal announcement shared primarily by local journalists and civic organizations.',
    headline: 'Metropolitan Transit Authority Approves Phase II Signaling Upgrade on Blue Line',
    content:
      'The Metropolitan Transit Authority board voted unanimously on Tuesday to fund a 180-million communication-based train control upgrade along the 22-kilometer Blue Line corridor. Engineering teams expect the phased weekend installation to reduce peak headway from six minutes to three and a half minutes by late next year, with public service advisories posted two weeks ahead of each maintenance window.',
    propagation: {
      shareVelocity: 42,
      suspiciousRatio: 10,
      cascadeDepth: 3,
      sourceDiversity: 78,
      incompleteData: false,
      platforms: ['X', 'Facebook'],
    },
  },
];

export const MODEL_BENCHMARKS = [
  {
    model: 'Text-Only Baseline (NLP / TF-IDF + BiLSTM)',
    scope: 'Module 1 Only',
    accuracy: 84.6,
    precision: 83.2,
    recall: 85.4,
    f1: 84.3,
    highlight: false,
    note: 'Struggles when disinformation imitates neutral journalistic phrasing.',
  },
  {
    model: 'Graph-Only Baseline (Propagation GNN)',
    scope: 'Module 2 Only',
    accuracy: 88.1,
    precision: 87.5,
    recall: 88.9,
    f1: 88.2,
    highlight: false,
    note: 'Sensitive to incomplete early sharing traces or sparse cascades.',
  },
  {
    model: 'TruthGraph Combined Fusion (NLP + GNN)',
    scope: 'Module 3 Fusion',
    accuracy: 94.8,
    precision: 94.2,
    recall: 95.3,
    f1: 94.7,
    highlight: true,
    note: 'Fuses semantic text vectors with learned social propagation embeddings.',
  },
];

export const LITERATURE_SURVEY = [
  {
    authors: 'Lakzaei et al. (2024)',
    venue: 'Springer Nature Link',
    techniques: 'Graph Neural Networks (GNNs)',
    existingWork: 'Surveyed graph-based disinformation detection methods.',
    findings: 'Identified strengths of graph learning and challenges in early detection.',
  },
  {
    authors: 'Jing et al. (2025)',
    venue: 'ScienceDirect',
    techniques: 'Dynamic propagation graphs, Transformer',
    existingWork: 'Proposed DPSG for modeling dynamic social propagation and multimodal news features.',
    findings: 'Experiments on three datasets demonstrated the effectiveness of dynamic propagation fusion.',
  },
  {
    authors: 'Yang et al. (2025)',
    venue: 'DOI',
    techniques: 'Graph structure and semantic fusion',
    existingWork: 'Proposed GS²F to integrate multimodal news features through graph-based learning.',
    findings: 'Graph structure and guided feature fusion effectively model relationships between modalities.',
  },
  {
    authors: 'Hu et al. (2025)',
    venue: 'ACL Anthology',
    techniques: 'Large Language Models and label propagation',
    existingWork: 'Proposed GLPN-LLM to combine LLM-generated pseudo-labels with global label propagation.',
    findings: 'Experiments showed consistent improvements over compared baseline methods.',
  },
];

export const RESEARCH_GAPS = [
  {
    title: 'Limited Text Analysis',
    detail: 'Text-based methods alone often fail to identify complex misinformation written in neutral, real-news style.',
  },
  {
    title: 'Incomplete Propagation Data',
    detail: 'Missing or early-stage social sharing records can reduce the reliability of purely graph-based detectors.',
  },
  {
    title: 'Dynamic News Spread',
    detail: 'Static graph snapshots do not always capture how news cascades evolve rapidly over time.',
  },
  {
    title: 'Feature Integration',
    detail: 'Aligning high-dimensional NLP embeddings with structural GNN representations remains challenging.',
  },
  {
    title: 'Generalization Issues',
    detail: 'Detection performance can vary across datasets, domains, and different social media platforms.',
  },
];

export const SDG_GOALS = [
  {
    code: 'SDG 4',
    title: 'Quality Education',
    description: 'Promotes digital media literacy, critical awareness, and equitable access to reliable information.',
  },
  {
    code: 'SDG 9',
    title: 'Industry, Innovation and Infrastructure',
    description: 'Advances AI and deep learning research infrastructure for automated misinformation verification.',
  },
  {
    code: 'SDG 16',
    title: 'Peace, Justice and Strong Institutions',
    description: 'Supports trustworthy public discourse and helps safeguard civic institutions against coordinated hoaxes.',
  },
];

export const ADVANTAGES = [
  'Combines NLP and Graph Neural Networks for complementary fake news detection.',
  'Analyzes both linguistic article content and social sharing topology.',
  'Identifies subtle misleading patterns even when prose appears credible.',
  'Supports transparent Real vs. Fake classification with probability attribution.',
  'Evaluated rigorously with Accuracy, Precision, Recall, and F1-Score.',
];

export const LIMITATIONS = [
  'Requires well-labeled, high-quality news and social interaction datasets.',
  'Incomplete or early social sharing data can weaken propagation graph signals.',
  'Dynamic real-time propagation cascades are computationally demanding to track.',
  'Model performance may shift across unfamiliar domains or platforms.',
  'Deep learning training and GNN inference require dedicated compute resources.',
];

export const SYSTEM_REFERENCES = [
  'Lakzaei, B., Chehreghani, M. H., & Bagheri, A. (2024). Disinformation Detection Using Graph Neural Networks: A Survey. Artificial Intelligence Review, 57, 52.',
  'Soga, K., Yoshida, S., & Muneyasu, M. (2024). Exploiting Stance Similarity and Graph Neural Networks for Fake News Detection. Pattern Recognition Letters, 177, 26–32.',
  'Chang, Q., Li, X., & Duan, Z. (2024). Graph Global Attention Network with Memory: A Deep Learning Approach for Fake News Detection. Neural Networks, 172, 106115.',
  'Jing, C., Gao, H., Zhang, X., Gao, T., & Zhou, C. (2025). DPSG: Dynamic Propagation Social Graphs for Multi-Modal Fake News Detection. Information Fusion, 113, 102595.',
  'Moorthy, H. R., et al. (2025). Dual Stream Graph Augmented Transformer Model Integrating BERT and GNNs for Context Aware Fake News Detection. Scientific Reports, 15, 25436.',
];

export const PROJECT_CREDITS = {
  institution: 'SIMATS Engineering · Saveetha School of Engineering',
  course: 'CSA4705 – Deep Learning',
  supervisor: 'Dr. Malathi K',
  presenters: [
    { name: 'S. Sri Sai Prasanna Durga', regNo: '192424241' },
    { name: 'Gayathri. P', regNo: '192424324' },
    { name: 'Rakshana', regNo: '1926020104' },
  ],
  softwareStack: [
    'Python, TensorFlow / PyTorch',
    'NLTK, Hugging Face Transformers',
    'NetworkX, PyTorch Geometric',
    'NumPy, Pandas, Scikit-learn, Matplotlib',
  ],
  hardwareStack: [
    'Intel Core i5 processor or above',
    'Minimum 8 GB RAM · 256 GB Storage',
    'NVIDIA GPU (optional for GNN training)',
    'Active internet connection',
  ],
};
