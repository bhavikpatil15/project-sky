import { Link, useLocation } from "wouter";
import { LayoutDashboard, Globe, AlertTriangle, BarChart3, Search, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/approaches", label: "Approaches", icon: Globe },
  { path: "/hazardous", label: "Hazardous", icon: AlertTriangle },
  { path: "/statistics", label: "Statistics", icon: BarChart3 },
  { path: "/search", label: "Search", icon: Search },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar h-screen sticky top-0 flex flex-col glass-panel rounded-none">
      <div className="p-6">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
              <path d="M12 2v20" />
              <path d="M2 12h20" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-sidebar-foreground">
              Asteroid Watch
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-200",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border/50">
        <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
  );
}
