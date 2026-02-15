import type { Trade, DashboardMetrics, EquityPoint, DrawdownPoint, DailyPnl, RollingWindow, InstrumentMetrics, OrderTypeMetrics } from '../data/types';
import { format } from 'date-fns';

const INITIAL_EQUITY = 50000;
const RISK_FREE_RATE = 0.05 / 365; // Daily risk-free rate (~5% annual)

function groupByDay(trades: Trade[]): Map<string, Trade[]> {
  const map = new Map<string, Trade[]>();
  for (const trade of trades) {
    const key = format(new Date(trade.closeTimestamp), 'yyyy-MM-dd');
    const arr = map.get(key) || [];
    arr.push(trade);
    map.set(key, arr);
  }
  return map;
}

function calcWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  const wins = trades.filter(t => t.pnl > 0).length;
  return wins / trades.length;
}

function calcSharpe(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (dailyReturns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return ((mean - RISK_FREE_RATE) / stdDev) * Math.sqrt(252);
}

function calcSortino(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;
  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const downsideReturns = dailyReturns.filter(r => r < RISK_FREE_RATE);
  if (downsideReturns.length === 0) return mean > RISK_FREE_RATE ? 3 : 0;
  const downsideVariance = downsideReturns.reduce((sum, r) => sum + Math.pow(r - RISK_FREE_RATE, 2), 0) / downsideReturns.length;
  const downsideDev = Math.sqrt(downsideVariance);
  if (downsideDev === 0) return 0;
  return ((mean - RISK_FREE_RATE) / downsideDev) * Math.sqrt(252);
}

function buildEquityCurve(trades: Trade[]): { equityCurve: EquityPoint[]; drawdownCurve: DrawdownPoint[] } {
  const byDay = groupByDay(trades);
  const sortedDays = Array.from(byDay.keys()).sort();
  const equityCurve: EquityPoint[] = [];
  const drawdownCurve: DrawdownPoint[] = [];

  let equity = INITIAL_EQUITY;
  let peak = INITIAL_EQUITY;

  for (const day of sortedDays) {
    const dayTrades = byDay.get(day)!;
    const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl - t.fees.total, 0);
    equity += dayPnl;
    peak = Math.max(peak, equity);
    const drawdown = peak - equity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    equityCurve.push({ date: day, equity: Math.round(equity * 100) / 100, pnl: Math.round(dayPnl * 100) / 100 });
    drawdownCurve.push({ date: day, drawdown: Math.round(drawdown * 100) / 100, drawdownPercent: Math.round(drawdownPercent * 100) / 100 });
  }

  return { equityCurve, drawdownCurve };
}

function buildHeatmap(trades: Trade[]): number[][] {
  // 7 days (Mon=0..Sun=6) x 6 time blocks (0-4, 4-8, 8-12, 12-16, 16-20, 20-24)
  const heatmap: number[][] = Array.from({ length: 6 }, () => Array(7).fill(0));

  for (const trade of trades) {
    const d = new Date(trade.timestamp);
    let dayIdx = d.getUTCDay() - 1; // Mon=0
    if (dayIdx < 0) dayIdx = 6; // Sunday
    const hourBlock = Math.floor(d.getUTCHours() / 4);
    heatmap[hourBlock][dayIdx] += trade.pnl;
  }

  // Round values
  for (let i = 0; i < heatmap.length; i++) {
    for (let j = 0; j < heatmap[i].length; j++) {
      heatmap[i][j] = Math.round(heatmap[i][j] * 100) / 100;
    }
  }

  return heatmap;
}

function calcRollingWindow(trades: Trade[], days: number): RollingWindow {
  const now = Date.now();
  const cutoff = now - days * 86400000;
  const filtered = trades.filter(t => t.closeTimestamp >= cutoff);
  if (filtered.length === 0) return { sharpe: 0, winRate: 0, pnl: 0, sortino: 0 };

  const byDay = groupByDay(filtered);
  const dailyPnls = Array.from(byDay.values()).map(dayTrades =>
    dayTrades.reduce((sum, t) => sum + t.pnl - t.fees.total, 0)
  );
  const dailyReturns = dailyPnls.map(p => p / INITIAL_EQUITY);

  return {
    sharpe: Math.round(calcSharpe(dailyReturns) * 100) / 100,
    sortino: Math.round(calcSortino(dailyReturns) * 100) / 100,
    winRate: Math.round(calcWinRate(filtered) * 10000) / 100,
    pnl: Math.round(filtered.reduce((sum, t) => sum + t.pnl, 0) * 100) / 100,
  };
}

function buildDailyPnl(trades: Trade[]): DailyPnl[] {
  const byDay = groupByDay(trades);
  const sortedDays = Array.from(byDay.keys()).sort();

  return sortedDays.map(day => {
    const dayTrades = byDay.get(day)!;
    const pnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    return {
      date: day,
      pnl: Math.round(pnl * 100) / 100,
      tradeCount: dayTrades.length,
      winRate: Math.round(calcWinRate(dayTrades) * 10000) / 100,
    };
  });
}

export function calculateMetrics(trades: Trade[]): DashboardMetrics {
  if (trades.length === 0) {
    return getEmptyMetrics();
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const longs = trades.filter(t => t.side === 'long');

  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const totalFees = trades.reduce((sum, t) => sum + t.fees.total, 0);
  const totalVolume = trades.reduce((sum, t) => sum + Math.abs(t.size * t.entryPrice), 0);

  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));

  // Consecutive wins/losses
  let maxConsWins = 0;
  let maxConsLosses = 0;
  let currentConsWins = 0;
  let currentConsLosses = 0;

  for (const trade of trades) {
    if (trade.pnl > 0) {
      currentConsWins++;
      currentConsLosses = 0;
      maxConsWins = Math.max(maxConsWins, currentConsWins);
    } else {
      currentConsLosses++;
      currentConsWins = 0;
      maxConsLosses = Math.max(maxConsLosses, currentConsLosses);
    }
  }

  // Daily returns for Sharpe/Sortino
  const byDay = groupByDay(trades);
  const dailyPnls = Array.from(byDay.values()).map(dayTrades =>
    dayTrades.reduce((sum, t) => sum + t.pnl - t.fees.total, 0)
  );
  const dailyReturns = dailyPnls.map(p => p / INITIAL_EQUITY);

  // Equity curve
  const { equityCurve, drawdownCurve } = buildEquityCurve(trades);
  const maxDrawdown = drawdownCurve.reduce((max, d) => Math.max(max, d.drawdown), 0);
  const maxDrawdownPercent = drawdownCurve.reduce((max, d) => Math.max(max, d.drawdownPercent), 0);

  // By instrument
  const byInstrument: Record<string, InstrumentMetrics> = {};
  const instruments = ['spot', 'perpetual', 'options', 'futures'] as const;
  for (const inst of instruments) {
    const instTrades = trades.filter(t => t.instrument === inst);
    if (instTrades.length === 0) continue;
    byInstrument[inst] = {
      pnl: Math.round(instTrades.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
      winRate: Math.round(calcWinRate(instTrades) * 10000) / 100,
      tradeCount: instTrades.length,
      avgPnl: Math.round((instTrades.reduce((s, t) => s + t.pnl, 0) / instTrades.length) * 100) / 100,
      fees: Math.round(instTrades.reduce((s, t) => s + t.fees.total, 0) * 100) / 100,
      volume: Math.round(instTrades.reduce((s, t) => s + Math.abs(t.size * t.entryPrice), 0) * 100) / 100,
    };
  }

  // By order type
  const byOrderType: Record<string, OrderTypeMetrics> = {};
  const orderTypes = ['market', 'limit', 'stop', 'stop-limit'] as const;
  for (const ot of orderTypes) {
    const otTrades = trades.filter(t => t.orderType === ot);
    if (otTrades.length === 0) continue;
    byOrderType[ot] = {
      pnl: Math.round(otTrades.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
      winRate: Math.round(calcWinRate(otTrades) * 10000) / 100,
      tradeCount: otTrades.length,
    };
  }

  // By symbol
  const bySymbol: Record<string, InstrumentMetrics> = {};
  const allSymbols = [...new Set(trades.map(t => t.symbol))];
  for (const sym of allSymbols) {
    const symTrades = trades.filter(t => t.symbol === sym);
    bySymbol[sym] = {
      pnl: Math.round(symTrades.reduce((s, t) => s + t.pnl, 0) * 100) / 100,
      winRate: Math.round(calcWinRate(symTrades) * 10000) / 100,
      tradeCount: symTrades.length,
      avgPnl: Math.round((symTrades.reduce((s, t) => s + t.pnl, 0) / symTrades.length) * 100) / 100,
      fees: Math.round(symTrades.reduce((s, t) => s + t.fees.total, 0) * 100) / 100,
      volume: Math.round(symTrades.reduce((s, t) => s + Math.abs(t.size * t.entryPrice), 0) * 100) / 100,
    };
  }

  const avgDuration = trades.reduce((sum, t) => sum + (t.closeTimestamp - t.timestamp), 0) / trades.length;

  const winRate = calcWinRate(trades);
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

  return {
    totalPnl: Math.round(totalPnl * 100) / 100,
    totalPnlPercent: Math.round((totalPnl / INITIAL_EQUITY) * 10000) / 100,
    winRate: Math.round(winRate * 10000) / 100,
    tradeCount: trades.length,
    avgTradeDuration: Math.round(avgDuration / 60000),
    longShortRatio: longs.length / Math.max(trades.length - longs.length, 1),
    largestWin: wins.length > 0 ? Math.round(Math.max(...wins.map(t => t.pnl)) * 100) / 100 : 0,
    largestLoss: losses.length > 0 ? Math.round(Math.min(...losses.map(t => t.pnl)) * 100) / 100 : 0,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    totalVolume: Math.round(totalVolume * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    sharpeRatio: Math.round(calcSharpe(dailyReturns) * 100) / 100,
    sortinoRatio: Math.round(calcSortino(dailyReturns) * 100) / 100,
    profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? Infinity : 0,
    expectancy: Math.round(expectancy * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
    consecutiveWins: currentConsWins,
    consecutiveLosses: currentConsLosses,
    maxConsecutiveWins: maxConsWins,
    maxConsecutiveLosses: maxConsLosses,
    byInstrument,
    byOrderType,
    bySymbol,
    equityCurve,
    drawdownCurve,
    dailyPnl: buildDailyPnl(trades),
    heatmapData: buildHeatmap(trades),
    rolling7d: calcRollingWindow(trades, 7),
    rolling30d: calcRollingWindow(trades, 30),
    rolling90d: calcRollingWindow(trades, 90),
  };
}

function getEmptyMetrics(): DashboardMetrics {
  return {
    totalPnl: 0, totalPnlPercent: 0, winRate: 0, tradeCount: 0,
    avgTradeDuration: 0, longShortRatio: 0, largestWin: 0, largestLoss: 0,
    avgWin: 0, avgLoss: 0, totalVolume: 0, totalFees: 0,
    sharpeRatio: 0, sortinoRatio: 0, profitFactor: 0, expectancy: 0,
    maxDrawdown: 0, maxDrawdownPercent: 0,
    consecutiveWins: 0, consecutiveLosses: 0,
    maxConsecutiveWins: 0, maxConsecutiveLosses: 0,
    byInstrument: {}, byOrderType: {}, bySymbol: {},
    equityCurve: [], drawdownCurve: [], dailyPnl: [],
    heatmapData: Array.from({ length: 6 }, () => Array(7).fill(0)),
    rolling7d: { sharpe: 0, winRate: 0, pnl: 0, sortino: 0 },
    rolling30d: { sharpe: 0, winRate: 0, pnl: 0, sortino: 0 },
    rolling90d: { sharpe: 0, winRate: 0, pnl: 0, sortino: 0 },
  };
}
