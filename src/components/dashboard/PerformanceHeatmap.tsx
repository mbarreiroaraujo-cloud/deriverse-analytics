import { useStore } from '../../store/useStore';

const DAYS_FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TIME_BLOCKS_FULL = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
const TIME_BLOCKS_SHORT = ['0-4', '4-8', '8-12', '12-16', '16-20', '20-24'];

function getHeatColor(value: number, max: number): string {
  if (value === 0) return 'bg-bg-tertiary/50';
  const intensity = Math.min(Math.abs(value) / Math.max(max, 1), 1);
  if (value > 0) {
    if (intensity > 0.7) return 'bg-profit/40';
    if (intensity > 0.4) return 'bg-profit/25';
    if (intensity > 0.15) return 'bg-profit/12';
    return 'bg-profit/8';
  }
  if (intensity > 0.7) return 'bg-loss/40';
  if (intensity > 0.4) return 'bg-loss/25';
  if (intensity > 0.15) return 'bg-loss/12';
  return 'bg-loss/8';
}

export function PerformanceHeatmap() {
  const { metrics } = useStore();
  const heatmap = metrics.heatmapData;

  const flatValues = heatmap.flat().map(Math.abs);
  const maxVal = Math.max(...flatValues, 1);

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Performance Heatmap</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">PnL by time of day and day of week (UTC)</p>
      </div>

      <div className="overflow-x-auto scroll-smooth-touch">
        {/* CSS Grid layout for alignment */}
        <div className="grid grid-cols-8 gap-0.5 sm:gap-1" style={{ minWidth: '280px' }}>
          {/* Header row: empty corner + day labels */}
          <div className="w-8 sm:w-12" />
          {DAYS_FULL.map((day, i) => (
            <div key={day} className="text-center">
              <span className="text-[9px] sm:text-[10px] font-medium text-text-muted hidden sm:inline">{day}</span>
              <span className="text-[9px] font-medium text-text-muted sm:hidden">{DAYS_SHORT[i]}</span>
            </div>
          ))}

          {/* Data rows */}
          {TIME_BLOCKS_FULL.map((block, rowIdx) => (
            <div key={block} className="contents">
              {/* Time label */}
              <div className="w-8 sm:w-12 flex items-center justify-end pr-1">
                <span className="text-[9px] sm:text-[10px] font-mono font-medium text-text-muted hidden sm:inline">{block}</span>
                <span className="text-[9px] font-mono font-medium text-text-muted sm:hidden">{TIME_BLOCKS_SHORT[rowIdx]}</span>
              </div>
              {/* Day cells */}
              {DAYS_FULL.map((day, colIdx) => {
                const value = heatmap[rowIdx]?.[colIdx] || 0;
                return (
                  <div
                    key={`${block}-${day}`}
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-sm ${getHeatColor(value, maxVal)} flex items-center justify-center group relative cursor-default transition-all hover:ring-1 hover:ring-text-muted/30`}
                  >
                    <span className="text-[8px] sm:text-[9px] font-mono font-medium text-text-primary/0 group-hover:text-text-primary/80 transition-colors">
                      {value >= 0 ? '+' : ''}{value.toFixed(0)}
                    </span>
                    {/* Tooltip — below on mobile, above on desktop */}
                    <div className="absolute top-full mt-1 sm:bottom-full sm:top-auto sm:mb-2 sm:mt-0 left-1/2 -translate-x-1/2 px-2 py-1 bg-bg-primary border border-border rounded text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <span className="text-text-muted">{day} {block} UTC</span>
                      <br />
                      <span className={`font-mono font-medium ${value >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {value >= 0 ? '+' : ''}${value.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border/50">
        <span className="text-[10px] text-text-muted">Loss</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-loss/40" />
          <div className="w-3 h-3 rounded-sm bg-loss/25" />
          <div className="w-3 h-3 rounded-sm bg-loss/12" />
          <div className="w-3 h-3 rounded-sm bg-bg-tertiary/50" />
          <div className="w-3 h-3 rounded-sm bg-profit/12" />
          <div className="w-3 h-3 rounded-sm bg-profit/25" />
          <div className="w-3 h-3 rounded-sm bg-profit/40" />
        </div>
        <span className="text-[10px] text-text-muted">Profit</span>
      </div>
    </div>
  );
}
