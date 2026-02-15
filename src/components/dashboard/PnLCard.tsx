import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MiniChart } from '../shared/MiniChart';

function formatUSD(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
}

export function PnLCard() {
  const { metrics } = useStore();
  const [displayValue, setDisplayValue] = useState(0);
  const target = metrics.totalPnl;
  const isProfit = target >= 0;

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (step >= steps) {
        setDisplayValue(target);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  const sparkData = metrics.equityCurve.map(p => p.equity);

  return (
    <div className={`relative overflow-hidden bg-bg-secondary border rounded-xl p-5 card-hover ${isProfit ? 'border-profit/20' : 'border-loss/20'}`}>
      {/* Background glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 ${isProfit ? 'bg-profit' : 'bg-loss'}`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Total PnL</span>
          <div className="flex items-center gap-1">
            {isProfit ? <TrendingUp size={14} className="text-profit" /> : <TrendingDown size={14} className="text-loss" />}
            <span className={`text-xs font-mono ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {isProfit ? '+' : ''}{metrics.totalPnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className={`font-mono text-3xl font-bold mb-3 ${isProfit ? 'text-profit' : 'text-loss'}`}>
          {formatUSD(displayValue)}
        </div>

        <div className="h-10 -mx-1">
          <MiniChart
            data={sparkData.length > 0 ? sparkData : [0]}
            color={isProfit ? '#22c55e' : '#ef4444'}
            height={40}
          />
        </div>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
          <div>
            <span className="text-[10px] text-text-muted uppercase">Volume</span>
            <p className="text-xs font-mono text-text-secondary">${(metrics.totalVolume / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase">Fees</span>
            <p className="text-xs font-mono text-loss">${metrics.totalFees.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase">Net</span>
            <p className={`text-xs font-mono ${(metrics.totalPnl - metrics.totalFees) >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatUSD(metrics.totalPnl - metrics.totalFees)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
