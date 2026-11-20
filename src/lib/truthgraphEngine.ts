import type {
  EdgeType,
  GraphEdge,
  GraphNode,
  NlpPreprocessingResult,
  NodeRole,
  PlatformName,
  PropagationGraph,
  PropagationParams,
} from '../types/truthgraph.ts';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'for', 'from',
  'had', 'has', 'have', 'he', 'her', 'his', 'in', 'into', 'is', 'it', 'its',
  'of', 'on', 'or', 'our', 'over', 'said', 'she', 'that', 'the', 'their', 'them',
  'there', 'these', 'they', 'this', 'to', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'who', 'will', 'with', 'would', 'you', 'your', 'not', 'can',
  'all', 'also', 'after', 'about', 'more', 'than', 'up', 'out', 'new', 'just',
]);

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function runNlpPreprocessing(headline: string, content: string): NlpPreprocessingResult {
  const combined = `${headline} ${content}`.trim();
  const rawWords = combined ? combined.split(/\s+/).filter(Boolean) : [];
  const exclamationCount = (combined.match(/!/g) || []).length;
  const allCapsWordCount = rawWords.filter((w) => {
    const letters = w.replace(/[^a-zA-Z]/g, '');
    return letters.length >= 3 && letters === letters.toUpperCase();
  }).length;

  const cleanedWords = combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1);

  const filteredTokens = cleanedWords.filter((t) => !STOP_WORDS.has(t));
  const removedStopWords = Math.max(0, cleanedWords.length - filteredTokens.length);

  const counts = new Map<string, number>();
  for (const token of filteredTokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  const maxFreq = Math.max(1, ...Array.from(counts.values()));
  const topTokens = Array.from(counts.entries())
    .map(([term, count]) => ({
      term,
      count,
      // Normalized TF-IDF-style salience weighting emphasizing domain terms over short filler
      weight: Number(((count / maxFreq) * Math.min(1.4, 0.75 + term.length / 14)).toFixed(2)),
    }))
    .sort((a, b) => b.weight - a.weight || b.count - a.count)
    .slice(0, 10);

  const totalLen = filteredTokens.reduce((sum, t) => sum + t.length, 0);
  const avgWordLength = filteredTokens.length > 0 ? Number((totalLen / filteredTokens.length).toFixed(1)) : 0;

  return {
    rawWordCount: rawWords.length,
    cleanTokenCount: filteredTokens.length,
    removedStopWords,
    topTokens,
    exclamationCount,
    allCapsWordCount,
    avgWordLength,
    sampleTokens: filteredTokens.slice(0, 18),
  };
}

const VERIFIED_HANDLES = [
  '@reuters_desk',
  '@science_wire',
  '@civic_press',
  '@fact_ledger',
  '@med_review',
  '@econ_brief',
];

const ORGANIC_HANDLES = [
  '@mira_k',
  '@devon_r',
  '@arjun_s',
  '@claire_t',
  '@karen_m',
  '@tariq_h',
  '@nina_p',
  '@sam_b',
  '@elena_v',
  '@rohan_d',
  '@liam_w',
  '@priya_n',
];

const SUSPICIOUS_HANDLES = [
  '@alert_node88',
  '@viral_echo04',
  '@truth_blast9',
  '@share_hub71',
  '@rapid_feed22',
  '@anon_wire19',
  '@pulse_bot07',
  '@flash_net63',
  '@repost_sys12',
  '@boost_acc45',
];

export function buildPropagationGraph(
  headline: string,
  params: PropagationParams
): PropagationGraph {
  const seed =
    hashString(headline || 'default-article') +
    params.shareVelocity * 31 +
    params.suspiciousRatio * 17 +
    params.cascadeDepth * 97 +
    params.sourceDiversity * 13 +
    (params.incompleteData ? 7919 : 0);

  const rand = seededRandom(seed);
  const platforms: PlatformName[] =
    params.platforms.length > 0 ? params.platforms : ['X', 'Facebook'];

  const totalUserNodes = params.incompleteData
    ? Math.max(6, Math.round(7 + (params.shareVelocity / 100) * 4))
    : Math.max(11, Math.round(12 + (params.shareVelocity / 100) * 10));

  const maxDepth = params.incompleteData
    ? Math.min(2, params.cascadeDepth)
    : Math.max(1, Math.min(5, params.cascadeDepth));

  const cx = 340;
  const cy = 200;

  const nodes: GraphNode[] = [
    {
      id: 'N0',
      label: 'News Root',
      handle: 'Article Source',
      role: 'news',
      platform: 'Article',
      depth: 0,
      x: cx,
      y: cy,
      followers: 0,
      timestampMin: 0,
      degree: 0,
    },
  ];

  const edges: GraphEdge[] = [];
  const depthBuckets: GraphNode[][] = Array.from({ length: maxDepth + 1 }, () => []);
  depthBuckets[0].push(nodes[0]);

  let vIdx = 0;
  let oIdx = 0;
  let sIdx = 0;

  for (let i = 1; i <= totalUserNodes; i++) {
    const depth =
      i <= Math.min(4, totalUserNodes)
        ? 1
        : Math.min(maxDepth, 1 + Math.floor(rand() * maxDepth));

    const r = rand() * 100;
    const suspCutoff = params.suspiciousRatio;
    const verCutoff = suspCutoff + Math.max(8, params.sourceDiversity * 0.45);

    let role: NodeRole;
    let handle: string;
    let followers: number;

    if (r < suspCutoff) {
      role = 'suspicious';
      handle = SUSPICIOUS_HANDLES[sIdx % SUSPICIOUS_HANDLES.length];
      sIdx++;
      followers = Math.round(80 + rand() * 620);
    } else if (r < verCutoff) {
      role = 'verified';
      handle = VERIFIED_HANDLES[vIdx % VERIFIED_HANDLES.length];
      vIdx++;
      followers = Math.round(18000 + rand() * 140000);
    } else {
      role = 'organic';
      handle = ORGANIC_HANDLES[oIdx % ORGANIC_HANDLES.length];
      oIdx++;
      followers = Math.round(450 + rand() * 4800);
    }

    const platform = platforms[Math.floor(rand() * platforms.length)];
    const timeScale = Math.max(0.25, 1.35 - params.shareVelocity / 90);
    const timestampMin = Math.max(1, Math.round(depth * (4 + rand() * 18) * timeScale));

    const node: GraphNode = {
      id: `U${i}`,
      label: `U${i}`,
      handle,
      role,
      platform,
      depth,
      x: cx,
      y: cy,
      followers,
      timestampMin,
      degree: 0,
    };

    nodes.push(node);
    depthBuckets[depth].push(node);
  }

  // Position nodes in clean concentric rings by cascade depth
  const ringRadii = [0, 82, 134, 174, 206, 232];
  for (let d = 1; d <= maxDepth; d++) {
    const bucket = depthBuckets[d];
    const count = bucket.length;
    if (count === 0) continue;
    const angleOffset = (d * Math.PI) / 5 + rand() * 0.4;
    const rx = ringRadii[d] * 1.24;
    const ry = ringRadii[d] * 0.82;

    bucket.forEach((node, idx) => {
      const angle = angleOffset + (idx / count) * Math.PI * 2;
      const jitter = (rand() - 0.5) * 14;
      node.x = Math.round(Math.max(46, Math.min(634, cx + Math.cos(angle) * (rx + jitter))));
      node.y = Math.round(Math.max(38, Math.min(362, cy + Math.sin(angle) * (ry + jitter * 0.7))));
    });
  }

  // Connect each node to a parent in the previous depth layer
  let edgeSeq = 1;
  for (let d = 1; d <= maxDepth; d++) {
    const parents = depthBuckets[d - 1].length > 0 ? depthBuckets[d - 1] : [nodes[0]];
    for (const node of depthBuckets[d]) {
      // Suspicious nodes prefer chaining from other suspicious nodes when available
      let parent = parents[Math.floor(rand() * parents.length)];
      if (node.role === 'suspicious') {
        const suspParents = parents.filter((p) => p.role === 'suspicious');
        if (suspParents.length > 0 && rand() < 0.72) {
          parent = suspParents[Math.floor(rand() * suspParents.length)];
        }
      }

      const type: EdgeType =
        node.role === 'suspicious'
          ? 'amplify'
          : rand() < 0.28
          ? 'reply'
          : 'share';

      edges.push({
        id: `E${edgeSeq++}`,
        source: parent.id,
        target: node.id,
        type,
        weight: type === 'amplify' ? 1.0 : type === 'share' ? 0.7 : 0.45,
      });
    }
  }

  // Add coordinated cross-amplification edges among suspicious accounts (echo chamber signature)
  const suspiciousNodes = nodes.filter((n) => n.role === 'suspicious');
  if (suspiciousNodes.length >= 2 && !params.incompleteData) {
    const extraLinks = Math.min(suspiciousNodes.length, Math.round((params.suspiciousRatio / 100) * 6));
    for (let k = 0; k < extraLinks; k++) {
      const a = suspiciousNodes[k % suspiciousNodes.length];
      const b = suspiciousNodes[(k + 1) % suspiciousNodes.length];
      if (a.id !== b.id && !edges.some((e) => e.source === a.id && e.target === b.id)) {
        edges.push({
          id: `E${edgeSeq++}`,
          source: a.id,
          target: b.id,
          type: 'amplify',
          weight: 0.9,
        });
      }
    }
  }

  // Compute node degrees
  for (const edge of edges) {
    const src = nodes.find((n) => n.id === edge.source);
    const tgt = nodes.find((n) => n.id === edge.target);
    if (src) src.degree += 1;
    if (tgt) tgt.degree += 1;
  }

  const userNodes = nodes.slice(1);
  const actualSuspicious = userNodes.filter((n) => n.role === 'suspicious').length;
  const actualVerified = userNodes.filter((n) => n.role === 'verified').length;
  const avgDegree = Number(((edges.length * 2) / Math.max(1, nodes.length)).toFixed(2));

  // Build 6x6 adjacency matrix preview for the root + first 5 user nodes
  const previewNodes = nodes.slice(0, 6);
  const idToIdx = new Map(previewNodes.map((n, idx) => [n.id, idx]));
  const matrix = Array.from({ length: previewNodes.length }, () =>
    Array.from({ length: previewNodes.length }, () => 0)
  );
  for (const edge of edges) {
    const si = idToIdx.get(edge.source);
    const ti = idToIdx.get(edge.target);
    if (si !== undefined && ti !== undefined) {
      matrix[si][ti] = 1;
    }
  }

  return {
    nodes,
    edges,
    metrics: {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDepth,
      avgDegree,
      botClusterRatio: Math.round((actualSuspicious / Math.max(1, userNodes.length)) * 100),
      verifiedShareRatio: Math.round((actualVerified / Math.max(1, userNodes.length)) * 100),
      burstIndex: Number(((params.shareVelocity / 100) * (1 + actualSuspicious / Math.max(1, userNodes.length))).toFixed(2)),
      completeness: params.incompleteData ? 38 : 96,
    },
    adjacencyPreview: {
      labels: previewNodes.map((n) => n.id),
      matrix,
    },
  };
}
