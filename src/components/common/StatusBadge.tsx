import { STATUS_LABELS } from '@/lib/constants/navigation';
import { getStatusBadgeClass } from '@/lib/utils/format';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge ${getStatusBadgeClass(status)}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
