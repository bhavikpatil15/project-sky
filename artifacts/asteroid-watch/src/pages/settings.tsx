import { motion } from "framer-motion";
import { Settings as SettingsIcon, Database, ExternalLink, ShieldCheck, Github } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 border-b border-white/10 pb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Application information and data source attribution.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        <Card className="glass-panel border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="w-5 h-5 text-primary" />
              Data Source
            </CardTitle>
            <CardDescription className="font-mono text-xs">NASA Near Earth Object Web Service (NeoWs)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              NeoWs (Near Earth Object Web Service) is a RESTful web service for near earth Asteroid information. 
              With NeoWs a user can: search for Asteroids based on their closest approach date to Earth, 
              lookup a specific Asteroid with its NASA JPL small body id, as well as browse the overall data-set.
            </p>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10 font-mono text-xs text-white/80">
              <p className="mb-2"><strong>Data provided by:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Space Physics Data Facility (SPDF)</li>
                <li>Jet Propulsion Laboratory (JPL)</li>
                <li>Center for Near Earth Object Studies (CNEOS)</li>
              </ul>
            </div>
            <a 
              href="https://api.nasa.gov/" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-mono uppercase tracking-wide text-xs mt-2"
            >
              Visit NASA APIs <ExternalLink className="w-3 h-3" />
            </a>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10 bg-black/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Planetary Defense
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              A Potentially Hazardous Asteroid (PHA) is currently defined based on parameters that measure the asteroid's potential to make threatening close approaches to the Earth.
            </p>
            <p>
              Specifically, all asteroids with an Earth Minimum Orbit Intersection Distance (MOID) of 0.05 au or less and an absolute magnitude (H) of 22.0 or less are considered PHAs.
            </p>
            <p className="font-mono text-xs bg-red-500/10 text-red-400 p-3 rounded border border-red-500/20">
              Note: This application is for demonstration and educational purposes. Do not use for actual planetary defense operations.
            </p>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground pt-8 border-t border-white/10">
          <div>Asteroid Watch System v1.0.0</div>
          <div className="flex items-center gap-4">
            <span>Built with React + Vite</span>
            <Github className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
