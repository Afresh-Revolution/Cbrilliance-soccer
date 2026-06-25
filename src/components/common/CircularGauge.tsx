interface CircularGaugeProps {
  value: number;
  label: string;
  max?: number;
}

export default function CircularGauge({ value, label, max = 100 }: CircularGaugeProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="gauge">
      <div className="gauge__ring">
        <svg viewBox="0 0 100 100">
          <circle className="gauge__track" cx="50" cy="50" r={radius} />
          <circle
            className="gauge__fill"
            cx="50"
            cy="50"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="gauge__value">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <p className="gauge__label">{label}</p>
    </div>
  );
}
