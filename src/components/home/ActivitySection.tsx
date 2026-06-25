import { getActivity } from '@/lib/data/queries';
import { formatDate } from '@/lib/utils/format';
import FadeIn from '@/components/common/FadeIn';

export default async function ActivitySection() {
  const activities = await getActivity();

  return (
    <section className="section section--dark">
      <div className="container">
        <div className="section__header">
          <p className="label">Latest Activity</p>
          <h2>What&apos;s Happening at CBFC</h2>
        </div>

        <div className="timeline">
          {activities.map((item, i) => (
            <FadeIn key={item.id} index={i}>
              <div className="timeline__item">
                <p className="timeline__date">{formatDate(item.date)}</p>
                <h4 className="timeline__title">{item.title}</h4>
                <p className="timeline__desc">{item.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
