import { Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function SavingsBanner() {
  const { metrics, setPage } = useStore();

  // Estimate savings with Pro tier (50% discount on trading fees)
  const potentialSaving = metrics.totalFees * 0.5;
  const monthlySaving = potentialSaving / 3; // 90-day period

  if (monthlySaving < 10) return null;

  return (
    <button
      onClick={() => setPage('fees')}
      className="w-full bg-accent/5 border border-accent/20 rounded-xl p-3 flex items-center gap-3 hover:bg-accent/10 transition-colors group text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] sm:text-sm font-medium text-accent">
          Save ~${monthlySaving.toFixed(0)}/month on fees
        </p>
        <p className="text-[10px] text-text-muted truncate">
          Deriverse subscription could save you ${potentialSaving.toFixed(0)} over 90 days
        </p>
      </div>
      <span className="text-[10px] text-accent group-hover:translate-x-0.5 transition-transform">&rarr;</span>
    </button>
  );
}
