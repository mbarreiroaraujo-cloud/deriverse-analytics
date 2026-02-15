import type { Trade, DashboardMetrics } from '../data/types';

export type TraderStyle = 'scalper' | 'day_trader' | 'swing_trader' | 'position_trader';

export interface BehavioralPattern {
  id: string;
  label: string;
  description: string;
  detected: boolean;
  severity: 'positive' | 'neutral' | 'warning';
}

export interface TraderProfile {
  style: TraderStyle;
  styleConfidence: number;
  styleDescription: string;
  patterns: BehavioralPattern[];
  strengths: string[];
  weaknesses: string[];
  optimalConditions: string[];
  evolution: { period: string; style: TraderStyle; winRate: number; pnl: number }[];
}

function detectStyle(trades: Trade[]): { style: TraderStyle; confidence: number } {
  if (trades.length === 0) return { style: 'day_trader', confidence: 0 };

  const durations = trades.map(t => (t.closeTimestamp - t.timestamp) / 60000);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const tradesPerDay = trades.length / 90;

  if (avgDuration < 30 && tradesPerDay > 5) return { style: 'scalper', confidence: Math.min(tradesPerDay / 10, 1) };
  if (avgDuration < 480) return { style: 'day_trader', confidence: Math.min(avgDuration / 240, 1) };
  if (avgDuration < 10080) return { style: 'swing_trader', confidence: 0.8 };
  return { style: 'position_trader', confidence: 0.7 };
}

const STYLE_DESCRIPTIONS: Record<TraderStyle, string> = {
  scalper: 'You favor rapid-fire trades with tight targets. Speed and precision are your edge.',
  day_trader: 'You open and close within a session. You catch intraday moves and avoid overnight risk.',
  swing_trader: 'You hold for days, riding multi-day moves. Patience and trend-reading are your tools.',
  position_trader: 'You think in weeks or months. Macro views and conviction define your approach.',
};

function detectPatterns(trades: Trade[], metrics: DashboardMetrics): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];

  // 1. Revenge trading
  const revengeTrades = trades.filter(t => t.journal?.emotion === 'revenge');
  patterns.push({
    id: 'revenge_trading',
    label: 'Revenge Trading',
    description: revengeTrades.length > 0
      ? `Detected ${revengeTrades.length} revenge trades averaging $${(revengeTrades.reduce((s, t) => s + t.pnl, 0) / Math.max(revengeTrades.length, 1)).toFixed(2)} PnL.`
      : 'No revenge trades detected. Good emotional discipline.',
    detected: revengeTrades.length > 3,
    severity: revengeTrades.length > 3 ? 'warning' : 'positive',
  });

  // 2. Overtrading detection
  const dailyCounts = new Map<string, number>();
  for (const t of trades) {
    const day = new Date(t.timestamp).toISOString().slice(0, 10);
    dailyCounts.set(day, (dailyCounts.get(day) || 0) + 1);
  }
  const avgDaily = trades.length / Math.max(dailyCounts.size, 1);
  const highDays = [...dailyCounts.values()].filter(c => c > avgDaily * 2).length;
  patterns.push({
    id: 'overtrading',
    label: 'Overtrading',
    description: highDays > 5 ? `${highDays} days with 2x+ normal volume. May indicate impulsive trading.` : 'Trade frequency is consistent. No overtrading detected.',
    detected: highDays > 5,
    severity: highDays > 5 ? 'warning' : 'positive',
  });

  // 3. Winner addiction (cutting winners short)
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const avgWinDur = wins.length > 0 ? wins.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / wins.length / 60000 : 0;
  const avgLossDur = losses.length > 0 ? losses.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / losses.length / 60000 : 0;
  const cutsWinners = avgWinDur < avgLossDur * 0.7 && wins.length > 5;
  patterns.push({
    id: 'cuts_winners',
    label: 'Cutting Winners Short',
    description: cutsWinners ? 'You close winning trades significantly faster than losing ones.' : 'Winner hold times are appropriate relative to losers.',
    detected: cutsWinners,
    severity: cutsWinners ? 'warning' : 'positive',
  });

  // 4. Loss aversion (holding losers too long)
  const holdsLosers = avgLossDur > avgWinDur * 1.5 && losses.length > 5;
  patterns.push({
    id: 'holds_losers',
    label: 'Loss Aversion',
    description: holdsLosers ? 'You hold losing positions significantly longer than winners.' : 'Good discipline closing losing positions.',
    detected: holdsLosers,
    severity: holdsLosers ? 'warning' : 'positive',
  });

  // 5. Streak chaser (increases size after wins)
  let streakChase = 0;
  for (let i = 2; i < trades.length; i++) {
    if (trades[i - 1].pnl > 0 && trades[i - 2].pnl > 0 && trades[i].size > trades[i - 1].size * 1.3) {
      streakChase++;
    }
  }
  patterns.push({
    id: 'streak_chaser',
    label: 'Streak Chasing',
    description: streakChase > 5 ? 'You tend to increase position size after consecutive wins.' : 'Position sizing is consistent regardless of recent results.',
    detected: streakChase > 5,
    severity: streakChase > 5 ? 'warning' : 'positive',
  });

  // 6. Time discipline
  const heatmap = metrics.heatmapData;
  let totalBlocks = 0, activeBlocks = 0;
  for (const row of heatmap) for (const cell of row) { totalBlocks++; if (cell !== 0) activeBlocks++; }
  const focused = activeBlocks / Math.max(totalBlocks, 1) < 0.5;
  patterns.push({
    id: 'time_discipline',
    label: 'Time Discipline',
    description: focused ? 'You trade during specific time windows. This shows discipline.' : 'You trade across many time slots. Consider focusing on your best hours.',
    detected: focused,
    severity: focused ? 'positive' : 'neutral',
  });

  // 7. Consistent sizing
  const sizes = trades.map(t => t.size);
  const avgSize = sizes.reduce((a, b) => a + b, 0) / Math.max(sizes.length, 1);
  const sizeStdDev = Math.sqrt(sizes.reduce((s, v) => s + (v - avgSize) ** 2, 0) / Math.max(sizes.length - 1, 1));
  const consistent = sizeStdDev / Math.max(avgSize, 0.01) < 0.5;
  patterns.push({
    id: 'consistent_sizing',
    label: 'Consistent Sizing',
    description: consistent ? 'Position sizes are relatively uniform. Good risk management.' : 'Position sizes vary significantly. Consider standardizing.',
    detected: consistent,
    severity: consistent ? 'positive' : 'neutral',
  });

  return patterns;
}

function rankStrengths(trades: Trade[], metrics: DashboardMetrics): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (metrics.winRate > 55) strengths.push('High win rate');
  else if (metrics.winRate < 40) weaknesses.push('Low win rate');

  if (metrics.profitFactor > 1.5) strengths.push('Strong profit factor');
  else if (metrics.profitFactor < 1.0) weaknesses.push('Negative profit factor');

  if (metrics.maxDrawdownPercent < 10) strengths.push('Conservative risk management');
  else if (metrics.maxDrawdownPercent > 25) weaknesses.push('High maximum drawdown');

  if (metrics.sharpeRatio > 1.0) strengths.push('Good risk-adjusted returns');
  else if (metrics.sharpeRatio < 0.5) weaknesses.push('Poor risk-adjusted returns');

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const avgWinDur = wins.length > 0 ? wins.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / wins.length : 0;
  const avgLossDur = losses.length > 0 ? losses.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / losses.length : 0;
  if (avgWinDur > avgLossDur * 1.3 && wins.length > 5) strengths.push('Lets winners run');
  if (avgLossDur > avgWinDur * 1.5 && losses.length > 5) weaknesses.push('Holds losers too long');

  if (metrics.consecutiveWins >= 5) strengths.push('Strong winning streaks');
  if (metrics.consecutiveLosses >= 5) weaknesses.push('Prone to losing streaks');

  return { strengths: strengths.slice(0, 4), weaknesses: weaknesses.slice(0, 4) };
}

function deriveOptimalConditions(_trades: Trade[], metrics: DashboardMetrics): string[] {
  const conditions: string[] = [];

  // Best day of week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const heatmap = metrics.heatmapData;
  let bestDay = 0, bestVal = -Infinity;
  for (let d = 0; d < 7; d++) {
    let sum = 0;
    for (let b = 0; b < heatmap.length; b++) sum += heatmap[b][d] || 0;
    if (sum > bestVal) { bestVal = sum; bestDay = d; }
  }
  conditions.push(`Best day: ${days[bestDay]}`);

  // Best time block
  const timeBlocks = ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'];
  let bestBlock = 0, bestBlockVal = -Infinity;
  for (let b = 0; b < heatmap.length; b++) {
    const sum = heatmap[b].reduce((a: number, v: number) => a + v, 0);
    if (sum > bestBlockVal) { bestBlockVal = sum; bestBlock = b; }
  }
  conditions.push(`Peak hours: ${timeBlocks[bestBlock]} UTC`);

  // Best instrument
  const bestInst = Object.entries(metrics.byInstrument).sort((a, b) => b[1].pnl - a[1].pnl)[0];
  if (bestInst) conditions.push(`Strongest instrument: ${bestInst[0]}`);

  // Best symbol
  const bestSym = Object.entries(metrics.bySymbol)
    .filter(([, m]) => m.tradeCount >= 5)
    .sort((a, b) => b[1].pnl - a[1].pnl)[0];
  if (bestSym) conditions.push(`Top symbol: ${bestSym[0]}`);

  return conditions;
}

function buildEvolution(trades: Trade[]): TraderProfile['evolution'] {
  if (trades.length < 10) return [];

  const sorted = [...trades].sort((a, b) => a.timestamp - b.timestamp);
  const chunkSize = Math.ceil(sorted.length / 3);
  const periods = ['Early', 'Middle', 'Recent'];

  return periods.map((period, i) => {
    const chunk = sorted.slice(i * chunkSize, (i + 1) * chunkSize);
    const wins = chunk.filter(t => t.pnl > 0).length;
    const pnl = chunk.reduce((s, t) => s + t.pnl, 0);
    const avgDur = chunk.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / Math.max(chunk.length, 1) / 60000;

    let style: TraderStyle = 'day_trader';
    if (avgDur < 30) style = 'scalper';
    else if (avgDur < 480) style = 'day_trader';
    else if (avgDur < 10080) style = 'swing_trader';
    else style = 'position_trader';

    return { period, style, winRate: (wins / Math.max(chunk.length, 1)) * 100, pnl };
  });
}

export function generateTraderProfile(trades: Trade[], metrics: DashboardMetrics): TraderProfile {
  const { style, confidence } = detectStyle(trades);
  const patterns = detectPatterns(trades, metrics);
  const { strengths, weaknesses } = rankStrengths(trades, metrics);
  const optimalConditions = deriveOptimalConditions(trades, metrics);
  const evolution = buildEvolution(trades);

  return {
    style,
    styleConfidence: confidence,
    styleDescription: STYLE_DESCRIPTIONS[style],
    patterns,
    strengths,
    weaknesses,
    optimalConditions,
    evolution,
  };
}
