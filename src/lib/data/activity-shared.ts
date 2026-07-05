import type { ActivityItem } from '@/types';
import type { z } from 'zod';
import type { adminActivitySchema } from '@/lib/validators/schemas';

export type AdminActivityInput = z.infer<typeof adminActivitySchema>;

export function activityToFormValues(item: ActivityItem): AdminActivityInput {
  const activityDate = item.date.includes('T')
    ? item.date.slice(0, 16)
    : `${item.date}T12:00`;

  return {
    type: item.type as AdminActivityInput['type'],
    title: item.title,
    description: item.description,
    activityDate,
    playerId: item.playerId ?? null,
  };
}
