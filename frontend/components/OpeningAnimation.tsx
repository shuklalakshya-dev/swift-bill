import { motion } from "framer-motion";
import { useEffect } from "react";

export default function OpeningAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    // Trigger the completion callback after animation finishes
    const timer = setTimeout(() => {
      onComplete();
    }, 5000); // 3 seconds total for animation sequence

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2, duration: 2}}
    >
      <motion.div
        className="relative"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ 
          scale: [0.1, 1, 4], // Start small, grow to normal size, then zoom in
          opacity: [0, 2, 0]    // Fade in, then fade out
        }}
        transition={{
          duration:3,
          times: [0, 0.5, 1],   // Timing sequence for animations
          ease: [0.6, -0.05, 0.01, 0.99] // Custom easing for that Netflix feel
        }}
      >
        <div className="text-blue-600 font-extrabold text-6xl md:text-9xl tracking-tighter
        border-8 border-blue-600 p-4 md:p-8 rounded-lg shadow-lg">
          SWIFT BILL
          
        </div>
        <p className="text-xl md:text-xl sm:text-xl text-white justify-center text-center space-x-3">Powered by shuklalakshya-dev</p>
      </motion.div>
    </motion.div>
  );
}