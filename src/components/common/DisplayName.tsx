interface DisplayNameProps {
  fullName: string;
  className?: string;
}

export default function DisplayName({ fullName, className = '' }: DisplayNameProps) {
  const parts = fullName.trim().split(' ');
  const first = parts.slice(0, -1).join(' ') || parts[0];
  const last = parts.length > 1 ? parts[parts.length - 1] : '';

  return (
    <div className={`display-name ${className}`}>
      <span className="display-name__first">{first}</span>
      {last && <span className="display-name__last">{last}</span>}
    </div>
  );
}
