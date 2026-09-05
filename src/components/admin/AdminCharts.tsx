"use client";

import React, { useId, useState } from "react";

export function formatCompactVN(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1).replace(/\.0$/, "")} tỷ`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1).replace(/\.0$/, "")} tr`;
  if (value >= 1e3) return `${Math.round(value / 1e3)}K`;
  return String(Math.round(value));
}

export interface LineSeries {
  name: string;
  values: number[];
  color: string;
}

const W = 720;
const PAD = { top: 16, right: 12, bottom: 26, left: 56 };

/**
 * Area/line chart thuần SVG — không cần thư viện ngoài.
 * Hover để xem chi tiết theo điểm.
 */
export function LineAreaChart({
  labels,
  series,
  height = 240,
  formatValue = formatCompactVN,
  emptyMessage = "Chưa có dữ liệu trong khoảng thời gian này",
}: {
  labels: string[];
  series: LineSeries[];
  height?: number;
  formatValue?: (v: number) => string;
  emptyMessage?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const H = height;
  const n = labels.length;
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (n === 0 || series.every((s) => s.values.every((v) => v === 0))) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg text-sm text-slate-400 dark:text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  const max = Math.max(1, ...series.flatMap((s) => s.values));
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const paths = series.map((s) => {
    const line = s.values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    const base = (PAD.top + innerH).toFixed(1);
    const area = `${line} L${x(s.values.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
    return { line, area };
  });

  const gridFracs = [0, 0.25, 0.5, 0.75, 1];
  const labelStep = Math.max(1, Math.ceil(n / 7));
  const visibleIdx = labels.map((_, i) => i).filter((i) => i % labelStep === 0 || i === n - 1);

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair select-none"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`grad-${uid}-${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.16" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {gridFracs.map((f) => {
          const gy = PAD.top + innerH * f;
          return (
            <g key={f}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={gy}
                y2={gy}
                strokeWidth="1"
                strokeDasharray={f === 1 ? undefined : "3 4"}
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <text x={PAD.left - 8} y={gy + 3.5} textAnchor="end" className="fill-slate-400 text-[10px]">
                {formatValue(max * (1 - f))}
              </text>
            </g>
          );
        })}

        {visibleIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-slate-400 text-[10px]">
            {labels[i]}
          </text>
        ))}

        {series.map((s, si) => (
          <g key={si}>
            <path d={paths[si].area} fill={`url(#grad-${uid}-${si})`} />
            <path
              d={paths[si].line}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        ))}

        {hover != null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              strokeDasharray="3 3"
              className="stroke-slate-300 dark:stroke-slate-600"
            />
            {series.map((s, si) => (
              <circle
                key={si}
                cx={x(hover)}
                cy={y(s.values[hover] ?? 0)}
                r="3.5"
                fill={s.color}
                strokeWidth="1.5"
                className="stroke-white dark:stroke-slate-900"
              />
            ))}
          </g>
        )}
      </svg>

      {hover != null && (
        <div
          className="pointer-events-none absolute top-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            transform: x(hover) > W * 0.6 ? "translateX(-110%)" : "translateX(12px)",
          }}
        >
          <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">{labels[hover]}</p>
          {series.map((s, si) => (
            <p key={si} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name}:
              <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                {formatValue(s.values[hover] ?? 0)}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Donut chart thuần SVG + legend. Tổng hiển thị ở giữa.
 */
export function DonutChart({
  data,
  size = 168,
  thickness = 22,
  centerLabel = "Tổng",
  formatValue = formatCompactVN,
}: {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  formatValue?: (v: number) => string;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const R = (size - thickness) / 2;
  const C = 2 * Math.PI * R;

  let acc = 0;
  const slices = data.map((d) => {
    const frac = total > 0 ? d.value / total : 0;
    const slice = { ...d, frac, dash: frac * C, offset: acc };
    acc += frac * C;
    return slice;
  });

  if (total === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center rounded-lg text-sm text-slate-400 dark:text-slate-500">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            strokeWidth={thickness}
            className="stroke-slate-100 dark:stroke-slate-800"
          />
          {slices.map(
            (s, i) =>
              s.value > 0 && (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${s.dash} ${C - s.dash}`}
                  strokeDashoffset={-s.offset}
                />
              )
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
            {formatValue(total)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center justify-between gap-3 text-[13px]">
            <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-800 dark:text-slate-100">
              {formatValue(s.value)}
              <span className="ml-1 font-normal text-slate-400">({Math.round(s.frac * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

