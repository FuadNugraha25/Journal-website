'use client';

import React, { useMemo } from 'react';
import type { Trade } from '@/lib/types';

type Props = {
  trades: Trade[];
  year?: number; // defaults to current year
};

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function MonthlyWinLossChart({ trades, year }: Props) {
  const currentYear = year ?? new Date().getFullYear();

  const data = useMemo(() => {
    const wins = Array(12).fill(0) as number[];
    const losses = Array(12).fill(0) as number[];

    for (const t of trades) {
      const d = t.closeDate instanceof Date ? t.closeDate : new Date(t.closeDate);
      if (d.getFullYear() !== currentYear) continue;
      // Win = tp or cp, Loss = sl or cl, ignore breakeven
      const m = d.getMonth();
      if (t.outcome === 'tp' || t.outcome === 'cp') wins[m] += 1;
      if (t.outcome === 'sl' || t.outcome === 'cl') losses[m] += 1;
    }

    const maxVal = Math.max(1, ...wins, ...losses); // avoid div by zero

    return { wins, losses, maxVal };
  }, [trades, currentYear]);

  // Chart sizing
  const width = 900; // will scale via viewBox
  const height = 260;
  const paddingLeft = 28;
  const paddingRight = 12;
  const paddingTop = 10;
  const paddingBottom = 18;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const baselineY = paddingTop + innerHeight / 2; // x-axis in the middle

  const barGroupWidth = innerWidth / 12;
  const barWidth = Math.min(18, Math.max(8, barGroupWidth * 0.35));

  const upColor = '#22c55e'; // green-500
  const downColor = '#ef4444'; // red-500
  const axisColor = 'hsl(var(--muted-foreground))';
  const monthColor = 'hsl(var(--muted-foreground))';

  const scale = (value: number) => (value / data.maxVal) * (innerHeight / 2 - 12); // keep margin

  return (
    <div className="w-full h-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        {/* Baseline */}
        <line x1={paddingLeft} x2={width - paddingRight} y1={baselineY} y2={baselineY} stroke={axisColor} strokeWidth={1} />
        {/* Legend */}
        <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
          <rect x={0} y={0} width={10} height={10} fill={upColor} rx={2} />
          <text x={16} y={9} fontSize={11} fill={monthColor}>Wins</text>
          <rect x={58} y={0} width={10} height={10} fill={downColor} rx={2} />
          <text x={74} y={9} fontSize={11} fill={monthColor}>Losses</text>
        </g>

        {/* Bars and month labels */}
        {MONTH_LABELS.map((label, i) => {
          const groupX = paddingLeft + i * barGroupWidth + barGroupWidth / 2;
          const winH = scale(data.wins[i]);
          const lossH = scale(data.losses[i]);
          const winX = groupX - barWidth - 2; // wins to the left side of center
          const lossX = groupX + 2; // losses to the right side of center

          return (
            <g key={i}>
              {/* Win bar (upwards) */}
              {winH > 0 && (
                <rect
                  x={winX}
                  y={baselineY - winH}
                  width={barWidth}
                  height={winH}
                  fill={upColor}
                  rx={3}
                />
              )}
              {/* Loss bar (downwards) */}
              {lossH > 0 && (
                <rect
                  x={lossX}
                  y={baselineY}
                  width={barWidth}
                  height={lossH}
                  fill={downColor}
                  rx={3}
                />
              )}
              {/* Month label */}
              <text x={groupX} y={height - 4} textAnchor="middle" fontSize={11} fill={monthColor}>{label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
