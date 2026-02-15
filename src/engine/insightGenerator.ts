import type { Trade, DashboardMetrics, PortfolioState } from '../data/types';

export interface SmartInsight {
  id: string;
  title: string;
  body: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'warning';
  priority: number; // 1 = highest
  category: 'performance' | 'risk' | 'fees' | 'behavior' | 'opportunity';
}

export function generateInsights(trades: Trade[], metrics: DashboardMetrics, portfolio: PortfolioState): SmartInsight[] {
  const insights: SmartInsight[] = [];

  // 1. Best instrument
  const bestInst = Object.entries(metrics.byInstrument)
    .filter(([, m]) => m.tradeCount >= 3)
    .sort((a, b) => b[1].pnl - a[1].pnl)[0];
  if (bestInst) {
    insights.push({
      id: 'best_instrument',
      title: `${bestInst[0]} is your strongest instrument`,
      body: `$${bestInst[1].pnl.toFixed(2)} profit across ${bestInst[1].tradeCount} trades with ${bestInst[1].winRate.toFixed(0)}% win rate. Consider allocating more capital here.`,
      sentiment: 'positive',
      priority: 3,
      category: 'performance',
    });
  }

  // 2. Worst day/time
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmap = metrics.heatmapData;
  let worstDay = 0, worstBlock = 0, worstVal = Infinity;
  for (let b = 0; b < heatmap.length; b++) {
    for (let d = 0; d < heatmap[b].length; d++) {
      if (heatmap[b][d] < worstVal && heatmap[b][d] !== 0) { worstVal = heatmap[b][d]; worstDay = d; worstBlock = b; }
    }
  }
  const timeBlocks = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
  if (worstVal < 0) {
    insights.push({
      id: 'worst_time',
      title: `Avoid ${days[worstDay]} ${timeBlocks[worstBlock]} UTC`,
      body: `This time slot is your weakest. Consider reducing activity or paper-trading during these hours.`,
      sentiment: 'warning',
      priority: 2,
      category: 'behavior',
    });
  }

  // 3. Fee savings opportunity
  const avgFeePercent = trades.length > 0 ? (metrics.totalFees / Math.max(metrics.totalVolume, 1)) * 100 : 0;
  if (avgFeePercent > 0.08) {
    const potentialSaving = metrics.totalFees * 0.5;
    insights.push({
      id: 'fee_savings',
      title: `Save ~$${potentialSaving.toFixed(0)} on fees`,
      body: `Your effective fee rate is ${(avgFeePercent).toFixed(3)}%. A Deriverse subscription could cut fees by up to 75%.`,
      sentiment: 'neutral',
      priority: 2,
      category: 'fees',
    });
  }

  // 4. Best setup
  const setups = new Map<string, { pnl: number; count: number; wins: number }>();
  for (const t of trades) {
    if (!t.journal) continue;
    const s = setups.get(t.journal.setup) || { pnl: 0, count: 0, wins: 0 };
    s.pnl += t.pnl; s.count++; if (t.pnl > 0) s.wins++;
    setups.set(t.journal.setup, s);
  }
  const bestSetup = [...setups.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].pnl - a[1].pnl)[0];
  if (bestSetup) {
    insights.push({
      id: 'best_setup',
      title: `"${bestSetup[0]}" is your best setup`,
      body: `${(bestSetup[1].wins / bestSetup[1].count * 100).toFixed(0)}% win rate with $${bestSetup[1].pnl.toFixed(2)} total PnL. Focus more trades on this pattern.`,
      sentiment: 'positive',
      priority: 3,
      category: 'opportunity',
    });
  }

  // 5. Emotion impact
  const revenge = trades.filter(t => t.journal?.emotion === 'revenge');
  if (revenge.length > 2) {
    const revPnl = revenge.reduce((s, t) => s + t.pnl, 0);
    insights.push({
      id: 'emotion_impact',
      title: 'Revenge trading is costing you',
      body: `${revenge.length} revenge trades totaling $${revPnl.toFixed(2)}. Implement a cooling-off rule after losses.`,
      sentiment: 'negative',
      priority: 1,
      category: 'behavior',
    });
  }

  // 6. Drawdown alert
  if (metrics.maxDrawdownPercent > 15) {
    insights.push({
      id: 'drawdown_alert',
      title: `Max drawdown of ${metrics.maxDrawdownPercent.toFixed(1)}%`,
      body: `A ${metrics.maxDrawdownPercent.toFixed(1)}% drawdown requires a ${(100 * metrics.maxDrawdownPercent / (100 - metrics.maxDrawdownPercent)).toFixed(1)}% gain to recover. Consider reducing position sizes.`,
      sentiment: 'warning',
      priority: 1,
      category: 'risk',
    });
  }

  // 7. Overtrading detection
  const dailyCounts = new Map<string, number>();
  for (const t of trades) {
    const day = new Date(t.timestamp).toISOString().slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  }
  const avgDaily = trades.length / Math.max(dailyCounts.size, 1);
  const highDays = [...dailyCounts.values()].filter(c => c > avgDaily * 2).length;
  if (highDays > 5) {
    insights.push({
      id: 'overtrading',
      title: 'Possible overtrading detected',
      body: `${highDays} days had 2x+ your average volume. High-frequency days often have worse win rates.`,
      sentiment: 'warning',
      priority: 2,
      category: 'behavior',
    });
  }

  // 8. Streak awareness
  if (metrics.maxConsecutiveWins >= 5) {
    insights.push({
      id: 'winning_streak',
      title: `${metrics.maxConsecutiveWins}-trade winning streak`,
      body: `Impressive consistency. Be cautious of overconfidence — maintain position sizing discipline.`,
      sentiment: 'positive',
      priority: 4,
      category: 'performance',
    });
  }
  if (metrics.maxConsecutiveLosses >= 5) {
    insights.push({
      id: 'losing_streak',
      title: `${metrics.maxConsecutiveLosses}-trade losing streak occurred`,
      body: `Consider pausing after 3 consecutive losses. A forced break can prevent emotional cascading.`,
      sentiment: 'negative',
      priority: 2,
      category: 'risk',
    });
  }

  // 9. Leverage warning
  const highLev = portfolio.positions.filter(p => p.leverage > 10);
  if (highLev.length > 0) {
    insights.push({
      id: 'leverage_warning',
      title: `${highLev.length} position${highLev.length > 1 ? 's' : ''} above 10x leverage`,
      body: `High leverage amplifies both gains and losses. Ensure your liquidation distances are comfortable.`,
      sentiment: 'warning',
      priority: 1,
      category: 'risk',
    });
  }

  // 10. Duration mismatch
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const avgWinDur = wins.length > 0 ? wins.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / wins.length / 60000 : 0;
  const avgLossDur = losses.length > 0 ? losses.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / losses.length / 60000 : 0;
  if (avgLossDur > avgWinDur * 1.5 && losses.length > 5) {
    insights.push({
      id: 'duration_mismatch',
      title: 'You hold losers longer than winners',
      body: `Avg loss held ${(avgLossDur / 60).toFixed(1)}h vs winners ${(avgWinDur / 60).toFixed(1)}h. Consider tighter stop-losses.`,
      sentiment: 'negative',
      priority: 2,
      category: 'behavior',
    });
  }

  // Sort by priority, take top 5
  return insights.sort((a, b) => a.priority - b.priority).slice(0, 5);
}
