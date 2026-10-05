import { notFound } from 'next/navigation';
import AdminTournamentDetail from '@/components/admin/AdminTournamentDetail';
import { requireAdminUuid } from '@/lib/admin/params';
import { getTournamentRegistrationById } from '@/lib/data/tournament';

type Props = { params: Promise<{ id: string }> };

export default async function AdminTournamentRegistrationPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = requireAdminUuid(rawId);
  const registration = await getTournamentRegistrationById(id);
  if (!registration) notFound();

  return <AdminTournamentDetail registration={registration} />;
}
