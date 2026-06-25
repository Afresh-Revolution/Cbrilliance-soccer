import { getVideos } from '@/lib/data/queries';
import VideoCard from '@/components/video/VideoCard';
import FadeIn from '@/components/common/FadeIn';
import Button from '@/components/common/Button';

export default async function VideoHighlightsSection() {
  const videos = await getVideos();

  return (
    <section className="section section--surface">
      <div className="container">
        <div className="section__header">
          <p className="label">Media</p>
          <h2>Video Highlights</h2>
          <p>Watch featured player highlights, match clips, and academy training footage.</p>
        </div>

        <div className="grid grid--3">
          {videos.slice(0, 3).map((video, i) => (
            <FadeIn key={video.id} index={i}>
              <VideoCard video={video} />
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-xl">
          <Button href="/video-hub" variant="outline">
            Visit Video Hub
          </Button>
        </div>
      </div>
    </section>
  );
}
