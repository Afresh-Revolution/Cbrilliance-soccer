import { notFound } from 'next/navigation';
import PlayerForm from '@/components/admin/PlayerForm';
import { getPlayerById, playerToFormValues } from '@/lib/data/player-admin';

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditPlayerPage({ params }: Props) {
  const { id } = await params;
  const player = await getPlayerById(id);
  if (!player) notFound();

  return (
    <>
      <div className="admin__header">
        <h1>Edit Player</h1>
        <p className="text-muted">{player.fullName}</p>
      </div>
      <PlayerForm mode="edit" initial={playerToFormValues(player)} playerId={player.id} />
    </>
  );
}
