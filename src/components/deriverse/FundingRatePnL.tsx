import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

export function FundingRatePnL() {
  const { filteredTrades } = useStore();

  const perpTrades = filteredTrades.filter(t => t.instrument === 'perpetual');
  const tradingPnl = perpTrades.reduce((s, t) => s + t.pnl, 0);
  const fundingPnl = perpTrades.reduce((s, t) => s + t.fees.funding, 0);
  const netPnl = tradingPnl - Math.abs(fundingPnl);

  // Group funding by day
  const byDay = new Map<string, { trading: number; funding: number }>();
  for (const trade of perpTrades) {
    const day = format(new Date(trade.closeTimestamp), 'yyyy-MM-dd');
    const existing = byDay.get(day) || { trading: 0, funding: 0 };
    existing.trading += trade.pnl;
    existing.funding += trade.fees.funding;
    byDay.set(day, existing);
  }

  const data = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, vals]) => ({
      date: day,
      trading: Math.round(vals.trading * 100) / 100,
      funding: Math.round(-vals.funding * 100) / 100,
    }));

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-tertiary border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-text-muted mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex justify-between gap-4">
            <span className="text-xs text-text-secondary capitalize">{entry.dataKey}</span>
            <span className={`text-xs font-mono ${entry.value >= 0 ? 'text-profit' : 'text-loss'}`}>
              {entry.value >= 0 ? '+' : ''}${entry.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Funding Rate PnL</h3>
        <p className="text-xs text-text-muted mt-0.5">Trading vs funding cost separation for perpetuals</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-bg-primary rounded border border-border">
          <span className="text-[10px] text-text-muted uppercase block">Trading PnL</span>
          <span className={`text-sm font-mono font-medium ${tradingPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {tradingPnl >= 0 ? '+' : ''}${tradingPnl.toFixed(2)}
          </span>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded border border-border">
          <span className="text-[10px] text-text-muted uppercase block">Funding Cost</span>
          <span className="text-sm font-mono font-medium text-loss">
            -${Math.abs(fundingPnl).toFixed(2)}
          </span>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded border border-border">
          <span className="text-[10px] text-text-muted uppercase block">Net Perps PnL</span>
          <span className={`text-sm font-mono font-medium ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="trading" fill="#6366f1" radius={[2, 2, 0, 0]} />
            <Bar dataKey="funding" radius={[2, 2, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.funding >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-perps" />
          <span className="text-[10px] text-text-muted">Trading PnL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-loss" />
          <span className="text-[10px] text-text-muted">Funding Cost</span>
        </div>
      </div>
    </div>
  );
}
