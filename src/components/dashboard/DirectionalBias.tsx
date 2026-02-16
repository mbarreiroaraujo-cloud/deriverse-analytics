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
    { name: 'Long', value: longs.length, color: '#6366f1' },
    { name: 'Short', value: shorts.length, color: '#f59e0b' },
  ];

  const ratio = metrics.longShortRatio;

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Directional Bias</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Long vs Short distribution & performance</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
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
            <span className="text-xs font-mono font-semibold text-text-secondary">{ratio.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary">Long</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-text-primary">{longs.length}</span>
              <span className="text-xs text-text-muted ml-1">({(longs.length / Math.max(filteredTrades.length, 1) * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">PnL</span>
            <span className={`font-mono font-semibold ${longPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {longPnl >= 0 ? '+' : ''}${longPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Win Rate</span>
            <span className="font-mono font-semibold text-text-secondary">{longWinRate.toFixed(1)}%</span>
          </div>

          <div className="border-t border-border/50 pt-3" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-spot" />
              <span className="text-xs text-text-secondary">Short</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-text-primary">{shorts.length}</span>
              <span className="text-xs text-text-muted ml-1">({(shorts.length / Math.max(filteredTrades.length, 1) * 100).toFixed(0)}%)</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">PnL</span>
            <span className={`font-mono font-semibold ${shortPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {shortPnl >= 0 ? '+' : ''}${shortPnl.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Win Rate</span>
            <span className="font-mono font-semibold text-text-secondary">{shortWinRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
