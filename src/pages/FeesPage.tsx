import { FilterBar } from '../components/shared/FilterBar';
import { FeeAnalysis } from '../components/dashboard/FeeAnalysis';
import { FeeSimulator } from '../components/deriverse/FeeSimulator';
import { FundingRatePnL } from '../components/deriverse/FundingRatePnL';
import { LiquidationProximity } from '../components/deriverse/LiquidationProximity';

export function FeesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FeeSimulator />
        <FeeAnalysis />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FundingRatePnL />
        <LiquidationProximity />
      </div>
    </div>
  );
}
