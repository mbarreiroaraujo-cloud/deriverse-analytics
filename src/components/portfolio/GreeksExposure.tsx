import { useStore } from '../../store/useStore';

const GREEK_INFO: Record<string, { description: string; unit: string }> = {
  delta: { description: 'Directional exposure to underlying price', unit: '\u0394' },
  gamma: { description: 'Rate of change of delta per $1 move', unit: '\u0393' },
  theta: { description: 'Daily time decay cost', unit: '\u0398' },
  vega: { description: 'Sensitivity to 1% change in IV', unit: '\u03BD' },
};

export function GreeksExposure() {
  const { portfolio } = useStore();
  const greeks = portfolio.greeksAggregate;

  const entries = [
    { key: 'delta', value: greeks.delta },
    { key: 'gamma', value: greeks.gamma },
    { key: 'theta', value: greeks.theta },
    { key: 'vega', value: greeks.vega },
  ];

  const maxAbs = Math.max(...entries.map(e => Math.abs(e.value)));

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-4 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Greeks Exposure</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Aggregate options risk across portfolio</p>
      </div>

      <div className="space-y-4">
        {entries.map(({ key, value }) => {
          const info = GREEK_INFO[key];
          const barWidth = Math.abs(value) / maxAbs * 100;
          const isPositive = value >= 0;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-mono font-semibold text-accent">{info.unit}</span>
                  <span className="text-xs text-text-secondary capitalize">{key}</span>
                </div>
                <span className="text-xs sm:text-sm font-mono font-semibold text-text-primary">
                  {isPositive ? '+' : ''}{value.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${isPositive ? 'bg-accent/60' : 'bg-accent/40'}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <p className="text-[10px] text-text-muted mt-0.5">{info.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
