import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useGetNeoById, getGetNeoByIdQueryKey } from "@workspace/api-client-react";
import type { Neo } from "@workspace/api-client-react";
import { formatNumber, formatDateTime } from "@/lib/format";
import { HazardBadge } from "@/components/ui/hazard-badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Rocket, Navigation2, Ruler, ShieldAlert } from "lucide-react";

interface AsteroidDrawerProps {
  asteroid: Neo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AsteroidDrawer({ asteroid: initialAsteroid, open, onOpenChange }: AsteroidDrawerProps) {
  const { data: fullAsteroid, isLoading } = useGetNeoById(initialAsteroid?.id || "", {
    query: {
      enabled: !!initialAsteroid?.id && open,
      queryKey: getGetNeoByIdQueryKey(initialAsteroid?.id || ""),
    }
  });

  const asteroid = fullAsteroid || initialAsteroid;

  if (!asteroid && !isLoading) return null;

  const approach = asteroid?.close_approach_data?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-sidebar/95 backdrop-blur-xl border-l-sidebar-border/50 text-foreground overflow-y-auto">
        {isLoading ? (
          <div className="space-y-6 pt-6">
            <div className="h-8 bg-white/5 animate-pulse rounded" />
            <div className="h-32 bg-white/5 animate-pulse rounded-xl" />
            <div className="h-48 bg-white/5 animate-pulse rounded-xl" />
          </div>
        ) : asteroid ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">NEO Designation</span>
                <HazardBadge isHazardous={asteroid.is_potentially_hazardous_asteroid} />
              </div>
              <SheetTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                {asteroid.name}
              </SheetTitle>
              <SheetDescription className="font-mono text-xs text-primary">
                ID: {asteroid.id} {asteroid.is_sentry_object && " • SENTRY OBJECT"}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {/* Velocity & Distance */}
              {approach && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Rocket className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider">Velocity</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {formatNumber(parseFloat(approach.relative_velocity.kilometers_per_second))} <span className="text-sm text-muted-foreground">km/s</span>
                    </div>
                  </div>
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <Navigation2 className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-wider">Miss Distance</span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {formatNumber(parseFloat(approach.miss_distance.lunar))} <span className="text-sm text-muted-foreground">LD</span>
                    </div>
                  </div>
                </div>
              )}

              <Separator className="bg-white/10" />

              {/* Sizing */}
              <div>
                <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-primary" /> Estimated Dimensions
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Min Diameter</div>
                    <div className="font-mono text-lg">{formatNumber(asteroid.estimated_diameter.kilometers.estimated_diameter_min, 3)} km</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Max Diameter</div>
                    <div className="font-mono text-lg">{formatNumber(asteroid.estimated_diameter.kilometers.estimated_diameter_max, 3)} km</div>
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* Approach Details */}
              {approach && (
                <div>
                  <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-primary" /> Approach Data
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Closest Approach Date</div>
                      <div className="font-mono text-sm">{formatDateTime(approach.close_approach_date_full)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Orbiting Body</div>
                        <div className="font-mono text-sm">{approach.orbiting_body}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1 font-mono uppercase">Abs. Magnitude</div>
                        <div className="font-mono text-sm">{asteroid.absolute_magnitude_h} H</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6">
                <a 
                  href={asteroid.nasa_jpl_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-colors font-medium text-sm font-mono tracking-wide"
                >
                  View JPL Data <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
