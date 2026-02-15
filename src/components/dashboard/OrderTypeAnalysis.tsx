import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../../store/useStore';

const ORDER_TYPE_LABELS: Record<string, string> = {
  market: 'Market',
  limit: 'Limit',
  stop: 'Stop',
  'stop-limit': 'Stop-Limit',
};

export function OrderTypeAnalysis() {
  const { metrics } = useStore();

  const data = Object.entries(metrics.byOrderType).map(([type, m]) => ({
    type: ORDER_TYPE_LABELS[type] || type,
    pnl: m.pnl,
    winRate: m.winRate,
    trades: m.tradeCount,
    fill: m.pnl >= 0 ? '#22c55e' : '#ef4444',
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof data[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-bg-tertiary border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs font-medium text-text-primary mb-2">{d.type}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-xs text-text-muted">PnL</span>
            <span className={`text-xs font-mono ${d.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
              {d.pnl >= 0 ? '+' : ''}${d.pnl.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-text-muted">Win Rate</span>
            <span className="text-xs font-mono text-text-secondary">{d.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-xs text-text-muted">Trades</span>
            <span className="text-xs font-mono text-text-secondary">{d.trades}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Order Type Performance</h3>
        <p className="text-xs text-text-muted mt-0.5">PnL and win rate by order execution type</p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#8892a4' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary table */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="grid grid-cols-4 gap-2">
          {data.map(d => (
            <div key={d.type} className="text-center">
              <span className="text-[10px] text-text-muted block">{d.type}</span>
              <span className="text-xs font-mono text-text-secondary">{d.winRate.toFixed(1)}% WR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
