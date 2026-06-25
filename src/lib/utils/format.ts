export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    available_for_trials: 'badge--trial',
    on_trial: 'badge--gold',
    abroad: 'badge--abroad',
    in_development: 'badge--development',
    professional_squad: 'badge--professional',
    in_camp: 'badge--success',
  };
  return map[status] || 'badge--gold';
}
