import { useState } from "react";
import { useGetTodayNeos, getGetTodayNeosQueryKey } from "@workspace/api-client-react";
import { NeoTable } from "@/components/shared/neo-table";
import { AsteroidDrawer } from "@/components/shared/asteroid-drawer";
import { Globe } from "lucide-react";
import type { Neo } from "@workspace/api-client-react";
import { motion } from "framer-motion";

export function Approaches() {
  const [selectedNeo, setSelectedNeo] = useState<Neo | null>(null);

  const { data: feed, isLoading } = useGetTodayNeos({
    query: { queryKey: getGetTodayNeosQueryKey() }
  });

  const neosToday = feed?.near_earth_objects?.[0]?.asteroids || [];

  return (
    <div className="space-y-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 border-b border-white/10 pb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Today's Approaches</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Complete list of near-Earth objects making close approaches today.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NeoTable 
          neos={neosToday} 
          loading={isLoading} 
          onRowClick={setSelectedNeo}
        />
      </motion.div>

      <AsteroidDrawer 
        asteroid={selectedNeo} 
        open={!!selectedNeo} 
        onOpenChange={(open) => !open && setSelectedNeo(null)} 
      />
    </div>
  );
}
