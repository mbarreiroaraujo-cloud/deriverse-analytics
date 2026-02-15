import { useStore } from '../../store/useStore';
import type { Emotion } from '../../data/types';

const EMOTIONS: { value: Emotion; label: string; color: string }[] = [
  { value: 'disciplined', label: 'Disciplined', color: 'bg-profit/15 text-profit border-profit/20' },
  { value: 'neutral', label: 'Neutral', color: 'bg-text-secondary/10 text-text-secondary border-text-secondary/20' },
  { value: 'fomo', label: 'FOMO', color: 'bg-spot/15 text-spot border-spot/20' },
  { value: 'revenge', label: 'Revenge', color: 'bg-loss/15 text-loss border-loss/20' },
  { value: 'fearful', label: 'Fearful', color: 'bg-options/15 text-options border-options/20' },
  { value: 'greedy', label: 'Greedy', color: 'bg-futures/15 text-futures border-futures/20' },
];

interface EmotionTaggerProps {
  tradeId: string;
  current?: Emotion;
}

export function EmotionTagger({ tradeId, current }: EmotionTaggerProps) {
  const updateJournal = useStore(s => s.updateTradeJournal);

  return (
    <div>
      <span className="text-[10px] text-text-muted uppercase block mb-1.5">Emotion</span>
      <div className="flex flex-wrap gap-1">
        {EMOTIONS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => updateJournal(tradeId, { emotion: value })}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
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
