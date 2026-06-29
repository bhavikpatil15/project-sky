import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  delay?: number;
}

export function StatCard({ title, value, description, icon, className, loading, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn("glass-panel relative overflow-hidden group", className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
          {icon && <div className="text-primary/70">{icon}</div>}
        </CardHeader>
        <CardContent className="relative z-10">
          {loading ? (
             <div className="h-9 w-1/2 bg-muted/20 animate-pulse rounded mt-1" />
          ) : (
            <>
              <div className="text-3xl font-bold font-mono tracking-tight text-foreground/90">{value}</div>
              {description && (
                <p className="text-xs text-muted-foreground/70 mt-2 font-medium">{description}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
