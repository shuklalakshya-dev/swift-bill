
"use client";
import { useEffect, useRef, useState } from "react";

export default function VantaBackground() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the window object and VANTA are available
    if (!vantaEffect && typeof window !== "undefined" && window.VANTA) {
      // Initialize the effect
      setVantaEffect(
        window.VANTA.CLOUDS({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          sunlightColor: 0xb4b4e8,
          skyColor: 0xf4f4, // Matching your current theme color
          cloudColor: 0xb4b4e8, // Slightly lighter purple for contrast
          speed: 2.1
        })
      );
    }

    // Cleanup function
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="absolute inset-0 z-5" />;
}