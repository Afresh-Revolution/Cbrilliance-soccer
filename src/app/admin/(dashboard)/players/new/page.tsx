import PlayerForm from '@/components/admin/PlayerForm';

export default function AdminNewPlayerPage() {
  return (
    <>
      <div className="admin__header">
        <h1>Add Player</h1>
        <p className="text-muted">Create a new player profile for the CBFC site</p>
      </div>
      <PlayerForm mode="create" />
    </>
  );
}
