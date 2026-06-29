import { useGetNeoHistory, getGetNeoHistoryQueryKey, useGetNasaStats, getGetNasaStatsQueryKey } from "@workspace/api-client-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
  PieChart, Pie, Cell,
  ComposedChart, Line
} from "recharts";
import { formatNumber } from "@/lib/format";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Activity, PieChart as PieChartIcon, BarChart3, TrendingUp } from "lucide-react";

export function Statistics() {
  const { data: history, isLoading: historyLoading } = useGetNeoHistory({
    query: { queryKey: getGetNeoHistoryQueryKey() }
  });

  const { data: nasaStats, isLoading: statsLoading } = useGetNasaStats({
    query: { queryKey: getGetNasaStatsQueryKey() }
  });

  const chartData = history?.map(day => ({
    ...day,
    formattedDate: format(parseISO(day.date), 'MMM dd'),
    safe_count: day.total_count - day.hazardous_count
  })).reverse() || [];

  const totalApproaches = chartData.reduce((sum, day) => sum + day.total_count, 0);
  const totalHazardous = chartData.reduce((sum, day) => sum + day.hazardous_count, 0);
  
  const pieData = [
    { name: 'Safe Objects', value: totalApproaches - totalHazardous, color: 'hsl(210 40% 80%)' },
    { name: 'Hazardous', value: totalHazardous, color: 'hsl(0 84% 60%)' }
  ];

  return (
    <div className="space-y-6 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 border-b border-white/10 pb-6"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Global Statistics</h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Historical trends and distributions over the last 30 days.
          </p>
        </div>
      </motion.div>

      {statsLoading ? (
        <div className="h-24 bg-white/5 animate-pulse rounded-xl" />
      ) : nasaStats ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Total NEOs Discovered</div>
            <div className="text-3xl font-bold font-mono text-white">{formatNumber(nasaStats.neo_count, 0)}</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Total Close Approaches</div>
            <div className="text-3xl font-bold font-mono text-white">{formatNumber(nasaStats.close_approach_count, 0)}</div>
          </div>
          <div className="glass-panel p-6 rounded-xl border border-white/10">
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Database Last Updated</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{nasaStats.last_updated}</div>
          </div>
        </motion.div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Approaches Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/80">30-Day Approach Volume</h2>
          </div>
          <div className="h-[300px] w-full">
            {historyLoading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(190 100% 50%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(190 100% 50%)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 20%)" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="hsl(215 20% 65%)" fontSize={12} tickMargin={10} minTickGap={20} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(220 40% 6%)', borderColor: 'hsl(215 30% 12%)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white', fontFamily: 'monospace' }}
                    labelStyle={{ color: 'hsl(215 20% 65%)', marginBottom: '8px', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="total_count" name="Total Approaches" stroke="hsl(190 100% 50%)" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Hazard Distribution */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl border border-white/10"
        >
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/80">Hazard Distribution</h2>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {historyLoading ? (
              <div className="w-48 h-48 rounded-full bg-white/5 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(220 40% 6%)', borderColor: 'hsl(215 30% 12%)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white', fontFamily: 'monospace' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Velocity & Distance */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-mono uppercase tracking-widest text-white/80">Average Velocity vs. Miss Distance</h2>
          </div>
          <div className="h-[300px] w-full">
            {historyLoading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 30% 20%)" vertical={false} />
                  <XAxis dataKey="formattedDate" stroke="hsl(215 20% 65%)" fontSize={12} tickMargin={10} minTickGap={20} />
                  <YAxis yAxisId="left" stroke="hsl(215 20% 65%)" fontSize={12} orientation="left" />
                  <YAxis yAxisId="right" stroke="hsl(215 20% 65%)" fontSize={12} orientation="right" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(220 40% 6%)', borderColor: 'hsl(215 30% 12%)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white', fontFamily: 'monospace' }}
                    labelStyle={{ color: 'hsl(215 20% 65%)', marginBottom: '8px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '12px' }} />
                  <Bar yAxisId="left" dataKey="avg_velocity_kms" name="Avg Velocity (km/s)" fill="hsl(215 80% 60%)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="min_miss_distance_km" name="Min Distance (km)" stroke="hsl(40 90% 55%)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
