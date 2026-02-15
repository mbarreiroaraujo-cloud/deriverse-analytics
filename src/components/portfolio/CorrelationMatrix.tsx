import { useStore } from '../../store/useStore';
import { useMemo } from 'react';

export function CorrelationMatrix() {
  const { filteredTrades } = useStore();

  const { symbols, matrix } = useMemo(() => {
    // Get top 6 symbols by trade count
    const symbolCounts = new Map<string, number>();
    filteredTrades.forEach(t => symbolCounts.set(t.symbol, (symbolCounts.get(t.symbol) || 0) + 1));
    const topSymbols = [...symbolCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([s]) => s);

    // Build daily PnL series per symbol
    const dailyPnl = new Map<string, Map<string, number>>();
    for (const sym of topSymbols) {
      const series = new Map<string, number>();
      filteredTrades
        .filter(t => t.symbol === sym)
        .forEach(t => {
          const day = new Date(t.closeTimestamp).toISOString().slice(0, 10);
          series.set(day, (series.get(day) || 0) + t.pnl);
        });
      dailyPnl.set(sym, series);
    }

    // Get all days
    const allDays = new Set<string>();
    dailyPnl.forEach(series => series.forEach((_, day) => allDays.add(day)));
    const sortedDays = [...allDays].sort();

    // Calculate correlation matrix
    const n = topSymbols.length;
    const corr: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) { corr[i][j] = 1; continue; }
        const seriesA = dailyPnl.get(topSymbols[i])!;
        const seriesB = dailyPnl.get(topSymbols[j])!;

        const commonDays = sortedDays.filter(d => seriesA.has(d) && seriesB.has(d));
        if (commonDays.length < 5) { corr[i][j] = 0; continue; }

        const a = commonDays.map(d => seriesA.get(d)!);
        const b = commonDays.map(d => seriesB.get(d)!);
        const meanA = a.reduce((s, v) => s + v, 0) / a.length;
        const meanB = b.reduce((s, v) => s + v, 0) / b.length;

        let cov = 0, varA = 0, varB = 0;
        for (let k = 0; k < a.length; k++) {
          const da = a[k] - meanA;
          const db = b[k] - meanB;
          cov += da * db;
          varA += da * da;
          varB += db * db;
        }

        const denom = Math.sqrt(varA * varB);
        corr[i][j] = denom > 0 ? Math.round(cov / denom * 100) / 100 : 0;
      }
    }

    return { symbols: topSymbols, matrix: corr };
  }, [filteredTrades]);

  const getCellColor = (val: number) => {
    if (val === 1) return 'bg-accent/30';
    if (val > 0.5) return 'bg-accent/20';
    if (val > 0.2) return 'bg-accent/10';
    if (val > -0.2) return 'bg-bg-tertiary';
    if (val > -0.5) return 'bg-spot/10';
    return 'bg-spot/20';
  };

  if (symbols.length < 2) return null;

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
      <div className="mb-3 sm:mb-5">
        <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Correlation Matrix</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mt-0.5">Daily PnL correlation between instruments</p>
      </div>

      <div className="overflow-x-auto scroll-smooth-touch">
        <table className="w-full" style={{ minWidth: '240px' }}>
          <thead>
            <tr>
              <th className="w-14 sm:w-20" />
              {symbols.map(s => (
                <th key={s} className="text-[9px] sm:text-[10px] font-mono font-medium text-text-muted text-center p-1 truncate max-w-[50px] sm:max-w-[60px]">
                  {s.split('/')[0].split('-')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {symbols.map((sym, i) => (
              <tr key={sym}>
                <td className="text-[9px] sm:text-[10px] font-mono font-medium text-text-muted text-right pr-2 py-1 truncate">
                  {sym.split('/')[0].split('-')[0]}
                </td>
                {symbols.map((_, j) => (
                  <td key={j} className="p-0.5">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-sm ${getCellColor(matrix[i][j])} flex items-center justify-center`}>
                      <span className="text-[8px] sm:text-[9px] font-mono font-medium text-text-primary/70">
                        {matrix[i][j].toFixed(2)}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
