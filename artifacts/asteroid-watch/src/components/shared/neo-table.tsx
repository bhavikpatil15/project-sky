import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HazardBadge } from "@/components/ui/hazard-badge";
import type { Neo } from "@workspace/api-client-react";
import { formatNumber, formatDateTime } from "@/lib/format";
import { ChevronRight } from "lucide-react";

interface NeoTableProps {
  neos: Neo[];
  onRowClick: (neo: Neo) => void;
  loading?: boolean;
}

export function NeoTable({ neos, onRowClick, loading }: NeoTableProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (neos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground font-mono text-sm border border-dashed border-white/10 rounded-xl bg-white/5">
        No near-earth objects found.
      </div>
    );
  }

  return (
    <div className="glass-panel border border-white/10 rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-black/40 hover:bg-black/40">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Designation</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest hidden md:table-cell">Close Approach</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right">Miss Distance</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right hidden sm:table-cell">Velocity</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right hidden lg:table-cell">Size (Max)</TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground uppercase tracking-widest text-right">Hazard</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {neos.map((neo) => {
            const approach = neo.close_approach_data?.[0];
            return (
              <TableRow 
                key={neo.id}
                onClick={() => onRowClick(neo)}
                className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <TableCell className="font-bold text-white whitespace-nowrap">
                  {neo.name}
                  {neo.is_sentry_object && (
                    <div className="text-[10px] text-primary/70 font-mono">SENTRY</div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground hidden md:table-cell">
                  {approach ? formatDateTime(approach.close_approach_date_full) : "-"}
                </TableCell>
                <TableCell className="font-mono text-sm text-right">
                  {approach ? `${formatNumber(parseFloat(approach.miss_distance.lunar), 1)} LD` : "-"}
                </TableCell>
                <TableCell className="font-mono text-sm text-right hidden sm:table-cell text-muted-foreground">
                  {approach ? `${formatNumber(parseFloat(approach.relative_velocity.kilometers_per_second), 1)} km/s` : "-"}
                </TableCell>
                <TableCell className="font-mono text-sm text-right hidden lg:table-cell text-muted-foreground">
                  {formatNumber(neo.estimated_diameter.kilometers.estimated_diameter_max, 3)} km
                </TableCell>
                <TableCell className="text-right">
                  <HazardBadge isHazardous={neo.is_potentially_hazardous_asteroid} />
                </TableCell>
                <TableCell>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
