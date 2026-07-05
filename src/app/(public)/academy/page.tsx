import AcademyPageClient from './AcademyPageClient';
import { getAcademyFacilitiesSection } from '@/lib/data/academy-facility-admin';

export default async function AcademyPage() {
  const facilitiesSection = await getAcademyFacilitiesSection();

  return <AcademyPageClient facilitiesSection={facilitiesSection} />;
}
