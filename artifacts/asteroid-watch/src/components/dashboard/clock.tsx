import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="text-xl font-mono font-bold text-cyan-400">
        {time.toISOString().substring(11, 19)}
      </div>
      <div className="text-xs text-muted-foreground font-mono tracking-widest">
        UTC
      </div>
    </div>
  );
}
