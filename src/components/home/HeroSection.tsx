'use client';

import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import FadeIn from '@/components/common/FadeIn';

export default function HeroSection() {
  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__content container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="label mb-md">Community Based Football Club</p>
          <h1 className="hero__headline">
            From Talent Discovery To{' '}
            <span className="text-gold">Professional Success</span>
          </h1>
          <p className="hero__subheadline">
            CBFC develops, represents, and advances football talent through our
            Academy, Agency, and Professional Club structure.
          </p>
          <div className="hero__ctas">
            <Button href="/players" size="lg">
              Explore Players
            </Button>
            <Button href="/academy" variant="outline" size="lg">
              Join Academy
            </Button>
            <Button href="/agency" variant="ghost" size="lg">
              Contact Agency
            </Button>
          </div>
        </motion.div>

        <div className="hero__pillars">
          <FadeIn index={0}>
            <div className="hero__pillar">
              <h3>Academy</h3>
              <p>Developing tomorrow&apos;s football stars through elite youth programmes</p>
            </div>
          </FadeIn>
          <FadeIn index={1}>
            <div className="hero__pillar">
              <h3>Agency</h3>
              <p>Creating global opportunities and professional pathways for talent</p>
            </div>
          </FadeIn>
          <FadeIn index={2}>
            <div className="hero__pillar">
              <h3>Professional Club</h3>
              <p>Competing at the highest level and developing elite senior talent</p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
