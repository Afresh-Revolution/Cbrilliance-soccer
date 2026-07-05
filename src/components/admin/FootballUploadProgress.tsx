'use client';

interface Props {
  progress: number;
  label?: string;
}

export default function FootballUploadProgress({ progress, label = 'Uploading…' }: Props) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className="football-upload" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      <div className="football-upload__header">
        <span className="football-upload__label">{label}</span>
        <span className="football-upload__percent">{clamped}%</span>
      </div>
      <div className="football-upload__pitch">
        <div className="football-upload__line football-upload__line--mid" aria-hidden />
        <div className="football-upload__line football-upload__line--box-left" aria-hidden />
        <div className="football-upload__line football-upload__line--box-right" aria-hidden />
        <div className="football-upload__fill" style={{ width: `${clamped}%` }} />
        <span
          className="football-upload__ball"
          style={{ left: `calc(${clamped}% - 12px)` }}
          aria-hidden
        >
          ⚽
        </span>
      </div>
    </div>
  );
}
