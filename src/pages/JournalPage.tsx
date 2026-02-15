import { useStore } from '../store/useStore';
import { FilterBar } from '../components/shared/FilterBar';
import { TabSection } from '../components/shared/TabSection';
import { TradeTable } from '../components/journal/TradeTable';

export function JournalPage() {
  const { filteredTrades } = useStore();

  // Compute journal stats
  const withJournal = filteredTrades.filter(t => t.journal);
  const emotions = new Map<string, { count: number; pnl: number; wins: number }>();
  const setups = new Map<string, { count: number; pnl: number; wins: number }>();
  const grades = new Map<string, { count: number; pnl: number; wins: number }>();

  for (const t of withJournal) {
    if (!t.journal) continue;
    for (const [map, key] of [[emotions, t.journal.emotion], [setups, t.journal.setup], [grades, t.journal.grade]] as const) {
      const existing = map.get(key) || { count: 0, pnl: 0, wins: 0 };
      existing.count++;
      existing.pnl += t.pnl;
      if (t.pnl > 0) existing.wins++;
      map.set(key, existing);
    }
  }

  const tabs = [
    {
      id: 'analytics',
      label: 'Analytics',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Emotion breakdown */}
          <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-3">Emotion Performance</h3>
            <p className="text-[10px] sm:text-xs text-text-muted mb-4">Win rate by emotional state ({withJournal.length} tagged trades)</p>
            <div className="space-y-2.5">
              {[...emotions.entries()].sort((a, b) => b[1].count - a[1].count).map(([emotion, data]) => {
                const winRate = data.count > 0 ? (data.wins / data.count * 100) : 0;
                return (
                  <div key={emotion} className="flex items-center justify-between">
                    <span className="text-xs px-2 py-0.5 rounded capitalize bg-bg-tertiary text-text-secondary">
                      {emotion}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs text-text-muted">{data.count} trades</span>
                      <span className="text-[10px] sm:text-xs font-mono font-semibold text-text-secondary">{winRate.toFixed(0)}% WR</span>
                      <span className={`text-[10px] sm:text-xs font-mono font-semibold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup breakdown */}
          <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-3">Setup Performance</h3>
            <p className="text-[10px] sm:text-xs text-text-muted mb-4">Win rate by trade setup type</p>
            <div className="space-y-2.5">
              {[...setups.entries()].sort((a, b) => b[1].count - a[1].count).map(([setup, data]) => {
                const winRate = data.count > 0 ? (data.wins / data.count * 100) : 0;
                return (
                  <div key={setup} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary capitalize">{setup}</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs text-text-muted">{data.count}</span>
                      <span className="text-[10px] sm:text-xs font-mono font-semibold text-text-secondary">{winRate.toFixed(0)}% WR</span>
                      <span className={`text-[10px] sm:text-xs font-mono font-semibold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grade breakdown */}
          <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover">
            <h3 className="text-xs sm:text-sm font-semibold text-text-primary mb-3">Grade Performance</h3>
            <p className="text-[10px] sm:text-xs text-text-muted mb-4">PnL by execution quality grade</p>
            <div className="space-y-2.5">
              {['A', 'B', 'C', 'D'].map(grade => {
                const data = grades.get(grade) || { count: 0, pnl: 0, wins: 0 };
                const winRate = data.count > 0 ? (data.wins / data.count * 100) : 0;
                const gradeStyle = grade === 'A' ? 'text-accent bg-accent/20' :
                  grade === 'B' ? 'text-accent-hover bg-accent/12' :
                  grade === 'C' ? 'text-text-secondary bg-bg-tertiary' : 'text-text-muted bg-bg-tertiary';
                return (
                  <div key={grade} className="flex items-center justify-between">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded ${gradeStyle}`}>
                      {grade}
                    </span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-[10px] sm:text-xs text-text-muted">{data.count} trades</span>
                      <span className="text-[10px] sm:text-xs font-mono font-semibold text-text-secondary">{winRate.toFixed(0)}% WR</span>
                      <span className={`text-[10px] sm:text-xs font-mono font-semibold ${data.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'trades',
      label: 'Trade History',
      content: <TradeTable />,
    },
  ];

  return (
    <div className="animate-fade-in">
      <FilterBar />
      <TabSection tabs={tabs} defaultTab="analytics" />
    </div>
  );
}
