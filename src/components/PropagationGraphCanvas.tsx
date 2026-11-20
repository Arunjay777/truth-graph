import { useMemo, useState } from 'react';
import { Grid, Network, RotateCcw } from 'lucide-react';
import type { GraphNode, PropagationGraph } from '../types/truthgraph.ts';

interface PropagationGraphCanvasProps {
  graph: PropagationGraph;
  incompleteData: boolean;
}

const ROLE_STYLES: Record<
  GraphNode['role'],
  { fill: string; stroke: string; label: string; textClass: string }
> = {
  news: {
    fill: '#1D4ED8',
    stroke: '#1E3A8A',
    label: 'News Article Root',
    textClass: 'text-blue-700',
  },
  verified: {
    fill: '#15803D',
    stroke: '#14532D',
    label: 'Verified Desk / Source',
    textClass: 'text-emerald-700',
  },
  organic: {
    fill: '#64748B',
    stroke: '#334155',
    label: 'Organic Social User',
    textClass: 'text-slate-700',
  },
  suspicious: {
    fill: '#B91C1C',
    stroke: '#7F1D1D',
    label: 'Coordinated / Bot Account',
    textClass: 'text-red-700',
  },
};

export function PropagationGraphCanvas({
  graph,
  incompleteData,
}: PropagationGraphCanvasProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('N0');

  const nodeMap = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph.nodes]
  );

  const selectedNode = nodeMap.get(selectedNodeId) ?? graph.nodes[0];

  const connectedIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNode) return ids;
    ids.add(selectedNode.id);
    for (const edge of graph.edges) {
      if (edge.source === selectedNode.id) ids.add(edge.target);
      if (edge.target === selectedNode.id) ids.add(edge.source);
    }
    return ids;
  }, [graph.edges, selectedNode]);

  return (
    <section className="bg-white border border-slate-200 rounded-lg">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Module 2. Social Propagation Graph
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Directed user-to-news sharing topology ({graph.metrics.nodeCount} nodes · {graph.metrics.edgeCount} edges
            {incompleteData ? ' · Incomplete early trace' : ' · Full cascade'})
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
              viewMode === 'graph'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Topology
          </button>
          <button
            type="button"
            onClick={() => setViewMode('matrix')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap shrink-0 transition-colors ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            Adjacency Matrix
          </button>
        </div>
      </div>

      {/* Main viewport */}
      {viewMode === 'graph' ? (
        <div className="p-4">
          <div className="relative bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
            <svg
              viewBox="0 0 680 400"
              className="w-full h-[320px] sm:h-[360px] block select-none cursor-crosshair"
              role="img"
              aria-label="News propagation network graph showing article root node and social user shares"
            >
              <defs>
                <marker
                  id="arrow-share"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#94A3B8" />
                </marker>
                <marker
                  id="arrow-amplify"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#DC2626" />
                </marker>
              </defs>

              {/* Concentric cascade hop rings */}
              {[1, 2, 3, 4].map((hop) => (
                <ellipse
                  key={hop}
                  cx={340}
                  cy={200}
                  rx={[0, 82, 134, 174, 206][hop] * 1.24}
                  ry={[0, 82, 134, 174, 206][hop] * 0.82}
                  fill="none"
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Ring labels */}
              <text x="444" y="204" className="fill-slate-400 text-[10px] font-mono">
                Hop 1
              </text>
              <text x="510" y="204" className="fill-slate-400 text-[10px] font-mono">
                Hop 2
              </text>
              <text x="560" y="204" className="fill-slate-400 text-[10px] font-mono">
                Hop 3+
              </text>

              {/* Directed edges */}
              {graph.edges.map((edge) => {
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const isHighlighted =
                  selectedNode &&
                  (edge.source === selectedNode.id || edge.target === selectedNode.id);
                const isAmplify = edge.type === 'amplify';

                return (
                  <line
                    key={edge.id}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isAmplify
                        ? isHighlighted
                          ? '#B91C1C'
                          : '#FCA5A5'
                        : isHighlighted
                        ? '#1D4ED8'
                        : '#CBD5E1'
                    }
                    strokeWidth={isHighlighted ? 2 : isAmplify ? 1.4 : 1.1}
                    strokeDasharray={edge.type === 'reply' ? '3 3' : undefined}
                    markerEnd={isAmplify ? 'url(#arrow-amplify)' : 'url(#arrow-share)'}
                    opacity={isHighlighted ? 1 : 0.78}
                  />
                );
              })}

              {/* Nodes */}
              {graph.nodes.map((node) => {
                const style = ROLE_STYLES[node.role];
                const isSelected = selectedNode?.id === node.id;
                const isConnected = connectedIds.has(node.id);
                const radius = node.role === 'news' ? 16 : node.role === 'verified' ? 11 : 9.5;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer"
                    opacity={isConnected ? 1 : 0.45}
                  >
                    {isSelected && (
                      <circle
                        r={radius + 5}
                        fill="none"
                        stroke="#1D4ED8"
                        strokeWidth="2"
                      />
                    )}
                    <circle
                      r={radius}
                      fill={style.fill}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      y={node.role === 'news' ? 3.5 : 3}
                      textAnchor="middle"
                      className="fill-white font-mono text-[9px] font-semibold pointer-events-none"
                    >
                      {node.id}
                    </text>
                  </g>
                );
              })}
            </svg>

            <button
              type="button"
              onClick={() => setSelectedNodeId('N0')}
              className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              title="Focus News Root Node"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Focus Root
            </button>
          </div>

          {/* Clean unboxed legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {(['news', 'verified', 'organic', 'suspicious'] as const).map((role) => (
                <span key={role} className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: ROLE_STYLES[role].fill }}
                    aria-hidden="true"
                  />
                  <span>{ROLE_STYLES[role].label}</span>
                </span>
              ))}
            </div>
            <span className="text-slate-500">Click any node to inspect features</span>
          </div>

          {/* Selected node feature inspector */}
          {selectedNode && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedNode.id}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-800">{selectedNode.handle}</span>
                  <span className="text-slate-400">·</span>
                  <span className={`font-medium ${ROLE_STYLES[selectedNode.role].textClass}`}>
                    {ROLE_STYLES[selectedNode.role].label}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums text-slate-600">
                <span>Platform: {selectedNode.platform}</span>
                <span>Hop: {selectedNode.depth}</span>
                <span>Degree: {selectedNode.degree}</span>
                <span>T+{selectedNode.timestampMin}m</span>
                {selectedNode.role !== 'news' && (
                  <span>Followers: {selectedNode.followers.toLocaleString()}</span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-600">
              Directed adjacency slice <span className="font-mono text-slate-900">A[i, j]</span> for root node and initial 5 cascade accounts used as GNN message-passing input.
            </p>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              6 × 6 Sample Slice
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono tabular-nums border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 px-3 text-left font-medium">From \ To</th>
                  {graph.adjacencyPreview.labels.map((label) => (
                    <th key={label} className="py-2 px-3 text-center font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {graph.adjacencyPreview.matrix.map((row, rowIdx) => (
                  <tr key={graph.adjacencyPreview.labels[rowIdx]} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {graph.adjacencyPreview.labels[rowIdx]}
                    </td>
                    {row.map((val, colIdx) => (
                      <td
                        key={`${rowIdx}-${colIdx}`}
                        className={`py-2 px-3 text-center ${
                          val === 1
                            ? 'bg-blue-50 text-blue-800 font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact structural telemetry strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
        <div className="px-4 py-3">
          <div className="text-xs text-slate-500">Bot Cluster Ratio</div>
          <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
            {graph.metrics.botClusterRatio}%
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-slate-500">Verified Sources</div>
          <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
            {graph.metrics.verifiedShareRatio}%
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-slate-500">Burst Index</div>
          <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
            {graph.metrics.burstIndex.toFixed(2)}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="text-xs text-slate-500">Trace Completeness</div>
          <div className="text-lg font-mono font-semibold tabular-nums text-slate-900 mt-0.5">
            {graph.metrics.completeness}%
          </div>
        </div>
      </div>
    </section>
  );
}
