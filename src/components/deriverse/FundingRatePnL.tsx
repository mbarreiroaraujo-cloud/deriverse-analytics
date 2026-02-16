import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Funding Rate PnL</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Trading vs funding cost separation for perpetuals</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <div className="text-center p-2 bg-bg-primary rounded-lg border border-border/50">
          <span className="text-[10px] text-text-muted uppercase block">Trading PnL</span>
          <span className={`text-xs sm:text-sm font-mono font-semibold ${tradingPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {tradingPnl >= 0 ? '+' : ''}${tradingPnl.toFixed(2)}
          </span>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded-lg border border-border/50">
          <span className="text-[10px] text-text-muted uppercase block">Funding Cost</span>
          <span className="text-xs sm:text-sm font-mono font-semibold text-text-primary">
            -${Math.abs(fundingPnl).toFixed(2)}
          </span>
        </div>
        <div className="text-center p-2 bg-bg-primary rounded-lg border border-border/50">
          <span className="text-[10px] text-text-muted uppercase block">Net Perps PnL</span>
          <span className={`text-xs sm:text-sm font-mono font-semibold ${netPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[180px] sm:h-[250px] overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis width={45} tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`} />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 100 }} />
            <Bar dataKey="trading" fill="#6366f1" maxBarSize={40} radius={[2, 2, 0, 0]} />
            <Bar dataKey="funding" fill="#f59e0b" maxBarSize={40} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-perps" />
          <span className="text-[10px] text-text-muted">Trading PnL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-sm bg-spot" />
          <span className="text-[10px] text-text-muted">Funding Cost</span>
        </div>
      </div>
    </div>
  );
}
