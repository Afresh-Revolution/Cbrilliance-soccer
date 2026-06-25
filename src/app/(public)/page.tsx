import ImmersiveHero from '@/components/home/ImmersiveHero';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import FeaturedPlayersSection from '@/components/home/FeaturedPlayersSection';
import ActivitySection from '@/components/home/ActivitySection';
import VideoHighlightsSection from '@/components/home/VideoHighlightsSection';

export default function HomePage() {
  return (
    <>
      <ImmersiveHero />
      <StatsSection />
      <FeaturedPlayersSection />
      <AboutSection />
      <ActivitySection />
      <VideoHighlightsSection />
    </>
  );
}
