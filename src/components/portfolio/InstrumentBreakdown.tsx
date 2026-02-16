import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../../store/useStore';
import type { Instrument } from '../../data/types';

const TABS: { key: Instrument | 'all'; label: string; color: string }[] = [
  { key: 'all', label: 'All', color: '#6366f1' },
  { key: 'spot', label: 'Spot', color: '#f59e0b' },
  { key: 'perpetual', label: 'Perps', color: '#6366f1' },
  { key: 'options', label: 'Options', color: '#8b5cf6' },
  { key: 'futures', label: 'Futures', color: '#06b6d4' },
];

const INSTRUMENT_COLORS: Record<string, string> = {
  spot: '#f59e0b',
  perpetual: '#6366f1',
  options: '#8b5cf6',
  futures: '#06b6d4',
};

interface InstrumentData {
  name: string;
  pnl: number;
  winRate: number;
  trades: number;
  fees: number;
  volume: number;
  avgPnl: number;
  color: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: InstrumentData }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-tertiary/95 backdrop-blur-sm border border-border/70 rounded-lg p-3 shadow-xl shadow-black/40">
      <p className="text-xs font-medium text-text-primary mb-2">{d.name}</p>
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
}

export function InstrumentBreakdown() {
  const { metrics } = useStore();
  const [activeTab, setActiveTab] = useState<Instrument | 'all'>('all');

  const allData: InstrumentData[] = Object.entries(metrics.byInstrument).map(([key, m]) => ({
    name: key === 'perpetual' ? 'Perps' : key.charAt(0).toUpperCase() + key.slice(1),
    pnl: m.pnl,
    winRate: m.winRate,
    trades: m.tradeCount,
    fees: m.fees,
    volume: m.volume,
    avgPnl: m.avgPnl,
    color: INSTRUMENT_COLORS[key] || '#6366f1',
  }));

  const symbolData = Object.entries(metrics.bySymbol)
    .filter(([, m]) => activeTab === 'all' || m.tradeCount > 0)
    .map(([sym, m]) => ({ symbol: sym, ...m }))
    .sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Instrument Breakdown</h3>
          <p className="text-[10px] sm:text-xs text-text-muted mt-0.5 hidden sm:block">Performance by instrument type</p>
        </div>
        <div className="flex gap-1 bg-bg-primary rounded-lg p-0.5 overflow-x-auto scrollbar-hide">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === key ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[180px] sm:h-[200px] mb-4 overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8892a4' }} tickLine={false} axisLine={false} />
            <YAxis width={45} tick={{ fontSize: 10, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`} />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 100, background: 'transparent', border: 'none', boxShadow: 'none', outline: 'none' }}
              position={{ y: 10 }}
              allowEscapeViewBox={{ x: false, y: false }}
              offset={10}
              cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
            />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1500}>
              {allData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Symbol table */}
      <div className="border-t border-border/50 pt-4">
        <div className="max-h-48 overflow-y-auto space-y-1">
          {symbolData.slice(0, 10).map((s, i) => (
            <div key={s.symbol} className={`flex items-center justify-between py-1.5 px-2 rounded ${i % 2 === 0 ? 'bg-bg-primary/30' : ''} hover:bg-bg-tertiary/30`}>
              <span className="text-[11px] sm:text-xs font-mono font-medium text-text-primary">{s.symbol}</span>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-[10px] sm:text-xs text-text-muted">{s.tradeCount} trades</span>
                <span className="text-[10px] sm:text-xs font-mono font-semibold text-text-secondary">{s.winRate.toFixed(1)}%</span>
                <span className={`text-[10px] sm:text-xs font-mono font-semibold ${s.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {s.pnl >= 0 ? '+' : ''}${s.pnl.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
