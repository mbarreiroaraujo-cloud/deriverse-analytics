import { useStore } from '../../store/useStore';
import type { Grade } from '../../data/types';

const GRADES: { value: Grade; label: string; color: string }[] = [
  { value: 'A', label: 'A', color: 'bg-profit/15 text-profit border-profit/20' },
  { value: 'B', label: 'B', color: 'bg-accent/15 text-accent border-accent/20' },
  { value: 'C', label: 'C', color: 'bg-spot/15 text-spot border-spot/20' },
  { value: 'D', label: 'D', color: 'bg-loss/15 text-loss border-loss/20' },
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
        {GRADES.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => updateJournal(tradeId, { grade: value })}
            className={`w-8 h-8 rounded text-xs font-bold border transition-all ${
              current === value
                ? `${color} ring-1 ring-current`
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
