'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function VibeChart({ data }: { data: any[] }) {
  // We need to format the data for Recharts (Date + Rating)
  const chartData = data
    .map(entry => ({
      date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      rating: entry.rating,
    }))
    .reverse(); // Show oldest to newest

  return (
    <div className="h-[300px] w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Rating Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 12}} 
            dy={10}
          />
          <YAxis 
            domain={[0, 5]} 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#94a3b8', fontSize: 12}}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="rating" 
            stroke="#3b82f6" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorRating)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}