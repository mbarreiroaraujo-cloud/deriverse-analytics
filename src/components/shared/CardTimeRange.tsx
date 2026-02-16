interface CardTimeRangeProps {
  value: number;
  onChange: (days: number) => void;
  options?: number[];
}

export function CardTimeRange({ value, onChange, options = [7, 14, 30, 90, 180, 365] }: CardTimeRangeProps) {

  const formatLabel = (days: number): string => {
    if (days === 180) return '6M';
    if (days === 365) return '1Y';
    return `${days}D`;
  };

  return (
    <div className="flex items-center bg-bg-tertiary/40 rounded-md p-0.5 gap-0.5 overflow-x-auto scrollbar-hide">
      {options.map(days => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition-colors whitespace-nowrap ${
            value === days
              ? 'text-accent font-semibold bg-accent/10'
              : 'text-text-muted/50 hover:text-text-muted'
          }`}
        >
          {formatLabel(days)}
        </button>
      ))}
    </div>
  );
}
