import { FilterBar } from '../components/shared/FilterBar';
import { PnLCard } from '../components/dashboard/PnLCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { EquityCurve } from '../components/dashboard/EquityCurve';
import { PerformanceHeatmap } from '../components/dashboard/PerformanceHeatmap';
import { DirectionalBias } from '../components/dashboard/DirectionalBias';
import { FeeAnalysis } from '../components/dashboard/FeeAnalysis';
import { BestWorstTrades } from '../components/dashboard/BestWorstTrades';
import { OrderTypeAnalysis } from '../components/dashboard/OrderTypeAnalysis';
import { RollingMetrics } from '../components/dashboard/RollingMetrics';

export function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <FilterBar />

      {/* Top stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1">
          <PnLCard />
        </div>
        <div className="lg:col-span-3">
          <StatsGrid />
        </div>
      </div>

      {/* Equity curve - full width */}
      <EquityCurve />

      {/* Mid section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PerformanceHeatmap />
        <DirectionalBias />
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FeeAnalysis />
        <RollingMetrics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BestWorstTrades />
        <OrderTypeAnalysis />
      </div>
    </div>
  );
}
