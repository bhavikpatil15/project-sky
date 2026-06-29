import { useState } from "react";
import { 
  useGetTodayStats, getGetTodayStatsQueryKey,
  useGetTodayNeos, getGetTodayNeosQueryKey
} from "@workspace/api-client-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { OrbitalViz } from "@/components/dashboard/orbital-viz";
import { LiveClock } from "@/components/dashboard/clock";
import { NeoTable } from "@/components/shared/neo-table";
import { AsteroidDrawer } from "@/components/shared/asteroid-drawer";
import { formatNumber } from "@/lib/format";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Rocket, ShieldAlert, Crosshair, Zap, Ruler } from "lucide-react";
import type { Neo } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export function Dashboard() {
  const [selectedNeo, setSelectedNeo] = useState<Neo | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetTodayStats({
    query: { queryKey: getGetTodayStatsQueryKey() }
  });

  const { data: feed, isLoading: feedLoading } = useGetTodayNeos({
    query: { queryKey: getGetTodayNeosQueryKey() }
  });

  const neosToday = feed?.near_earth_objects?.[0]?.asteroids || [];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6 pt-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-red-400 font-bold">Live Monitoring</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Near-Earth Asteroid Monitoring</h1>
          <p className="text-muted-foreground text-sm font-mono max-w-2xl">
            Real-time tracking of near-Earth objects passing within 19.5 LD of Earth. Data provided by NASA JPL.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LiveClock />
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Asteroids Today" 
          value={stats?.asteroid_count ?? "-"} 
          icon={<Rocket className="w-5 h-5" />}
          loading={statsLoading}
          delay={0.1}
        />
        <StatCard 
          title="Hazardous Objects" 
          value={stats?.hazardous_count ?? "-"} 
          className={stats?.hazardous_count ? "border-red-500/30 bg-red-500/5" : ""}
          icon={<ShieldAlert className={`w-5 h-5 ${stats?.hazardous_count ? "text-red-500" : ""}`} />}
          loading={statsLoading}
          delay={0.2}
        />
        <StatCard 
          title="Closest Approach" 
          value={stats?.closest_approach_km ? `${formatNumber(stats.closest_approach_km / 384400, 1)} LD` : "-"} 
          icon={<Crosshair className="w-5 h-5" />}
          loading={statsLoading}
          delay={0.3}
        />
        <StatCard 
          title="Fastest Velocity" 
          value={stats?.fastest_velocity_kms ? `${formatNumber(stats.fastest_velocity_kms, 1)} km/s` : "-"} 
          icon={<Zap className="w-5 h-5" />}
          loading={statsLoading}
          delay={0.4}
        />
        <StatCard 
          title="Largest Asteroid" 
          value={stats?.largest_diameter_km ? `${formatNumber(stats.largest_diameter_km, 2)} km` : "-"} 
          icon={<Ruler className="w-5 h-5" />}
          loading={statsLoading}
          delay={0.5}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orbital Viz */}
        <motion.div 
          className="lg:col-span-2 glass-panel p-1 rounded-2xl border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="absolute top-4 left-4 z-20">
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/80 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-primary" />
              Orbital Proximity
            </h2>
          </div>
          <div className="w-full h-[400px] bg-black/40 rounded-xl relative overflow-hidden flex items-center justify-center">
            <OrbitalViz asteroids={neosToday} loading={feedLoading} />
          </div>
        </motion.div>

        {/* Featured Asteroid */}
        <motion.div 
          className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6">Featured Object</h2>
          
          {statsLoading ? (
             <div className="space-y-4">
               <div className="h-8 w-3/4 bg-white/5 animate-pulse rounded" />
               <div className="h-24 w-full bg-white/5 animate-pulse rounded" />
             </div>
          ) : stats?.featured_asteroid ? (
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <div className="text-3xl font-bold tracking-tight text-white mb-2">{stats.featured_asteroid.name}</div>
                <div className="flex gap-2">
                   {stats.featured_asteroid.is_potentially_hazardous_asteroid && (
                     <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/20 text-red-400 border border-red-500/30">Hazardous</span>
                   )}
                   <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/10 text-white/70 border border-white/20">
                     H: {stats.featured_asteroid.absolute_magnitude_h}
                   </span>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-muted-foreground">Velocity</span>
                  <span className="font-mono text-white font-bold">
                    {formatNumber(parseFloat(stats.featured_asteroid.close_approach_data?.[0]?.relative_velocity.kilometers_per_second || "0"), 2)} km/s
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-muted-foreground">Miss Distance</span>
                  <span className="font-mono text-white font-bold">
                    {formatNumber(parseFloat(stats.featured_asteroid.close_approach_data?.[0]?.miss_distance.lunar || "0"), 2)} LD
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-2">
                  <span className="text-xs font-mono text-muted-foreground">Max Diameter</span>
                  <span className="font-mono text-white font-bold">
                    {formatNumber(stats.featured_asteroid.estimated_diameter.kilometers.estimated_diameter_max, 3)} km
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedNeo(stats.featured_asteroid)}
                className="mt-6 w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-mono tracking-wide transition-colors"
              >
                View Full Analysis
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground font-mono text-sm">
              No featured asteroid today.
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Today's Approaches
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-mono text-white/70">
              {neosToday.length}
            </span>
          </h2>
        </div>
        <NeoTable 
          neos={neosToday.slice(0, 10)} 
          loading={feedLoading} 
          onRowClick={setSelectedNeo}
        />
        {neosToday.length > 10 && (
          <div className="mt-4 text-center">
            <a href="/approaches" className="text-sm font-mono text-primary hover:text-primary/80 transition-colors">
              View all {neosToday.length} approaches →
            </a>
          </div>
        )}
      </motion.div>

      <footer className="pt-12 pb-6 border-t border-white/10 mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs font-mono text-muted-foreground">
          Data provided by NASA Near Earth Object Web Service (NeoWs).
        </p>
        <div className="flex items-center gap-4 text-muted-foreground">
          <a href="#" className="hover:text-white transition-colors"><FaGithub className="w-5 h-5" /></a>
          <a href="#" className="hover:text-white transition-colors"><FaLinkedin className="w-5 h-5" /></a>
        </div>
      </footer>

      <AsteroidDrawer 
        asteroid={selectedNeo} 
        open={!!selectedNeo} 
        onOpenChange={(open) => !open && setSelectedNeo(null)} 
      />
    </div>
  );
}
