import { useState } from "react";
import { useSearchNeos, getSearchNeosQueryKey } from "@workspace/api-client-react";
import { NeoTable } from "@/components/shared/neo-table";
import { AsteroidDrawer } from "@/components/shared/asteroid-drawer";
import { useDebounce } from "@/hooks/use-debounce";
import { Search as SearchIcon, Filter } from "lucide-react";
import type { Neo } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function Search() {
  const [query, setQuery] = useState("");
  const [hazardousOnly, setHazardousOnly] = useState(false);
  const [selectedNeo, setSelectedNeo] = useState<Neo | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading, isFetching } = useSearchNeos(
    { query: debouncedQuery, hazardous_only: hazardousOnly },
    { 
      query: { 
        queryKey: getSearchNeosQueryKey({ query: debouncedQuery, hazardous_only: hazardousOnly }),
        enabled: debouncedQuery.length > 0 
      } 
    }
  );

  return (
    <div className="space-y-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 pb-6"
      >
        <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Database Search</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by asteroid name or NASA designation (e.g. Apophis, 433, Eros)..."
              className="pl-10 h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3 glass-panel px-4 h-12 rounded-md border-white/10">
            <Switch 
              id="hazardous-mode" 
              checked={hazardousOnly}
              onCheckedChange={setHazardousOnly}
              className="data-[state=checked]:bg-red-500"
            />
            <Label htmlFor="hazardous-mode" className="font-mono text-sm cursor-pointer whitespace-nowrap">
              Hazardous Only
            </Label>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {debouncedQuery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-2xl border border-dashed border-white/20">
            <SearchIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Search the NASA Database</h3>
            <p className="text-sm font-mono text-muted-foreground max-w-md text-center">
              Enter a designation or name to find specific near-Earth objects. The search uses partial matching.
            </p>
          </div>
        ) : (
          <NeoTable 
            neos={results || []} 
            loading={isLoading || isFetching} 
            onRowClick={setSelectedNeo}
          />
        )}
      </motion.div>

      <AsteroidDrawer 
        asteroid={selectedNeo} 
        open={!!selectedNeo} 
        onOpenChange={(open) => !open && setSelectedNeo(null)} 
      />
    </div>
  );
}
