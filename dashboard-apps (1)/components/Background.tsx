import React from 'react';
import { motion } from 'framer-motion';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      
      {/* Orb 1 - Purple */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-purple-700/20 blur-[100px]"
      />

      {/* Orb 2 - Cyan */}
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-[20%] right-[0%] w-[40vw] h-[40vw] rounded-full bg-cyan-700/20 blur-[100px]"
      />

      {/* Orb 3 - Blue */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5
        }}
        className="absolute bottom-0 left-[20%] w-[60vw] h-[60vw] rounded-full bg-blue-800/20 blur-[120px]"
      />
    </div>
  );
};
