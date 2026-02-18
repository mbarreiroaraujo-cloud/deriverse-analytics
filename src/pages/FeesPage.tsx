import { FilterBar } from '../components/shared/FilterBar';
import { TabSection } from '../components/shared/TabSection';
import { FeeAnalysis } from '../components/dashboard/FeeAnalysis';
import { FeeSimulator } from '../components/deriverse/FeeSimulator';
import { FundingRatePnL } from '../components/deriverse/FundingRatePnL';

export function FeesPage() {
  const tabs = [
    {
      id: 'breakdown',
      label: 'Breakdown',
      content: (
        <div className="space-y-5 sm:space-y-6">
          <FeeAnalysis />
        </div>
      ),
    },
    {
      id: 'optimizer',
      label: 'Optimizer',
      content: (
        <div className="space-y-5 sm:space-y-6">
          <FeeSimulator />
        </div>
      ),
    },
    {
      id: 'funding',
      label: 'Funding',
      content: (
        <div className="space-y-5 sm:space-y-6">
          <FundingRatePnL />
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <FilterBar />
      <TabSection tabs={tabs} defaultTab="breakdown" />
    </div>
  );
}
