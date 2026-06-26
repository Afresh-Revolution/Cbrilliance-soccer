import { calculateAge } from '@/lib/utils/format';
import type { AgeCategory } from '@/types';

export function ageGroupFromDateOfBirth(dateOfBirth: string): AgeCategory {
  const age = calculateAge(dateOfBirth);
  if (age <= 10) return 'U10';
  if (age <= 13) return 'U13';
  if (age <= 15) return 'U15';
  if (age <= 17) return 'U17';
  if (age <= 19) return 'U19';
  return 'Senior';
}
