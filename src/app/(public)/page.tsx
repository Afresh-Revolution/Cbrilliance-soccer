import ImmersiveHero from '@/components/home/ImmersiveHero';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedPlayersSection from '@/components/home/FeaturedPlayersSection';
import ActivitySection from '@/components/home/ActivitySection';
import VideoHighlightsSection from '@/components/home/VideoHighlightsSection';
import { getPlayers, getSiteStats, prioritizeFeaturedPlayers } from '@/lib/data/queries';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, allPlayers] = await Promise.all([
    getSiteStats(),
    getPlayers(),
  ]);

  const heroPlayers = prioritizeFeaturedPlayers(allPlayers, 6);

  return (
    <>
      <ImmersiveHero players={heroPlayers} stats={stats} />
      <StatsSection />
      <FeaturedPlayersSection />
      <AboutSection />
      <ActivitySection />
      <VideoHighlightsSection />
    </>
  );
}
