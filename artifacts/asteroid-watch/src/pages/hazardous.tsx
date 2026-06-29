import { useState } from "react";
import { useGetNeoFeed, getGetNeoFeedQueryKey } from "@workspace/api-client-react";
import { NeoTable } from "@/components/shared/neo-table";
import { AsteroidDrawer } from "@/components/shared/asteroid-drawer";
import { ShieldAlert } from "lucide-react";
import type { Neo } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export function Hazardous() {
  const [selectedNeo, setSelectedNeo] = useState<Neo | null>(null);

  // Next 7 days
  const startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  const { data: feed, isLoading } = useGetNeoFeed(
    { start_date: startDate, end_date: endDate },
    { query: { queryKey: getGetNeoFeedQueryKey({ start_date: startDate, end_date: endDate }) } }
  );

  // Flatten and filter
  const hazardousNeos = feed?.near_earth_objects?.flatMap(day => day.asteroids)
    .filter(a => a.is_potentially_hazardous_asteroid)
    .sort((a, b) => {
      // Sort by closest approach date
      const dateA = a.close_approach_data?.[0]?.epoch_date_close_approach || 0;
      const dateB = b.close_approach_data?.[0]?.epoch_date_close_approach || 0;
      return dateA - dateB;
    }) || [];

  return (
    <div className="space-y-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 border-b border-red-500/20 pb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Potentially Hazardous</h1>
          <p className="text-red-400/80 text-sm font-mono mt-1">
            Asteroids larger than ~140m that can come within 0.05 AU of Earth over the next 7 days.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NeoTable 
          neos={hazardousNeos} 
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
