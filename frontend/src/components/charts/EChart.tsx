import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

// ── Brand palette ─────────────────────────────────────────────
export const CHART_COLORS = [
  '#2563EB', // primary blue
  '#06B6D4', // cyan
  '#10B981', // green
  '#F97316', // orange
  '#8B5CF6', // violet
  '#EF4444', // red
  '#F59E0B', // amber
  '#EC4899', // pink
  '#14B8A6', // teal
  '#6366F1', // indigo
];

// Shared ECharts global theme overrides
const BASE_TEXT = '#94A3B8';
const BASE_GRID = 'rgba(226,232,240,0.6)';

// ── Shared tooltip style ──────────────────────────────────────
export const TOOLTIP_STYLE = {
  backgroundColor: '#0F172A',
  borderColor: 'rgba(37,99,235,0.3)',
  borderWidth: 1,
  borderRadius: 10,
  padding: [10, 14],
  textStyle: { color: '#F1F5F9', fontSize: 12, fontFamily: 'Inter, sans-serif' },
  shadowBlur: 20,
  shadowColor: 'rgba(0,0,0,0.3)',
};

// ── Axis defaults ─────────────────────────────────────────────
export const AXIS_LABEL_STYLE = {
  color: BASE_TEXT,
  fontSize: 11,
  fontFamily: 'Inter, sans-serif',
};

export const AXIS_LINE_STYLE = {
  lineStyle: { color: 'rgba(226,232,240,0.5)' },
};

export const SPLIT_LINE_STYLE = {
  lineStyle: { color: BASE_GRID, type: 'dashed' as const },
};

// ── Chart builder helpers ─────────────────────────────────────

/** Gradient bar color for a single series */
export const gradientBar = (colorHex: string) => ({
  type: 'linear' as const,
  x: 0, y: 0, x2: 0, y2: 1,
  colorStops: [
    { offset: 0, color: colorHex },
    { offset: 1, color: `${colorHex}55` },
  ],
});

interface EChartProps {
  option: EChartsOption;
  height?: number | string;
  style?: React.CSSProperties;
}

export const EChart: React.FC<EChartProps> = ({ option, height = 300, style }) => {
  return (
    <ReactECharts
      option={option}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%', ...style }}
      opts={{ renderer: 'canvas' }}
      notMerge={true}
      lazyUpdate={false}
    />
  );
};
