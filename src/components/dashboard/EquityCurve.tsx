import { useState } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart,
} from 'recharts';
import { useStore } from '../../store/useStore';

export function EquityCurve() {
  const { metrics } = useStore();
  const [showDrawdown, setShowDrawdown] = useState(true);

  const data = metrics.equityCurve.map((point, i) => ({
    date: point.date,
    equity: point.equity,
    pnl: point.pnl,
    drawdown: metrics.drawdownCurve[i]?.drawdownPercent || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-tertiary border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-text-muted mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary capitalize">{entry.dataKey}</span>
            <span className={`text-xs font-mono ${
              entry.dataKey === 'drawdown' ? 'text-loss' :
              entry.dataKey === 'pnl' ? (entry.value >= 0 ? 'text-profit' : 'text-loss') :
              'text-text-primary'
            }`}>
              {entry.dataKey === 'equity' ? `$${entry.value.toLocaleString()}` :
               entry.dataKey === 'drawdown' ? `-${entry.value.toFixed(2)}%` :
               `${entry.value >= 0 ? '+' : ''}$${entry.value.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Equity Curve</h3>
          <p className="text-xs text-text-muted mt-0.5">Portfolio value over time with drawdown overlay</p>
        </div>
        <button
          onClick={() => setShowDrawdown(!showDrawdown)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            showDrawdown ? 'bg-loss/10 text-loss border border-loss/20' : 'text-text-muted border border-border'
          }`}
        >
          Drawdown
        </button>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#4a5568' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis
              yAxisId="equity"
              orientation="left"
              tick={{ fontSize: 10, fill: '#4a5568' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}K`}
            />
            {showDrawdown && (
              <YAxis
                yAxisId="dd"
                orientation="right"
                tick={{ fontSize: 10, fill: '#4a5568' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `-${val.toFixed(1)}%`}
                reversed
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="equity"
              type="monotone"
              dataKey="equity"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#equityGradient)"
              isAnimationActive={true}
              animationDuration={2000}
            />
            {showDrawdown && (
              <Area
                yAxisId="dd"
                type="monotone"
                dataKey="drawdown"
                stroke="#ef4444"
                strokeWidth={1}
                fill="url(#drawdownGradient)"
                isAnimationActive={true}
                animationDuration={2000}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
