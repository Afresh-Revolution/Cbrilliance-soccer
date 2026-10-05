import AdminTournamentBankForm from '@/components/admin/AdminTournamentBankForm';
import AdminTournamentTable from '@/components/admin/AdminTournamentTable';
import { getAllTournamentRegistrations, getTournamentBankDetails } from '@/lib/data/tournament';

export default async function AdminTournamentPage() {
  const [registrations, bankDetails] = await Promise.all([
    getAllTournamentRegistrations(),
    getTournamentBankDetails(),
  ]);

  return (
    <>
      <div className="admin__header">
        <h1>Tournament Registrations</h1>
        <p className="text-muted">Review team registrations and verify squads for the CBrilliance Football Agency tournament</p>
      </div>
      <AdminTournamentBankForm initialDetails={bankDetails} />
      <AdminTournamentTable registrations={registrations} />
    </>
  );
}
