import { notFound } from 'next/navigation';
import FixtureForm from '@/components/admin/FixtureForm';
import { requireAdminUuid } from '@/lib/admin/params';
import { fixtureToFormValues, getFixtureById } from '@/lib/data/fixture-admin';

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditFixturePage({ params }: Props) {
  const { id: rawId } = await params;
  const id = requireAdminUuid(rawId);
  const fixture = await getFixtureById(id);
  if (!fixture) notFound();

  return (
    <>
      <div className="admin__header">
        <h1>Edit Fixture</h1>
        <p className="text-muted">{fixture.homeTeam} vs {fixture.awayTeam}</p>
      </div>
      <FixtureForm mode="edit" initial={fixtureToFormValues(fixture)} fixtureId={fixture.id} />
    </>
  );
}
