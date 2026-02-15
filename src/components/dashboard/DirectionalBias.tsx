import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useStore } from '../../store/useStore';

export function DirectionalBias() {
  const { filteredTrades, metrics } = useStore();

  const longs = filteredTrades.filter(t => t.side === 'long');
  const shorts = filteredTrades.filter(t => t.side === 'short');

  const longPnl = longs.reduce((s, t) => s + t.pnl, 0);
  const shortPnl = shorts.reduce((s, t) => s + t.pnl, 0);
  const longWinRate = longs.length > 0 ? (longs.filter(t => t.pnl > 0).length / longs.length * 100) : 0;
  const shortWinRate = shorts.length > 0 ? (shorts.filter(t => t.pnl > 0).length / shorts.length * 100) : 0;

  const data = [
    { name: 'Long', value: longs.length, color: '#22c55e' },
    { name: 'Short', value: shorts.length, color: '#ef4444' },
  ];

  const ratio = metrics.longShortRatio;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Directional Bias</h3>
        <p className="text-xs text-text-muted mt-0.5">Long vs Short distribution & performance</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-28 h-28 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                animationDuration={1500}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="none" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-mono text-text-secondary">{ratio.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-xs text-text-secondary">Long</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-text-primary">{longs.length}</span>
              <span className="text-xs text-text-muted ml-1">({(longs.length / Math.max(filteredTrades.length, 1) * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">PnL</span>
            <span className={`font-mono ${longPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Win Rate</span>
            <span className="font-mono text-text-secondary">{longWinRate.toFixed(1)}%</span>
          </div>

          <div className="border-t border-border/50 pt-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-loss" />
              <span className="text-xs text-text-secondary">Short</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-text-primary">{shorts.length}</span>
              <span className="text-xs text-text-muted ml-1">({(shorts.length / Math.max(filteredTrades.length, 1) * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">PnL</span>
            <span className={`font-mono ${shortPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Win Rate</span>
            <span className="font-mono text-text-secondary">{shortWinRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
