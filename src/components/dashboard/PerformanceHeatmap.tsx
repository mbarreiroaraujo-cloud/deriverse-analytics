import { useStore } from '../../store/useStore';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_BLOCKS = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];

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
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">Performance Heatmap</h3>
        <p className="text-xs text-text-muted mt-0.5">PnL by time of day and day of week (UTC)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-16" />
              {DAYS.map(day => (
                <th key={day} className="text-xs font-medium text-text-muted text-center px-1 pb-2">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_BLOCKS.map((block, rowIdx) => (
              <tr key={block}>
                <td className="text-xs font-mono text-text-muted pr-2 py-1 text-right">{block}</td>
                {DAYS.map((day, colIdx) => {
                  const value = heatmap[rowIdx]?.[colIdx] || 0;
                  return (
                    <td key={day} className="px-0.5 py-0.5">
                      <div
                        className={`w-full aspect-square rounded-sm ${getHeatColor(value, maxVal)} flex items-center justify-center group relative cursor-default transition-all hover:ring-1 hover:ring-text-muted/30`}
                      >
                        <span className="text-[9px] font-mono text-text-primary/0 group-hover:text-text-primary/80 transition-colors">
                          {value >= 0 ? '+' : ''}{value.toFixed(0)}
                        </span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-primary border border-border rounded text-xs shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <span className="text-text-muted">{day} {block} UTC</span>
                          <br />
                          <span className={`font-mono ${value >= 0 ? 'text-profit' : 'text-loss'}`}>
                            {value >= 0 ? '+' : ''}${value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
