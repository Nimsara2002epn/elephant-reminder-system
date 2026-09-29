import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const PageTransition = ({ children, className = '' }) => {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.995 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -5 },
      };

  const transition = shouldReduceMotion
    ? { duration: 0.15 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
