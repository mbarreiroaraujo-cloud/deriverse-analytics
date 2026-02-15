import { Filter, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { Instrument } from '../../data/types';

export function FilterBar() {
  const { filters, setInstruments, setSymbols, resetFilters, allTrades } = useStore();

  const allSymbols = [...new Set(allTrades.map(t => t.symbol))].sort();
  const instruments: { key: Instrument; label: string; color: string }[] = [
    { key: 'spot', label: 'Spot', color: 'bg-spot' },
    { key: 'perpetual', label: 'Perps', color: 'bg-perps' },
    { key: 'options', label: 'Options', color: 'bg-options' },
    { key: 'futures', label: 'Futures', color: 'bg-futures' },
  ];

  const hasFilters = filters.instruments.length > 0 || filters.symbols.length > 0;

  const toggleInstrument = (inst: Instrument) => {
    const next = filters.instruments.includes(inst)
      ? filters.instruments.filter(i => i !== inst)
      : [...filters.instruments, inst];
    setInstruments(next);
  };

  const toggleSymbol = (sym: string) => {
    const next = filters.symbols.includes(sym)
      ? filters.symbols.filter(s => s !== sym)
      : [...filters.symbols, sym];
    setSymbols(next);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Filter size={14} className="text-text-muted" />
      {/* Instrument filters */}
      <div className="flex items-center gap-1">
        {instruments.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleInstrument(key)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
              filters.instruments.length === 0 || filters.instruments.includes(key)
                ? 'text-text-primary bg-bg-tertiary border border-border'
                : 'text-text-muted bg-bg-secondary border border-transparent opacity-50'
            }`}
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} mr-1.5`} />
            {label}
          </button>
        ))}
      </div>

      {/* Symbol dropdown */}
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) toggleSymbol(e.target.value);
        }}
        className="bg-bg-secondary border border-border rounded text-xs text-text-secondary px-2 py-1 outline-none focus:border-accent/30"
      >
        <option value="">+ Symbol</option>
        {allSymbols.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Active symbol tags */}
      {filters.symbols.map(sym => (
        <span key={sym} className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent text-xs rounded">
          {sym}
          <button onClick={() => toggleSymbol(sym)} className="hover:text-text-primary">
            <X size={12} />
          </button>
        </span>
      ))}

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={resetFilters}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
