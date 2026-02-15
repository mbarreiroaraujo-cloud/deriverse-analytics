import { type ReactNode, useEffect, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  valueColor?: 'profit' | 'loss' | 'default';
  delay?: number;
}

export function MetricCard({ title, value, subtitle, icon, trend, trendValue, valueColor = 'default', delay = 0 }: MetricCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClass = valueColor === 'profit' ? 'text-profit' : valueColor === 'loss' ? 'text-loss' : 'text-text-primary';
  const trendIcon = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '';
  const trendColor = trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : 'text-text-secondary';

  return (
    <div
      className={`bg-bg-secondary/80 border border-border/50 rounded-2xl p-5 shadow-sm shadow-black/20 card-hover transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
        {icon && <span className="text-text-muted">{icon}</span>}
      </div>
      <div className={`font-mono text-xl font-semibold ${colorClass} mb-1`}>
        {value}
      </div>
      <div className="flex items-center gap-2">
        {subtitle && <span className="text-xs text-text-muted">{subtitle}</span>}
        {trendValue && (
          <span className={`text-xs font-mono ${trendColor}`}>
            {trendIcon} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
