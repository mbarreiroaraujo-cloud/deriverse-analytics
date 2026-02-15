import { useStore } from '../../store/useStore';
import type { Setup } from '../../data/types';

const SETUPS: { value: Setup; label: string }[] = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'trend', label: 'Trend' },
  { value: 'mean-reversion', label: 'Mean Rev' },
  { value: 'range', label: 'Range' },
  { value: 'news', label: 'News' },
  { value: 'other', label: 'Other' },
];

interface SetupClassifierProps {
  tradeId: string;
  current?: Setup;
}

export function SetupClassifier({ tradeId, current }: SetupClassifierProps) {
  const updateJournal = useStore(s => s.updateTradeJournal);

  return (
    <div>
      <span className="text-[10px] text-text-muted uppercase block mb-1.5">Setup</span>
      <div className="flex flex-wrap gap-1">
        {SETUPS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateJournal(tradeId, { setup: value })}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
              current === value
                ? 'bg-accent/15 text-accent border-accent/20 ring-1 ring-accent/30'
                : 'bg-bg-primary text-text-muted border-border hover:border-text-muted/30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
