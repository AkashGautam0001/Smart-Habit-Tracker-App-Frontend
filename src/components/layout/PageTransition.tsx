import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const variants = {
  initial:  { opacity: 0, y: 6 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -6 },
};

export default function PageTransition({ children, className }: Props) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={className}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}
