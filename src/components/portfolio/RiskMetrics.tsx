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
      color: metrics.sharpeRatio >= 1 ? 'text-profit' : metrics.sharpeRatio >= 0 ? 'text-spot' : 'text-loss',
      rating: metrics.sharpeRatio >= 2 ? 'Excellent' : metrics.sharpeRatio >= 1 ? 'Good' : metrics.sharpeRatio >= 0 ? 'Fair' : 'Poor',
    },
    {
      label: 'Sortino Ratio',
      value: metrics.sortinoRatio.toFixed(2),
      description: 'Downside risk-adjusted return',
      icon: <TrendingUp size={16} />,
      color: metrics.sortinoRatio >= 1.5 ? 'text-profit' : metrics.sortinoRatio >= 0 ? 'text-spot' : 'text-loss',
      rating: metrics.sortinoRatio >= 3 ? 'Excellent' : metrics.sortinoRatio >= 1.5 ? 'Good' : metrics.sortinoRatio >= 0 ? 'Fair' : 'Poor',
    },
    {
      label: 'Profit Factor',
      value: metrics.profitFactor === Infinity ? '\u221E' : metrics.profitFactor.toFixed(2),
      description: 'Gross profits / Gross losses',
      icon: <Target size={16} />,
      color: metrics.profitFactor >= 1.5 ? 'text-profit' : metrics.profitFactor >= 1 ? 'text-spot' : 'text-loss',
      rating: metrics.profitFactor >= 2 ? 'Excellent' : metrics.profitFactor >= 1.5 ? 'Good' : metrics.profitFactor >= 1 ? 'Fair' : 'Poor',
    },
    {
      label: 'Expectancy',
      value: `$${metrics.expectancy.toFixed(2)}`,
      description: 'Expected profit per trade',
      icon: <Zap size={16} />,
      color: metrics.expectancy > 0 ? 'text-profit' : 'text-loss',
      rating: metrics.expectancy > 50 ? 'Strong Edge' : metrics.expectancy > 0 ? 'Positive Edge' : 'No Edge',
    },
  ];

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary">Risk-Adjusted Metrics</h3>
        <p className="text-xs text-text-muted mt-0.5">Institutional-grade performance indicators</p>
      </div>

      <div className="space-y-4">
        {riskMetrics.map(({ label, value, description, icon, color, rating }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-muted flex-shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">{label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    rating.includes('Excellent') || rating.includes('Strong') ? 'bg-profit/10 text-profit' :
                    rating.includes('Good') || rating.includes('Positive') ? 'bg-accent/10 text-accent' :
                    rating.includes('Fair') ? 'bg-spot/10 text-spot' : 'bg-loss/10 text-loss'
                  }`}>
                    {rating}
                  </span>
                  <span className={`text-lg font-mono font-bold ${color}`}>{value}</span>
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
