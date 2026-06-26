import ImmersiveHero from '@/components/home/ImmersiveHero';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedPlayersSection from '@/components/home/FeaturedPlayersSection';
import ActivitySection from '@/components/home/ActivitySection';
import VideoHighlightsSection from '@/components/home/VideoHighlightsSection';
import { getPlayers, getSiteStats } from '@/lib/data/queries';

export default async function HomePage() {
  const [stats, featuredPlayers, allPlayers] = await Promise.all([
    getSiteStats(),
    getPlayers({ featured: true }),
    getPlayers(),
  ]);

  const heroPlayers = featuredPlayers.length > 0 ? featuredPlayers : allPlayers;

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
