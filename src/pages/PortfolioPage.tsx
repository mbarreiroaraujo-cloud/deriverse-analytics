import { FilterBar } from '../components/shared/FilterBar';
import { InstrumentBreakdown } from '../components/portfolio/InstrumentBreakdown';
import { RiskMetrics } from '../components/portfolio/RiskMetrics';
import { GreeksExposure } from '../components/portfolio/GreeksExposure';
import { MarginUtilization } from '../components/portfolio/MarginUtilization';
import { CorrelationMatrix } from '../components/portfolio/CorrelationMatrix';

export function PortfolioPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <InstrumentBreakdown />
        <RiskMetrics />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GreeksExposure />
        <MarginUtilization />
        <CorrelationMatrix />
      </div>
    </div>
  );
}
