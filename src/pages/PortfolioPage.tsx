import { FilterBar } from '../components/shared/FilterBar';
import { TabSection } from '../components/shared/TabSection';
import { InstrumentBreakdown } from '../components/portfolio/InstrumentBreakdown';
import { RiskMetrics } from '../components/portfolio/RiskMetrics';
import { GreeksExposure } from '../components/portfolio/GreeksExposure';
import { MarginUtilization } from '../components/portfolio/MarginUtilization';
import { CorrelationMatrix } from '../components/portfolio/CorrelationMatrix';

export function PortfolioPage() {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <RiskMetrics />
          <InstrumentBreakdown />
        </div>
      ),
    },
    {
      id: 'risk',
      label: 'Risk',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <GreeksExposure />
          <MarginUtilization />
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
              <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-3">Position Summary</h3>
              <p className="text-[10px] sm:text-xs text-text-muted">Greeks and margin data provide a comprehensive risk overview of your leveraged and options positions.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'correlation',
      label: 'Correlation',
      content: (
        <div className="space-y-4 sm:space-y-6">
          <CorrelationMatrix />
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
