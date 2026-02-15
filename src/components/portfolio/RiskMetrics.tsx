import { Shield, TrendingUp, Target, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function RiskMetrics() {
  const { metrics } = useStore();

  const riskMetrics = [
    {
      label: 'Sharpe Ratio',
      value: metrics.sharpeRatio.toFixed(2),
      description: 'Risk-adjusted return (annualized)',
      icon: <Shield size={16} />,
      rating: metrics.sharpeRatio >= 2 ? 'Excellent' : metrics.sharpeRatio >= 1 ? 'Good' : metrics.sharpeRatio >= 0 ? 'Fair' : 'Poor',
    },
    {
      label: 'Sortino Ratio',
      value: metrics.sortinoRatio.toFixed(2),
      description: 'Downside risk-adjusted return',
      icon: <TrendingUp size={16} />,
      rating: metrics.sortinoRatio >= 3 ? 'Excellent' : metrics.sortinoRatio >= 1.5 ? 'Good' : metrics.sortinoRatio >= 0 ? 'Fair' : 'Poor',
    },
    {
      label: 'Profit Factor',
      value: metrics.profitFactor === Infinity ? '\u221E' : metrics.profitFactor.toFixed(2),
      description: 'Gross profits / Gross losses',
      icon: <Target size={16} />,
      rating: metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1.5 ? 'Good' : metrics.profitFactor >= 1 ? 'Fair' : 'Poor',
    },
    {
      label: 'Expectancy',
      value: `$${metrics.expectancy.toFixed(2)}`,
      description: 'Expected profit per trade',
      icon: <Zap size={16} />,
      rating: metrics.expectancy > 50 ? 'Strong Edge' : metrics.expectancy > 0 ? 'Positive Edge' : 'No Edge',
    },
  ];

  const getRatingStyle = (rating: string) => {
    if (rating.includes('Excellent') || rating.includes('Strong')) return 'bg-accent/15 text-accent';
    if (rating.includes('Good') || rating.includes('Positive')) return 'bg-accent/10 text-accent-hover';
    if (rating.includes('Fair')) return 'bg-bg-tertiary text-text-secondary';
    return 'bg-bg-tertiary text-text-muted';
  };

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Risk-Adjusted Metrics</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Institutional-grade performance indicators</p>
      </div>

      <div className="space-y-4">
        {riskMetrics.map(({ label, value, description, icon, rating }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-muted flex-shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] sm:text-xs font-medium text-text-secondary">{label}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${getRatingStyle(rating)}`}>
                    {rating}
                  </span>
                  <span className="text-base sm:text-lg font-mono font-bold text-text-primary">{value}</span>
                </div>
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
