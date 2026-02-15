import { useStore } from '../store/useStore';

export function SettingsPage() {
  const { allTrades } = useStore();

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Data Summary</h3>
        <div className="space-y-2">
          {[
            { label: 'Total Trades', value: allTrades.length.toString() },
            { label: 'Date Range', value: `${new Date(allTrades[0]?.timestamp).toLocaleDateString()} - ${new Date(allTrades[allTrades.length - 1]?.timestamp).toLocaleDateString()}` },
            { label: 'Unique Symbols', value: new Set(allTrades.map(t => t.symbol)).size.toString() },
            { label: 'Instruments', value: [...new Set(allTrades.map(t => t.instrument))].join(', ') },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{label}</span>
              <span className="text-xs font-mono text-text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">About</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Deriverse Analytics is a professional trading analytics dashboard built for active derivatives traders on Solana.
          It features institutional-grade metrics including Sharpe Ratio, Sortino Ratio, Profit Factor, and Expectancy calculations,
          along with an intelligent trade journal and Deriverse-specific fee optimization tools.
        </p>
        <p className="text-xs text-text-muted mt-3">
          Currently running with simulated data. Connect to Deriverse SDK when available for live portfolio tracking.
        </p>
      </div>

      <div className="bg-bg-secondary border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-4">Data Source</h3>
        <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg border border-border">
          <span className="w-2 h-2 rounded-full bg-spot animate-pulse" />
          <div>
            <span className="text-xs font-medium text-text-primary">Mock Data (Demo Mode)</span>
            <p className="text-[10px] text-text-muted mt-0.5">
              Using realistic simulated trading data with {allTrades.length} trades across 90 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
