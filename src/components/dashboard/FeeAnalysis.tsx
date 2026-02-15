import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

export function FeeAnalysis() {
  const { filteredTrades } = useStore();

  // Group fees by day
  const feesByDay = new Map<string, { entry: number; exit: number; funding: number; total: number }>();

  for (const trade of filteredTrades) {
    const day = format(new Date(trade.closeTimestamp), 'yyyy-MM-dd');
    const existing = feesByDay.get(day) || { entry: 0, exit: 0, funding: 0, total: 0 };
    existing.entry += trade.fees.entry;
    existing.exit += trade.fees.exit;
    existing.funding += Math.abs(trade.fees.funding);
    existing.total += trade.fees.total;
    feesByDay.set(day, existing);
  }

  const sortedDays = Array.from(feesByDay.keys()).sort();
  let cumulative = 0;
  const data = sortedDays.map(day => {
    const fees = feesByDay.get(day)!;
    cumulative += fees.total;
    return {
      date: day,
      entry: Math.round(fees.entry * 100) / 100,
      exit: Math.round(fees.exit * 100) / 100,
      funding: Math.round(fees.funding * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100,
    };
  });

  const totalFees = filteredTrades.reduce((s, t) => s + t.fees.total, 0);
  const totalEntry = filteredTrades.reduce((s, t) => s + t.fees.entry, 0);
  const totalExit = filteredTrades.reduce((s, t) => s + t.fees.exit, 0);
  const totalFunding = filteredTrades.reduce((s, t) => s + Math.abs(t.fees.funding), 0);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-bg-tertiary border border-border rounded-lg p-3 shadow-xl">
        <p className="text-xs text-text-muted mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs text-text-secondary capitalize">{entry.dataKey}</span>
            <span className="text-xs font-mono text-text-primary">${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Fee Analysis</h3>
        <p className="text-xs text-text-muted mt-0.5">Breakdown by type with cumulative total</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Fees', value: totalFees },
          { label: 'Entry', value: totalEntry },
          { label: 'Exit', value: totalExit },
          { label: 'Funding', value: totalFunding },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <span className="text-[10px] text-text-muted uppercase block">{label}</span>
            <span className="text-sm font-mono text-text-primary">${value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="h-40 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis tick={{ fontSize: 9, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="entry" stackId="fees" fill="#6366f1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="exit" stackId="fees" fill="#818cf8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="funding" stackId="fees" fill="#a5b4fc" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative line */}
      <div className="h-24">
        <p className="text-[10px] text-text-muted mb-1">Cumulative Fees</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumFeeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={1.5} fill="url(#cumFeeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
