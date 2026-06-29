import { useEffect, useRef, useMemo } from "react";
import type { Neo } from "@workspace/api-client-react";

interface OrbitalVizProps {
  asteroids: Neo[];
  loading?: boolean;
}

// Very simple pseudo-random generator based on ID string
function hashCode(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function OrbitalViz({ asteroids, loading }: OrbitalVizProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const dots = useMemo(() => {
    return asteroids.slice(0, 30).map(a => {
      const distanceStr = a.close_approach_data?.[0]?.miss_distance?.lunar || "10";
      let distance = parseFloat(distanceStr);
      // Normalize distance to fit nicely in 0-100 scale for plotting
      distance = Math.max(5, Math.min(distance * 5, 45)); 
      
      const angle = (Math.abs(hashCode(a.id)) % 360) * (Math.PI / 180);
      
      const x = 50 + distance * Math.cos(angle);
      const y = 50 + distance * Math.sin(angle);
      
      return {
        id: a.id,
        x,
        y,
        isHazardous: a.is_potentially_hazardous_asteroid,
        name: a.name,
      };
    });
  }, [asteroids]);

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center relative" ref={containerRef}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      <svg viewBox="0 0 100 100" className="w-full h-full max-h-[400px] overflow-visible">
        {/* Deep space glow */}
        <defs>
          <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(190 100% 50% / 0.4)" />
            <stop offset="100%" stopColor="hsl(190 100% 50% / 0)" />
          </radialGradient>
          <radialGradient id="hazardGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(0 84% 60% / 0.8)" />
            <stop offset="100%" stopColor="hsl(0 84% 60% / 0)" />
          </radialGradient>
        </defs>

        {/* Orbit Rings */}
        <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(215 30% 25%)" strokeWidth="0.2" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(215 30% 25%)" strokeWidth="0.2" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(215 30% 25%)" strokeWidth="0.2" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(215 30% 25%)" strokeWidth="0.2" strokeDasharray="1 2" />

        {/* Earth */}
        <circle cx="50" cy="50" r="6" fill="url(#earthGlow)" />
        <circle cx="50" cy="50" r="2" fill="hsl(190 100% 60%)" />
        
        {/* Crosshairs */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="hsl(190 100% 50% / 0.1)" strokeWidth="0.1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(190 100% 50% / 0.1)" strokeWidth="0.1" />

        {/* Asteroids */}
        {dots.map(dot => (
          <g key={dot.id} className="transition-all duration-700 ease-in-out cursor-pointer hover:opacity-100">
            {dot.isHazardous && (
              <circle cx={dot.x} cy={dot.y} r="3" fill="url(#hazardGlow)" className="animate-pulse" />
            )}
            <circle 
              cx={dot.x} 
              cy={dot.y} 
              r={dot.isHazardous ? "0.8" : "0.5"} 
              fill={dot.isHazardous ? "hsl(0 84% 60%)" : "hsl(210 40% 80%)"} 
            />
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 text-[10px] font-mono text-muted-foreground bg-black/40 p-2 rounded backdrop-blur-md border border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(210,40%,80%)]" /> Safe Object
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(0,84%,60%)] shadow-[0_0_8px_hsl(0,84%,60%)]" /> Potentially Hazardous
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-[hsl(190,100%,60%)] shadow-[0_0_8px_hsl(190,100%,50%)]" /> Earth (Center)
        </div>
      </div>
    </div>
  );
}
