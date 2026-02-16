import { useStore } from '../../store/useStore';
import type { RollingWindow } from '../../data/types';

function MetricRow({ label, value, format: fmt }: { label: string; value: number; format: 'ratio' | 'percent' | 'usd' }) {
  let display: string;
  let color: string;

  switch (fmt) {
    case 'ratio':
      display = value.toFixed(2);
      color = 'text-text-primary';
      break;
    case 'percent':
      display = `${value.toFixed(1)}%`;
      color = 'text-text-primary';
      break;
    case 'usd':
      display = `${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
      color = value >= 0 ? 'text-profit' : 'text-loss';
      break;
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-text-muted">{label}</span>
      <span className={`text-xs font-mono font-medium ${color}`}>{display}</span>
    </div>
  );
}

function WindowColumn({ title, window }: { title: string; window: RollingWindow }) {
  return (
    <div className="flex-1">
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">{title}</span>
      </div>
      <div className="space-y-0.5">
        <MetricRow label="Sharpe" value={window.sharpe} format="ratio" />
        <MetricRow label="Sortino" value={window.sortino} format="ratio" />
        <MetricRow label="Win Rate" value={window.winRate} format="percent" />
        <MetricRow label="PnL" value={window.pnl} format="usd" />
      </div>
    </div>
  );
}

export function RollingMetrics() {
  const { metrics } = useStore();

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Rolling Metrics</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Risk-adjusted performance across time windows</p>
      </div>

      <div className="flex gap-4 divide-x divide-border/50 overflow-x-auto scroll-smooth-touch">
        <WindowColumn title="7 Day" window={metrics.rolling7d} />
        <WindowColumn title="30 Day" window={metrics.rolling30d} />
        <WindowColumn title="90 Day" window={metrics.rolling90d} />
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Max Consecutive Wins</span>
            <span className="text-xs sm:text-sm font-mono font-semibold text-text-primary">{metrics.maxConsecutiveWins}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase block">Max Consecutive Losses</span>
            <span className="text-xs sm:text-sm font-mono font-semibold text-text-primary">{metrics.maxConsecutiveLosses}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
