import { useStore } from '../../store/useStore';
import type { Emotion } from '../../data/types';

const EMOTIONS: { value: Emotion; label: string }[] = [
  { value: 'disciplined', label: 'Disciplined' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'fomo', label: 'FOMO' },
  { value: 'revenge', label: 'Revenge' },
  { value: 'fearful', label: 'Fearful' },
  { value: 'greedy', label: 'Greedy' },
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
        {EMOTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateJournal(tradeId, { emotion: value })}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all ${
              current === value
                ? 'bg-bg-tertiary text-text-primary border-border ring-1 ring-accent/30'
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
