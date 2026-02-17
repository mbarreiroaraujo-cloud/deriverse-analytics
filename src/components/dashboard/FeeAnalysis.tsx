import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';
import { CardTimeRange } from '../shared/CardTimeRange';

const INIT_TIME = Date.now();

function FeeTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-tertiary/95 backdrop-blur-sm border border-border/70 rounded-lg p-3 shadow-xl shadow-black/40">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-xs text-text-secondary capitalize">{entry.dataKey}</span>
          <span className="text-xs font-mono text-text-primary">${entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export function FeeAnalysis() {
  const { filteredTrades } = useStore();
  const [localDays, setLocalDays] = useState(30);

  const cutoff = INIT_TIME - localDays * 86400000;
  const localTrades = filteredTrades.filter(t => t.timestamp >= cutoff);

  // Group fees by day
  const feesByDay = new Map<string, { entry: number; exit: number; funding: number; total: number }>();

  for (const trade of localTrades) {
    const day = format(new Date(trade.closeTimestamp), 'yyyy-MM-dd');
    const existing = feesByDay.get(day) || { entry: 0, exit: 0, funding: 0, total: 0 };
    existing.entry += trade.fees.entry;
    existing.exit += trade.fees.exit;
    existing.funding += Math.abs(trade.fees.funding);
    existing.total += trade.fees.total;
    feesByDay.set(day, existing);
  }

  const sortedDays = Array.from(feesByDay.keys()).sort();
  const data = sortedDays.reduce<Array<{ date: string; entry: number; exit: number; funding: number; cumulative: number }>>((acc, day) => {
    const fees = feesByDay.get(day)!;
    const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    acc.push({
      date: day,
      entry: Math.round(fees.entry * 100) / 100,
      exit: Math.round(fees.exit * 100) / 100,
      funding: Math.round(fees.funding * 100) / 100,
      cumulative: Math.round((prevCumulative + fees.total) * 100) / 100,
    });
    return acc;
  }, []);

  const totalFees = localTrades.reduce((s, t) => s + t.fees.total, 0);
  const totalEntry = localTrades.reduce((s, t) => s + t.fees.entry, 0);
  const totalExit = localTrades.reduce((s, t) => s + t.fees.exit, 0);
  const totalFunding = localTrades.reduce((s, t) => s + Math.abs(t.fees.funding), 0);

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Fee Analysis</h3>
          <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 hidden sm:block">Breakdown by type with cumulative total</p>
        </div>
        <CardTimeRange value={localDays} onChange={setLocalDays} />
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Fees', value: totalFees },
          { label: 'Entry', value: totalEntry },
          { label: 'Exit', value: totalExit },
          { label: 'Funding', value: totalFunding },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <span className="text-[10px] text-text-muted uppercase block">{label}</span>
            <span className="text-xs sm:text-sm font-mono font-semibold text-text-primary">${value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Stacked bar chart */}
      <div className="h-[140px] sm:h-[180px] mb-4 overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.slice(5)} />
            <YAxis width={45} tick={{ fontSize: 9, fill: '#475569' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip
              content={<FeeTooltip />}
              wrapperStyle={{ zIndex: 100, background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
              position={{ y: 10 }}
              allowEscapeViewBox={{ x: false, y: false }}
              offset={10}
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            />
            <Bar dataKey="entry" stackId="fees" fill="#6366f1" maxBarSize={30} radius={[0, 0, 0, 0]} />
            <Bar dataKey="exit" stackId="fees" fill="#818cf8" maxBarSize={30} radius={[0, 0, 0, 0]} />
            <Bar dataKey="funding" stackId="fees" fill="#a5b4fc" maxBarSize={30} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative line */}
      <div className="h-24 overflow-hidden rounded-lg">
        <p className="text-[10px] text-text-muted mb-1">Cumulative Fees</p>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cumFeeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="cumulative" stroke="#6366f1" strokeWidth={2} fill="url(#cumFeeGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
