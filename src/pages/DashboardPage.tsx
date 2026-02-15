import { FilterBar } from '../components/shared/FilterBar';
import { TabSection } from '../components/shared/TabSection';
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
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="lg:col-span-1">
              <PnLCard />
            </div>
            <div className="lg:col-span-3">
              <StatsGrid />
            </div>
          </div>
          <EquityCurve />
        </div>
      ),
    },
    {
      id: 'analysis',
      label: 'Analysis',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <PerformanceHeatmap />
            <DirectionalBias />
          </div>
          <OrderTypeAnalysis />
        </div>
      ),
    },
    {
      id: 'fees-risk',
      label: 'Fees & Risk',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <FeeAnalysis />
            <RollingMetrics />
          </div>
          <BestWorstTrades />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <FilterBar />
      <TabSection tabs={tabs} defaultTab="overview" />
    </div>
  );
}
