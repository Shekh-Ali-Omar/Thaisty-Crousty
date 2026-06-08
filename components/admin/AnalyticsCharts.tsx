"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { GlassCard } from "@/components/glass/GlassCard";

interface AnalyticsChartsProps {
  data: any[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Trend */}
      <GlassCard className="p-8 border-white/5 flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-black tracking-tight">Revenue Trend</h3>
          <p className="text-xs text-muted font-medium">Daily performance tracking.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF8C00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${value} DA`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0F0F0F", 
                  border: "1px solid #ffffff10",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#FF8C00" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Order Volume */}
      <GlassCard className="p-8 border-white/5 flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-black tracking-tight">Order Volume</h3>
          <p className="text-xs text-muted font-medium">Customer activity flow.</p>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff40" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#0F0F0F", 
                  border: "1px solid #ffffff10",
                  borderRadius: "12px",
                  fontSize: "12px"
                }}
              />
              <Line 
                type="stepAfter" 
                dataKey="orders" 
                stroke="#4ade80" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#4ade80", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
