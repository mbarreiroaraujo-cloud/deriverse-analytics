import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import type { Trade } from '../../data/types';
import { TradeDetail } from './TradeDetail';

type SortKey = 'timestamp' | 'symbol' | 'pnl' | 'side' | 'instrument';
type SortDir = 'asc' | 'desc';

export function TradeTable() {
  const { filteredTrades } = useStore();
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const perPage = 20;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...filteredTrades];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.symbol.toLowerCase().includes(q) ||
        t.instrument.toLowerCase().includes(q) ||
        t.side.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [filteredTrades, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronRight size={12} className="opacity-0 group-hover:opacity-50" />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const instrumentColor = (inst: string) => {
    switch (inst) {
      case 'spot': return 'text-spot';
      case 'perpetual': return 'text-perps';
      case 'options': return 'text-options';
      case 'futures': return 'text-futures';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Trade History</h3>
          <p className="text-xs text-text-muted mt-0.5">{filtered.length} trades</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search symbol, instrument..."
            className="bg-bg-primary border border-border rounded-md pl-8 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent/30 w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-bg-primary/50">
              {[
                { key: 'timestamp' as SortKey, label: 'Date' },
                { key: 'symbol' as SortKey, label: 'Symbol' },
                { key: 'instrument' as SortKey, label: 'Type' },
                { key: 'side' as SortKey, label: 'Side' },
                { key: 'pnl' as SortKey, label: 'PnL' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className="px-4 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider cursor-pointer hover:text-text-secondary group"
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon col={key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider">Leverage</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider">Fees</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider">Order</th>
              <th className="px-4 py-2.5 text-left font-medium text-text-muted uppercase tracking-wider">Grade</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((trade) => (
              <TradeRow
                key={trade.id}
                trade={trade}
                expanded={expandedId === trade.id}
                onToggle={() => setExpandedId(expandedId === trade.id ? null : trade.id)}
                instrumentColor={instrumentColor}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-1 text-xs text-text-secondary bg-bg-primary border border-border rounded disabled:opacity-30"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 text-xs text-text-secondary bg-bg-primary border border-border rounded disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function TradeRow({
  trade, expanded, onToggle, instrumentColor,
}: {
  trade: Trade;
  expanded: boolean;
  onToggle: () => void;
  instrumentColor: (inst: string) => string;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-border/50 cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
      >
        <td className="px-4 py-2.5 font-mono text-text-secondary">
          {format(new Date(trade.timestamp), 'MMM dd HH:mm')}
        </td>
        <td className="px-4 py-2.5 font-mono font-medium text-text-primary">{trade.symbol}</td>
        <td className={`px-4 py-2.5 ${instrumentColor(trade.instrument)}`}>
          <span className="capitalize">{trade.instrument === 'perpetual' ? 'Perp' : trade.instrument}</span>
        </td>
        <td className="px-4 py-2.5">
          <span className={`font-mono font-medium ${trade.side === 'long' ? 'text-profit' : 'text-loss'}`}>
            {trade.side.toUpperCase()}
          </span>
        </td>
        <td className="px-4 py-2.5">
          <span className={`font-mono font-medium ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
          </span>
        </td>
        <td className="px-4 py-2.5 font-mono text-text-secondary">{trade.leverage}x</td>
        <td className="px-4 py-2.5 font-mono text-text-muted">${trade.fees.total.toFixed(2)}</td>
        <td className="px-4 py-2.5 text-text-secondary capitalize">{trade.orderType}</td>
        <td className="px-4 py-2.5">
          {trade.journal?.grade && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              trade.journal.grade === 'A' ? 'bg-profit/15 text-profit' :
              trade.journal.grade === 'B' ? 'bg-accent/15 text-accent' :
              trade.journal.grade === 'C' ? 'bg-spot/15 text-spot' :
              'bg-loss/15 text-loss'
            }`}>
              {trade.journal.grade}
            </span>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={9} className="px-0 py-0">
            <TradeDetail trade={trade} />
          </td>
        </tr>
      )}
    </>
  );
}
