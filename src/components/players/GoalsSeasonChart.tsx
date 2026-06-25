'use client';

interface Point {
  label: string;
  value: number;
}

interface Props {
  data: Point[];
}

export default function GoalsSeasonChart({ data }: Props) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 280;
  const h = 72;
  const padX = 8;
  const padY = 8;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * innerW;
    const y = padY + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg className="player-detail__chart" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={line}
      />
      {points.map((p) => (
        <circle key={p.label} cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
      ))}
    </svg>
  );
}
