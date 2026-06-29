import { Sidebar } from "./sidebar";
import { useEffect } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-starfield text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 relative">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
