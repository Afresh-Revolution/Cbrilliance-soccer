'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/common/Button';
import TypewriterText from '@/components/home/TypewriterText';
import HeroPlayerCarousel from '@/components/home/HeroPlayerCarousel';
import { seedPlayers } from '@/lib/data/seed';

export default function ImmersiveHero() {
  return (
    <section className="immersive-hero">
      <div className="mesh-glow mesh-glow--blue" style={{ width: 500, height: 500, top: '10%', right: '5%' }} />
      <div className="mesh-glow mesh-glow--gold" style={{ width: 300, height: 300, bottom: '20%', left: '10%' }} />

      <div className="immersive-hero__inner">
        <motion.div
          className="immersive-hero__copy"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="label">Community Based Football Club</p>
          <h1 className="immersive-hero__title">
            From Talent To <TypewriterText />
          </h1>
          <p className="immersive-hero__subtitle">
            An immersive football ecosystem — Academy, Agency, and Professional Club united under one elite pathway.
          </p>

          <div className="immersive-hero__ctas">
            <Button href="/players" variant="primary" size="lg">Explore Talent</Button>
            <Button href="/academy" variant="outline" size="lg">Join Academy</Button>
          </div>

          <div className="immersive-hero__pillars">
            {[
              { stat: '156+', label: 'Registered Players', title: 'Academy', desc: 'Elite youth development', href: '/academy' },
              { stat: '42', label: 'Academy Graduates', title: 'Agency', desc: 'Global representation', href: '/agency' },
              { stat: '12', label: 'Pro Placements', title: 'Club', desc: 'Professional competition', href: '/club' },
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <Link href={pillar.href} className="immersive-hero__pillar">
                  <div className="immersive-hero__pillar-stat">
                    <span>{pillar.stat}</span>
                    <small>{pillar.label}</small>
                  </div>
                  <div className="immersive-hero__pillar-divider" />
                  <h3>{pillar.title}</h3>
                  <p>{pillar.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="immersive-hero__visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <HeroPlayerCarousel players={seedPlayers} />
        </motion.div>
      </div>
    </section>
  );
}
