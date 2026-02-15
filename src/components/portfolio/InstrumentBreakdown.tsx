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

export function InstrumentBreakdown() {
  const { metrics } = useStore();
  const [activeTab, setActiveTab] = useState<Instrument | 'all'>('all');

  const allData = Object.entries(metrics.byInstrument).map(([key, m]) => ({
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof allData[0] }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-bg-tertiary border border-border rounded-lg p-3 shadow-xl">
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
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Instrument Breakdown</h3>
          <p className="text-xs text-text-muted mt-0.5">Performance by instrument type</p>
        </div>
        <div className="flex gap-1 bg-bg-primary rounded-md p-0.5">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === key ? 'bg-accent/15 text-accent' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={allData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8892a4' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#4a5568' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {allData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Symbol table */}
      <div className="border-t border-border/50 pt-3">
        <div className="max-h-48 overflow-y-auto space-y-1">
          {symbolData.slice(0, 10).map(s => (
            <div key={s.symbol} className="flex items-center justify-between py-1 px-2 rounded hover:bg-bg-tertiary/50">
              <span className="text-xs font-mono text-text-primary">{s.symbol}</span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-muted">{s.tradeCount} trades</span>
                <span className="text-xs font-mono text-text-secondary">{s.winRate.toFixed(1)}%</span>
                <span className={`text-xs font-mono ${s.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
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
