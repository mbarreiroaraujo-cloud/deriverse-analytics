import { Target, Clock, TrendingUp, Award, BarChart3, Zap } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import { useStore } from '../../store/useStore';

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours < 24) return `${hours}h ${mins}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatUSD(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value >= 0 ? `+$${formatted}` : `-$${formatted}`;
}

export function StatsGrid() {
  const { metrics } = useStore();
  const wins = Math.round(metrics.tradeCount * metrics.winRate / 100);
  const losses = metrics.tradeCount - wins;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        title="Win Rate"
        value={`${metrics.winRate.toFixed(1)}%`}
        subtitle={`${wins}W / ${losses}L`}
        icon={<Target size={16} />}
        delay={50}
      />
      <MetricCard
        title="Trades"
        value={metrics.tradeCount.toString()}
        subtitle={`${Math.round(metrics.tradeCount / 90)}/day avg`}
        icon={<BarChart3 size={16} />}
        delay={100}
      />
      <MetricCard
        title="Avg Duration"
        value={formatDuration(metrics.avgTradeDuration)}
        icon={<Clock size={16} />}
        delay={150}
      />
      <MetricCard
        title="Profit Factor"
        value={metrics.profitFactor === Infinity ? '\u221E' : metrics.profitFactor.toFixed(2)}
        subtitle="Gross P / Gross L"
        icon={<TrendingUp size={16} />}
        delay={200}
      />
      <MetricCard
        title="Avg Win"
        value={formatUSD(metrics.avgWin)}
        valueColor="profit"
        icon={<Award size={16} />}
        delay={250}
      />
      <MetricCard
        title="Avg Loss"
        value={formatUSD(-metrics.avgLoss)}
        valueColor="loss"
        delay={300}
      />
      <MetricCard
        title="Expectancy"
        value={formatUSD(metrics.expectancy)}
        subtitle="Per trade edge"
        valueColor={metrics.expectancy >= 0 ? 'profit' : 'loss'}
        icon={<Zap size={16} />}
        delay={350}
      />
      <MetricCard
        title="Max Drawdown"
        value={`-${metrics.maxDrawdownPercent.toFixed(2)}%`}
        subtitle={formatUSD(-metrics.maxDrawdown)}
        valueColor="loss"
        delay={400}
      />
    </div>
  );
}
