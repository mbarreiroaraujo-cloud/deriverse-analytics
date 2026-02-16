interface CardTimeRangeProps {
  value: number;
  onChange: (days: number) => void;
  options?: number[];
}

export function CardTimeRange({ value, onChange, options = [7, 30, 90] }: CardTimeRangeProps) {
  return (
    <div className="flex items-center bg-bg-tertiary/40 rounded-md p-0.5 gap-0.5">
      {options.map(days => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors ${
            value === days
              ? 'text-accent font-semibold'
              : 'text-text-muted/50 hover:text-text-muted'
          }`}
        >
          {days}D
        </button>
      ))}
    </div>
  );
}
