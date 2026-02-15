import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { format } from 'date-fns';

export function BestWorstTrades() {
  const { filteredTrades } = useStore();

  const sorted = [...filteredTrades].sort((a, b) => b.pnl - a.pnl);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  if (!best || !worst) return null;

  const TradeCard = ({ trade, type }: { trade: typeof best; type: 'best' | 'worst' }) => {
    const isBest = type === 'best';
    return (
      <div className="flex-1 rounded-xl p-4 border border-border/50 bg-bg-tertiary/30">
        <div className="flex items-center gap-2 mb-2">
          {isBest ? <ArrowUpRight size={16} className="text-text-secondary" /> : <ArrowDownRight size={16} className="text-text-secondary" />}
          <span className="text-xs font-medium text-text-muted uppercase">{isBest ? 'Largest Win' : 'Largest Loss'}</span>
        </div>
        <div className={`font-mono text-xl font-bold ${isBest ? 'text-profit' : 'text-loss'}`}>
          {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Symbol</span>
            <span className="text-xs font-mono text-text-primary">{trade.symbol}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Side</span>
            <span className="text-xs font-mono text-text-secondary">{trade.side.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Leverage</span>
            <span className="text-xs font-mono text-text-secondary">{trade.leverage}x</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Date</span>
            <span className="text-xs font-mono text-text-secondary">{format(new Date(trade.timestamp), 'MMM dd, HH:mm')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Best & Worst Trades</h3>
        <p className="text-xs text-text-muted mt-0.5">Extreme P&L for risk management awareness</p>
      </div>
      <div className="flex gap-4">
        <TradeCard trade={best} type="best" />
        <TradeCard trade={worst} type="worst" />
      </div>
    </div>
  );
}
