import type { Trade, DashboardMetrics } from '../data/types';

export interface MetricZones {
  mean: number;
  stdDev: number;
  excellent: number;
  good: number;
  average: number;
  belowAvg: number;
  poor: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface AdaptiveThresholds {
  zones: Map<string, MetricZones>;
  lastCalculated: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function calcZones(values: number[]): MetricZones {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, excellent: 0, good: 0, average: 0, belowAvg: 0, poor: 0, p25: 0, p50: 0, p75: 0, p90: 0 };
  }
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / Math.max(values.length - 1, 1);
  const stdDev = Math.sqrt(variance);
  const sorted = [...values].sort((a, b) => a - b);

  return {
    mean,
    stdDev,
    excellent: mean + 1.5 * stdDev,
    good: mean + 0.5 * stdDev,
    average: mean,
    belowAvg: mean - 0.5 * stdDev,
    poor: mean - 1.5 * stdDev,
    p25: percentile(sorted, 25),
    p50: percentile(sorted, 50),
    p75: percentile(sorted, 75),
    p90: percentile(sorted, 90),
  };
}

export function calculateAdaptiveThresholds(trades: Trade[], metrics: DashboardMetrics): AdaptiveThresholds {
  const zones = new Map<string, MetricZones>();

  // Win rate per instrument
  const instrumentWinRates: number[] = [];
  for (const [, m] of Object.entries(metrics.byInstrument)) {
    if (m.tradeCount >= 5) instrumentWinRates.push(m.winRate);
  }
  zones.set('instrumentWinRate', calcZones(instrumentWinRates));

  // Win rate per symbol
  const symbolWinRates: number[] = [];
  const symbolPnls: number[] = [];
  for (const [, m] of Object.entries(metrics.bySymbol)) {
    if (m.tradeCount >= 5) {
      symbolWinRates.push(m.winRate);
      symbolPnls.push(m.pnl);
    }
  }
  zones.set('symbolWinRate', calcZones(symbolWinRates));
  zones.set('symbolPnl', calcZones(symbolPnls));

  // Daily trade counts
  const dailyCounts = metrics.dailyPnl.map(d => d.tradeCount);
  zones.set('dailyTradeCount', calcZones(dailyCounts));

  // Daily PnL
  const dailyPnls = metrics.dailyPnl.map(d => d.pnl);
  zones.set('dailyPnl', calcZones(dailyPnls));

  // Daily win rates
  const dailyWinRates = metrics.dailyPnl.filter(d => d.tradeCount >= 2).map(d => d.winRate);
  zones.set('dailyWinRate', calcZones(dailyWinRates));

  // PnL per trade
  const tradePnls = trades.map(t => t.pnl);
  zones.set('tradePnl', calcZones(tradePnls));

  // Trade duration in minutes
  const durations = trades.map(t => (t.closeTimestamp - t.timestamp) / 60000);
  zones.set('tradeDuration', calcZones(durations));

  // Leverage distribution
  const leverages = trades.map(t => t.leverage);
  zones.set('leverage', calcZones(leverages));

  // Heatmap cell win rates (by day-of-week)
  const dayWinRates: number[][] = Array.from({ length: 7 }, () => []);
  for (const trade of trades) {
    const d = new Date(trade.timestamp);
    let dayIdx = d.getUTCDay() - 1;
    if (dayIdx < 0) dayIdx = 6;
    dayWinRates[dayIdx].push(trade.pnl > 0 ? 1 : 0);
  }
  const perDayWinRates = dayWinRates
    .filter(arr => arr.length >= 3)
    .map(arr => (arr.reduce((a, b) => a + b, 0) / arr.length) * 100);
  zones.set('dayOfWeekWinRate', calcZones(perDayWinRates));

  // Time block win rates
  const blockWinRates: number[][] = Array.from({ length: 6 }, () => []);
  for (const trade of trades) {
    const h = new Date(trade.timestamp).getUTCHours();
    const block = Math.floor(h / 4);
    blockWinRates[block].push(trade.pnl > 0 ? 1 : 0);
  }
  const perBlockWinRates = blockWinRates
    .filter(arr => arr.length >= 3)
    .map(arr => (arr.reduce((a, b) => a + b, 0) / arr.length) * 100);
  zones.set('timeBlockWinRate', calcZones(perBlockWinRates));

  return { zones, lastCalculated: Date.now() };
}

export function detectTrend(recent: number, previous: number, sigma: number): 'improving' | 'declining' | 'stable' {
  const delta = recent - previous;
  if (sigma === 0) return 'stable';
  if (delta > 0.5 * sigma) return 'improving';
  if (delta < -0.5 * sigma) return 'declining';
  return 'stable';
}

export function getMinDataMessage(current: number, required: number, label: string): string | null {
  if (current >= required) return null;
  return `Based on ${current} ${label}. Need ${required}+ for reliable estimate.`;
}
