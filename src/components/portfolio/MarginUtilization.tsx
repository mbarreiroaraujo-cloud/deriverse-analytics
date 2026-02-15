import { useStore } from '../../store/useStore';

export function MarginUtilization() {
  const { portfolio } = useStore();
  const utilPercent = (portfolio.usedMargin / portfolio.totalEquity) * 100;

  const getUtilColor = (pct: number) => {
    if (pct < 30) return { bar: 'bg-profit', text: 'text-profit', label: 'Conservative' };
    if (pct < 60) return { bar: 'bg-spot', text: 'text-spot', label: 'Moderate' };
    if (pct < 80) return { bar: 'bg-loss/70', text: 'text-loss', label: 'Aggressive' };
    return { bar: 'bg-loss', text: 'text-loss', label: 'Danger Zone' };
  };

  const { bar, text, label } = getUtilColor(utilPercent);

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary">Margin Utilization</h3>
          <p className="text-xs text-text-muted mt-0.5">Portfolio leverage and margin usage</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${text} bg-bg-tertiary border border-border`}>{label}</span>
      </div>

      {/* Usage bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-muted">Usage</span>
          <span className={`text-sm font-mono font-medium ${text}`}>{utilPercent.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-bg-primary rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${bar}`} style={{ width: `${Math.min(utilPercent, 100)}%` }} />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2">
        {[
          { label: 'Total Equity', value: portfolio.totalEquity },
          { label: 'Used Margin', value: portfolio.usedMargin },
          { label: 'Available', value: portfolio.availableMargin },
          { label: 'Unrealized PnL', value: portfolio.unrealizedPnl, colored: true },
        ].map(({ label, value, colored }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{label}</span>
            <span className={`text-xs font-mono ${colored ? (value >= 0 ? 'text-profit' : 'text-loss') : 'text-text-primary'}`}>
              ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      {/* Positions */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <span className="text-[10px] text-text-muted uppercase block mb-2">Open Positions ({portfolio.positions.length})</span>
        <div className="space-y-2">
          {portfolio.positions.map((pos, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 bg-bg-primary rounded border border-border/50">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${pos.side === 'long' ? 'text-profit' : 'text-loss'}`}>
                  {pos.side === 'long' ? 'L' : 'S'}
                </span>
                <span className="text-xs font-mono text-text-primary">{pos.symbol}</span>
                <span className="text-[10px] text-text-muted">{pos.leverage}x</span>
              </div>
              <span className={`text-xs font-mono ${pos.unrealizedPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
