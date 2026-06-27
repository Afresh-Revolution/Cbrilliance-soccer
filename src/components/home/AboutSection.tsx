import FadeIn from '@/components/common/FadeIn';
import Button from '@/components/common/Button';

const pillars = [
  {
    mark: '01',
    title: 'Academy',
    description: 'Developing future football stars through structured youth programmes, elite coaching, and competitive match exposure.',
    href: '/academy',
  },
  {
    mark: '02',
    title: 'Agency',
    description: 'Creating global opportunities for players through scouting networks, trial placements, and international partnerships.',
    href: '/agency',
  },
  {
    mark: '03',
    title: 'Professional Club',
    description: 'Competing at the highest level while developing elite senior talent and representing excellence on the pitch.',
    href: '/club',
  },
];

export default function AboutSection() {
  return (
    <section className="section section--surface">
      <div className="container">
        <div className="section__header">
          <p className="label">About CBFC</p>
          <h2>A Complete Football Ecosystem</h2>
          <p>
            CBFC is more than a club. We are a comprehensive football ecosystem
            connecting youth development, player representation, and professional
            competition under one elite brand.
          </p>
        </div>

        <div className="grid grid--3">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.title} index={i}>
              <div className="pillar-card">
                <div className="pillar-card__icon">{pillar.mark}</div>
                <h3>{pillar.title}</h3>
                <p className="mb-lg">{pillar.description}</p>
                <Button href={pillar.href} variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
