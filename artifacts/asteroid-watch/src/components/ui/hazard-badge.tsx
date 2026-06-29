import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function HazardBadge({ isHazardous, className }: { isHazardous: boolean | undefined; className?: string }) {
  if (isHazardous) {
    return (
      <Badge variant="destructive" className={cn("bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/50 font-mono text-[10px] uppercase tracking-wider", className)}>
        <AlertTriangle className="w-3 h-3 mr-1.5" />
        Potentially Hazardous
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className={cn("bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20 font-mono text-[10px] uppercase tracking-wider", className)}>
      <ShieldCheck className="w-3 h-3 mr-1.5" />
      Non-Hazardous
    </Badge>
  );
}
