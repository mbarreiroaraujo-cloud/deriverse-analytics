import { useState, useMemo } from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { CardTimeRange } from '../shared/CardTimeRange';

export function EquityCurve() {
  const { metrics } = useStore();
  const [showDrawdown, setShowDrawdown] = useState(true);
  const [localDays, setLocalDays] = useState(90);

  const data = useMemo(() => {
    const cutoff = Date.now() - localDays * 86400000;
    return metrics.equityCurve
      .map((point, i) => ({
        date: point.date,
        equity: point.equity,
        pnl: point.pnl,
        drawdown: metrics.drawdownCurve[i]?.drawdownPercent || 0,
        timestamp: new Date(point.date).getTime(),
      }))
      .filter(p => p.timestamp >= cutoff);
  }, [metrics.equityCurve, metrics.drawdownCurve, localDays]);

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
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Equity Curve</h3>
          <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 hidden sm:block">Portfolio value over time with drawdown overlay</p>
        </div>
        <div className="flex items-center gap-2">
          <CardTimeRange value={localDays} onChange={setLocalDays} options={[7, 30, 90, 180, 365]} />
          <button
            onClick={() => setShowDrawdown(!showDrawdown)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              showDrawdown ? 'bg-accent/15 text-accent border border-accent/20' : 'text-text-muted border border-border/50'
            }`}
          >
            Drawdown
          </button>
        </div>
      </div>

      <div className="h-[200px] sm:h-[300px] overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              width={45}
              tick={{ fontSize: 10, fill: '#4a5568' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val}`}
            />
            {showDrawdown && (
              <YAxis
                yAxisId="dd"
                orientation="right"
                width={45}
                tick={{ fontSize: 10, fill: '#4a5568' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: number) => `-${val.toFixed(1)}%`}
                reversed
              />
            )}
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
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
