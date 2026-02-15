import { useStore } from '../../store/useStore';
import type { Grade } from '../../data/types';

const GRADES: { value: Grade; label: string; selectedStyle: string }[] = [
  { value: 'A', label: 'A', selectedStyle: 'bg-accent/20 text-accent border-accent/30' },
  { value: 'B', label: 'B', selectedStyle: 'bg-accent/12 text-accent-hover border-accent/20' },
  { value: 'C', label: 'C', selectedStyle: 'bg-bg-tertiary text-text-secondary border-border' },
  { value: 'D', label: 'D', selectedStyle: 'bg-bg-tertiary text-text-muted border-border' },
];

interface TradeGraderProps {
  tradeId: string;
  current?: Grade;
}

export function TradeGrader({ tradeId, current }: TradeGraderProps) {
  const updateJournal = useStore(s => s.updateTradeJournal);

  return (
    <div>
      <span className="text-[10px] text-text-muted uppercase block mb-1.5">Execution Grade</span>
      <div className="flex gap-1">
        {GRADES.map(({ value, label, selectedStyle }) => (
          <button
            key={value}
            onClick={() => updateJournal(tradeId, { grade: value })}
            className={`w-8 h-8 rounded text-xs font-bold border transition-all ${
              current === value
                ? `${selectedStyle} ring-1 ring-accent/30`
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
