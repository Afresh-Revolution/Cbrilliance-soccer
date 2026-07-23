import ImmersiveHero from '@/components/home/ImmersiveHero';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedPlayersSection from '@/components/home/FeaturedPlayersSection';
import ActivitySection from '@/components/home/ActivitySection';
import VideoHighlightsSection from '@/components/home/VideoHighlightsSection';
import ShopNowSection from '@/components/home/ShopNowSection';
import { getPlayers, getSiteStats, prioritizeFeaturedPlayers } from '@/lib/data/queries';
import { getShopProducts } from '@/lib/data/shop-admin';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [stats, allPlayers, shopProducts] = await Promise.all([
    getSiteStats(),
    getPlayers(),
    getShopProducts(),
  ]);

  const heroPlayers = prioritizeFeaturedPlayers(allPlayers, 6);

  return (
    <>
      <ImmersiveHero players={heroPlayers} stats={stats} />
      <StatsSection />
      <FeaturedPlayersSection />
      <AboutSection />
      <ShopNowSection products={shopProducts} />
      <ActivitySection />
      <VideoHighlightsSection />
    </>
  );
}
