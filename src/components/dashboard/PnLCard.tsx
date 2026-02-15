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
    <div className="relative overflow-hidden bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] sm:text-xs font-medium text-text-muted uppercase tracking-wider">Total PnL</span>
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${isProfit ? 'bg-profit/10' : 'bg-loss/10'}`}>
            {isProfit ? <TrendingUp size={12} className="text-profit" /> : <TrendingDown size={12} className="text-loss" />}
            <span className={`text-[10px] sm:text-xs font-mono font-semibold ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {isProfit ? '+' : ''}{metrics.totalPnlPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className={`font-mono text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 ${isProfit ? 'text-profit' : 'text-loss'}`}>
          {formatUSD(displayValue)}
        </div>

        <div className="h-10 -mx-1">
          <MiniChart
            data={sparkData.length > 0 ? sparkData : [0]}
            color="#6366f1"
            height={40}
          />
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
          <div>
            <span className="text-[10px] text-text-muted uppercase">Volume</span>
            <p className="text-xs font-mono font-medium text-text-secondary">${(metrics.totalVolume / 1000).toFixed(1)}K</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase">Fees</span>
            <p className="text-xs font-mono font-medium text-text-secondary">${metrics.totalFees.toFixed(2)}</p>
          </div>
          <div>
            <span className="text-[10px] text-text-muted uppercase">Net</span>
            <p className={`text-xs font-mono font-medium ${(metrics.totalPnl - metrics.totalFees) >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatUSD(metrics.totalPnl - metrics.totalFees)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
