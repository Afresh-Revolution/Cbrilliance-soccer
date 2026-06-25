'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

interface FadeInProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export default function FadeIn({ children, index = 0, className }: FadeInProps) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
