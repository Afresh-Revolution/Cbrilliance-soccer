import FixtureForm from '@/components/admin/FixtureForm';

export default function AdminNewFixturePage() {
  return (
    <>
      <div className="admin__header">
        <h1>Add Fixture</h1>
        <p className="text-muted">Schedule an upcoming match or record a result</p>
      </div>
      <FixtureForm mode="create" />
    </>
  );
}
