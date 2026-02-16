import { Wallet, Calendar, Menu } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ExportButton } from '../shared/ExportButton';

export function Header() {
  const { filteredTrades, filters, setDateRange, metrics, sidebarOpen, setSidebarOpen } = useStore();

  const periods = [
    { label: '7D', days: 7 },
    { label: '30D', days: 30 },
    { label: '90D', days: 90 },
  ];

  const activeDays = Math.round((filters.dateRange[1] - filters.dateRange[0]) / 86400000);

  return (
    <header className="h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left: Hamburger + Period filter */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile/tablet only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden flex items-center justify-center w-9 h-9 min-w-[44px] min-h-[44px] rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <Calendar size={14} className="text-text-muted hidden sm:block" />
        <div className="flex items-center gap-1 bg-bg-primary rounded-md p-0.5">
          {periods.map(({ label, days }) => (
            <button
              key={label}
              onClick={() => setDateRange([Date.now() - days * 86400000, Date.now()])}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                Math.abs(activeDays - days) < 2
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted font-mono font-medium hidden sm:inline">{metrics.tradeCount} trades</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <ExportButton trades={filteredTrades} />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-primary border border-border rounded-md">
          <Wallet size={14} className="text-accent" />
          <span className="text-xs font-mono font-medium text-text-secondary hidden sm:inline">7xKp...3mNq</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        </div>
      </div>
    </header>
  );
}
