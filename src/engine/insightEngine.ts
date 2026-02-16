import type { Trade, DashboardMetrics, PortfolioState } from '../data/types';

export interface MetricInsight {
  title: string;
  definition: string;
  benchmarks: { label: string; min: number; max: number; color: string }[];
  getPersonalInsight: (value: number, ctx: TradeContext) => string;
  getActionable: (value: number, ctx: TradeContext) => string;
}

export interface TradeContext {
  trades: Trade[];
  metrics: DashboardMetrics;
  portfolio: PortfolioState;
}

const METRIC_INSIGHTS: Record<string, MetricInsight> = {
  totalPnl: {
    title: 'Total PnL',
    definition: 'Your net profit/loss across all closed trades in the selected period.',
    benchmarks: [
      { label: 'Loss', min: -Infinity, max: 0, color: '#ef4444' },
      { label: 'Break-even', min: 0, max: 500, color: '#f59e0b' },
      { label: 'Profit', min: 500, max: 2000, color: '#22c55e' },
      { label: 'Strong', min: 2000, max: Infinity, color: '#6366f1' },
    ],
    getPersonalInsight: (_value, ctx) => {
      const roi = ctx.metrics.totalPnlPercent;
      const annualized = roi * (365 / 90);
      return `At this rate, your annualized return would be ${annualized >= 0 ? '+' : ''}${annualized.toFixed(1)}% on initial equity.`;
    },
    getActionable: (value, ctx) => {
      if (value < 0) {
        const symbols = Object.entries(ctx.metrics.bySymbol).sort((a, b) => a[1].pnl - b[1].pnl);
        const worst = symbols[0];
        if (worst) return `Your biggest loss source is ${worst[0]} ($${worst[1].pnl.toFixed(2)}). Consider reducing position size there.`;
        return 'Focus on cutting losses earlier and letting winners run longer.';
      }
      const best = Object.entries(ctx.metrics.bySymbol).sort((a, b) => b[1].pnl - a[1].pnl)[0];
      if (best) return `${best[0]} is your top performer. Consider concentrating more on instruments where you have an edge.`;
      return 'Keep refining your strategy and managing risk consistently.';
    },
  },
  winRate: {
    title: 'Win Rate',
    definition: 'Percentage of trades that closed in profit. One of the two components of edge (the other being win/loss size ratio).',
    benchmarks: [
      { label: 'Needs work', min: 0, max: 40, color: '#ef4444' },
      { label: 'Average', min: 40, max: 50, color: '#f59e0b' },
      { label: 'Good', min: 50, max: 60, color: '#22c55e' },
      { label: 'Excellent', min: 60, max: 100, color: '#6366f1' },
    ],
    getPersonalInsight: (_value, ctx) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const heatmap = ctx.metrics.heatmapData;
      let bestDay = 0, bestBlock = 0, bestVal = -Infinity;
      for (let b = 0; b < heatmap.length; b++) {
        for (let d = 0; d < heatmap[b].length; d++) {
          if (heatmap[b][d] > bestVal) { bestVal = heatmap[b][d]; bestDay = d; bestBlock = b; }
        }
      }
      const timeBlocks = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
      return `Your best performance comes on ${days[bestDay]} during ${timeBlocks[bestBlock]} UTC hours.`;
    },
    getActionable: (value, ctx) => {
      const pf = ctx.metrics.profitFactor;
      if (value < 50) {
        return `Win rate alone doesn't determine profitability. Your profit factor of ${pf.toFixed(2)} means your winners are ${pf > 1 ? 'larger' : 'smaller'} than your losers.`;
      }
      return `Strong win rate combined with ${pf.toFixed(2)}x profit factor shows a solid edge. Maintain your selection criteria.`;
    },
  },
  profitFactor: {
    title: 'Profit Factor',
    definition: 'Gross profits divided by gross losses. Tells you how much you earn for every dollar lost.',
    benchmarks: [
      { label: 'Losing', min: 0, max: 1.0, color: '#ef4444' },
      { label: 'Marginal', min: 1.0, max: 1.5, color: '#f59e0b' },
      { label: 'Good', min: 1.5, max: 2.0, color: '#22c55e' },
      { label: 'Excellent', min: 2.0, max: Infinity, color: '#6366f1' },
    ],
    getPersonalInsight: (value) => {
      if (value === Infinity) return 'No losing trades — your profit factor is infinite. This is unsustainable long-term but impressive.';
      return `For every $1 you lose, you make back $${value.toFixed(2)}. ${value >= 1.5 ? 'This is a healthy ratio.' : 'Aim for at least 1.5x.'}`;
    },
    getActionable: (value, ctx) => {
      if (value < 1.5) {
        return `Focus on cutting losses earlier. Your avg loss is $${ctx.metrics.avgLoss.toFixed(2)} but your avg win is only $${ctx.metrics.avgWin.toFixed(2)}.`;
      }
      return 'Your profit factor is healthy. Focus on consistency and avoiding drawdowns.';
    },
  },
  expectancy: {
    title: 'Expectancy',
    definition: 'Average profit you can expect per trade over time. The mathematical edge of your strategy.',
    benchmarks: [
      { label: 'Negative', min: -Infinity, max: 0, color: '#ef4444' },
      { label: 'Small edge', min: 0, max: 10, color: '#f59e0b' },
      { label: 'Solid', min: 10, max: 50, color: '#22c55e' },
      { label: 'Strong', min: 50, max: Infinity, color: '#6366f1' },
    ],
    getPersonalInsight: (value) => {
      const projected = value * 100;
      return `Over your next 100 trades at current stats, you'd expect to make ~$${projected.toFixed(0)}.`;
    },
    getActionable: (_value, ctx) => {
      const winContrib = (ctx.metrics.winRate / 100) * ctx.metrics.avgWin;
      const lossContrib = (1 - ctx.metrics.winRate / 100) * ctx.metrics.avgLoss;
      const driver = winContrib > lossContrib ? 'win rate' : 'average win size';
      return `Your expectancy is driven more by ${driver}. Improving the weaker component would have the biggest impact.`;
    },
  },
  sharpeRatio: {
    title: 'Sharpe Ratio',
    definition: 'Return earned per unit of risk (volatility). The gold standard of risk-adjusted performance measurement.',
    benchmarks: [
      { label: 'Losing', min: -Infinity, max: 0, color: '#ef4444' },
      { label: 'Poor', min: 0, max: 0.5, color: '#f59e0b' },
      { label: 'Average', min: 0.5, max: 1.0, color: '#22c55e' },
      { label: 'Good', min: 1.0, max: 2.0, color: '#6366f1' },
      { label: 'Excellent', min: 2.0, max: Infinity, color: '#8b5cf6' },
    ],
    getPersonalInsight: (value, ctx) => {
      const bestSym = Object.entries(ctx.metrics.bySymbol)
        .filter(([, m]) => m.tradeCount >= 5)
        .sort((a, b) => b[1].pnl / Math.max(b[1].tradeCount, 1) - a[1].pnl / Math.max(a[1].tradeCount, 1))[0];
      if (bestSym) return `Your best risk-adjusted returns come from ${bestSym[0]} trades.`;
      return `Your Sharpe of ${value.toFixed(2)} ${value >= 1.0 ? 'indicates good risk-adjusted returns.' : 'has room for improvement.'}`;
    },
    getActionable: (value) => {
      if (value < 1.0) return 'Institutional funds typically target Sharpe >1.0. Reduce position sizing or concentrate on your best setups.';
      return 'You\'re above the institutional threshold. Maintain consistency to preserve this edge.';
    },
  },
  sortinoRatio: {
    title: 'Sortino Ratio',
    definition: 'Like Sharpe, but only penalizes downside volatility. Ignores positive volatility — a more fair measure if you have big winners.',
    benchmarks: [
      { label: 'Poor', min: -Infinity, max: 0.5, color: '#ef4444' },
      { label: 'Average', min: 0.5, max: 1.5, color: '#f59e0b' },
      { label: 'Good', min: 1.5, max: 3.0, color: '#22c55e' },
      { label: 'Excellent', min: 3.0, max: Infinity, color: '#6366f1' },
    ],
    getPersonalInsight: (value, ctx) => {
      const sharpe = ctx.metrics.sharpeRatio;
      if (value > sharpe * 1.3) return 'Sortino >> Sharpe means your volatility skews positive — your big swings are wins, not losses. Healthy pattern.';
      return `Your Sortino of ${value.toFixed(2)} is ${value >= 1.5 ? 'strong' : 'average'} — downside risk is ${value >= 1.5 ? 'well-controlled' : 'something to monitor'}.`;
    },
    getActionable: (value) => {
      if (value < 1.5) return 'Focus on reducing the size of your losing trades to improve downside risk metrics.';
      return 'Strong downside control. Your losses are well-managed relative to your gains.';
    },
  },
  maxDrawdown: {
    title: 'Max Drawdown',
    definition: 'The largest peak-to-trough decline in your equity. Shows the worst-case scenario you\'ve experienced.',
    benchmarks: [
      { label: 'Conservative', min: 0, max: 5, color: '#6366f1' },
      { label: 'Moderate', min: 5, max: 15, color: '#22c55e' },
      { label: 'Aggressive', min: 15, max: 30, color: '#f59e0b' },
      { label: 'Dangerous', min: 30, max: 100, color: '#ef4444' },
    ],
    getPersonalInsight: (value, ctx) => {
      return `Your worst drawdown was ${value.toFixed(2)}% ($${ctx.metrics.maxDrawdown.toFixed(2)}). ${value > 20 ? 'This is significant — recovery requires disproportionate gains.' : 'This is within manageable range.'}`;
    },
    getActionable: (value) => {
      if (value > 20) return 'A 50% drawdown requires 100% gain to recover. Consider reducing position sizes or max leverage.';
      if (value > 10) return 'Monitor your drawdown recovery time. Consider reducing risk when approaching your max drawdown level.';
      return 'Conservative risk management. Your drawdown control is a strength.';
    },
  },
  avgDuration: {
    title: 'Average Duration',
    definition: 'How long you hold positions on average. Helps identify your trading style and potential holding biases.',
    benchmarks: [
      { label: 'Scalper', min: 0, max: 30, color: '#6366f1' },
      { label: 'Day trader', min: 30, max: 480, color: '#22c55e' },
      { label: 'Swing', min: 480, max: 10080, color: '#f59e0b' },
      { label: 'Position', min: 10080, max: Infinity, color: '#8b5cf6' },
    ],
    getPersonalInsight: (_value, ctx) => {
      const wins = ctx.trades.filter(t => t.pnl > 0);
      const losses = ctx.trades.filter(t => t.pnl <= 0);
      const avgWinDur = wins.length > 0 ? wins.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / wins.length / 60000 : 0;
      const avgLossDur = losses.length > 0 ? losses.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / losses.length / 60000 : 0;
      const winLabel = avgWinDur > avgLossDur ? 'longer' : 'shorter';
      return `Winners held ${winLabel} on average (${formatDur(avgWinDur)} vs ${formatDur(avgLossDur)} for losers).`;
    },
    getActionable: (_value, ctx) => {
      const wins = ctx.trades.filter(t => t.pnl > 0);
      const losses = ctx.trades.filter(t => t.pnl <= 0);
      const avgWinDur = wins.length > 0 ? wins.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / wins.length / 60000 : 0;
      const avgLossDur = losses.length > 0 ? losses.reduce((s, t) => s + (t.closeTimestamp - t.timestamp), 0) / losses.length / 60000 : 0;
      if (avgLossDur > avgWinDur * 1.5) return 'You may be holding losers hoping for recovery. Consider stricter stop-losses.';
      if (avgWinDur > avgLossDur * 2) return 'Good patience with winners. Your hold discipline is contributing to profitability.';
      return 'Your hold times are balanced between winners and losers.';
    },
  },
  longShortRatio: {
    title: 'Long/Short Ratio',
    definition: 'Your directional bias — how many more longs vs shorts you trade. 1.0 = perfectly balanced.',
    benchmarks: [
      { label: 'Short bias', min: 0, max: 0.7, color: '#f59e0b' },
      { label: 'Balanced', min: 0.7, max: 1.5, color: '#22c55e' },
      { label: 'Long bias', min: 1.5, max: 3.0, color: '#6366f1' },
      { label: 'Heavy bias', min: 3.0, max: Infinity, color: '#ef4444' },
    ],
    getPersonalInsight: (_value, ctx) => {
      const longs = ctx.trades.filter(t => t.side === 'long');
      const shorts = ctx.trades.filter(t => t.side === 'short');
      const longWR = longs.length > 0 ? (longs.filter(t => t.pnl > 0).length / longs.length * 100).toFixed(1) : '0';
      const shortWR = shorts.length > 0 ? (shorts.filter(t => t.pnl > 0).length / shorts.length * 100).toFixed(1) : '0';
      return `Long trades: ${longWR}% win rate vs Short: ${shortWR}% win rate.`;
    },
    getActionable: (value) => {
      if (value > 2.5 || value < 0.4) {
        const bias = value > 1 ? 'long' : 'short';
        return `You have a strong ${bias} bias. This works in trending markets but increases risk if the market reverses.`;
      }
      return 'Relatively balanced directional exposure. This provides natural hedging in volatile markets.';
    },
  },
  fundingPnl: {
    title: 'Funding Rate PnL',
    definition: 'In perpetual futures, you pay or receive funding every 8 hours. This shows the net impact on your perps trading.',
    benchmarks: [
      { label: 'Costly', min: -Infinity, max: -100, color: '#ef4444' },
      { label: 'Minor cost', min: -100, max: 0, color: '#f59e0b' },
      { label: 'Neutral', min: 0, max: 50, color: '#22c55e' },
      { label: 'Earning', min: 50, max: Infinity, color: '#6366f1' },
    ],
    getPersonalInsight: (value, ctx) => {
      const perpTrades = ctx.trades.filter(t => t.instrument === 'perpetual');
      const tradingPnl = perpTrades.reduce((s, t) => s + t.pnl, 0);
      if (tradingPnl === 0) return 'No perpetual trades in this period.';
      const pct = Math.abs(value / tradingPnl * 100);
      return `Funding has ${value >= 0 ? 'added' : 'cost'} you $${Math.abs(value).toFixed(2)} total. That's ${pct.toFixed(1)}% of your perps PnL.`;
    },
    getActionable: (value) => {
      if (value < -50) return 'Consider closing perp positions before funding snapshots if you\'re consistently on the paying side.';
      return 'Funding costs are manageable relative to your trading PnL.';
    },
  },
  delta: {
    title: 'Delta (Δ)',
    definition: 'How much your portfolio moves per $1 move in the underlying. Delta of 0.5 means you gain $0.50 per $1 upward move.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (v) => `Net portfolio delta of ${v >= 0 ? '+' : ''}${v.toFixed(2)}. ${Math.abs(v) > 1 ? 'Significant directional exposure.' : 'Moderate exposure.'}`,
    getActionable: (v) => Math.abs(v) > 2 ? 'High delta — consider hedging to reduce directional risk.' : 'Delta within normal range.',
  },
  gamma: {
    title: 'Gamma (Γ)',
    definition: 'Rate of change of your Delta per $1 move. High Gamma means your exposure changes rapidly with price movement.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (v) => `Gamma of ${v.toFixed(4)}. ${Math.abs(v) > 0.1 ? 'Your delta shifts quickly — monitor closely.' : 'Low gamma, stable delta exposure.'}`,
    getActionable: (v) => Math.abs(v) > 0.1 ? 'High gamma requires frequent delta hedging.' : 'Gamma is manageable.',
  },
  theta: {
    title: 'Theta (Θ)',
    definition: 'Time decay — how much value your options portfolio loses per day as expiration approaches.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (v) => `Daily time decay: $${v.toFixed(2)}. ${v < -10 ? 'Significant daily bleed from options.' : 'Modest time decay impact.'}`,
    getActionable: (v) => v < -20 ? 'Consider selling options to offset theta decay, or close positions nearing expiry.' : 'Theta is within normal range.',
  },
  vega: {
    title: 'Vega (ν)',
    definition: 'Sensitivity to volatility changes. Positive Vega means you profit when implied volatility rises.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (v) => `Vega exposure: ${v >= 0 ? '+' : ''}${v.toFixed(2)}. ${v > 0 ? 'You profit from rising volatility.' : 'You benefit from falling volatility.'}`,
    getActionable: (v) => Math.abs(v) > 50 ? 'Large vega exposure — a volatility spike could significantly impact your portfolio.' : 'Vega exposure is moderate.',
  },
  marginUtilization: {
    title: 'Margin Utilization',
    definition: 'Percentage of your available margin currently in use by open positions.',
    benchmarks: [
      { label: 'Safe', min: 0, max: 30, color: '#22c55e' },
      { label: 'Moderate', min: 30, max: 60, color: '#f59e0b' },
      { label: 'High', min: 60, max: 80, color: '#ef4444' },
      { label: 'Danger', min: 80, max: 100, color: '#ef4444' },
    ],
    getPersonalInsight: (v, ctx) => {
      const positions = ctx.portfolio.positions.length;
      return `${v.toFixed(1)}% margin used across ${positions} positions. ${v > 60 ? 'Limited room for new trades.' : 'Healthy margin buffer.'}`;
    },
    getActionable: (v) => {
      if (v > 60) return 'High margin usage increases liquidation risk. Consider closing some positions or adding collateral.';
      return 'Comfortable margin level. Room for additional positions if needed.';
    },
  },
  liquidationProximity: {
    title: 'Liquidation Proximity',
    definition: 'How close your leveraged positions are to being force-closed by the exchange. Larger distance = safer.',
    benchmarks: [
      { label: 'Danger', min: 0, max: 5, color: '#ef4444' },
      { label: 'Warning', min: 5, max: 15, color: '#f59e0b' },
      { label: 'Moderate', min: 15, max: 30, color: '#22c55e' },
      { label: 'Safe', min: 30, max: 100, color: '#6366f1' },
    ],
    getPersonalInsight: (v, ctx) => {
      const leveraged = ctx.portfolio.positions.filter(p => p.leverage > 1 && p.liquidationPrice > 0);
      return `Nearest liquidation is ${v.toFixed(1)}% away. ${leveraged.length} leveraged position${leveraged.length !== 1 ? 's' : ''} open.`;
    },
    getActionable: (v) => {
      if (v < 10) return 'Dangerously close to liquidation. Consider adding margin or reducing position size immediately.';
      if (v < 20) return 'Monitor closely. A 10-15% market move could trigger liquidation.';
      return 'Comfortable distance from liquidation levels.';
    },
  },
  emotionPerformance: {
    title: 'Emotion-Performance Link',
    definition: 'How your tagged emotional state correlates with trading results. Data-driven self-awareness.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (_, ctx) => {
      const emotions = new Map<string, { pnl: number; count: number }>();
      for (const t of ctx.trades) {
        if (!t.journal) continue;
        const e = emotions.get(t.journal.emotion) || { pnl: 0, count: 0 };
        e.pnl += t.pnl; e.count++;
        emotions.set(t.journal.emotion, e);
      }
      const sorted = [...emotions.entries()].sort((a, b) => b[1].pnl / b[1].count - a[1].pnl / a[1].count);
      if (sorted.length < 2) return 'Tag more trades with emotions to see patterns.';
      const best = sorted[0], worst = sorted[sorted.length - 1];
      return `'${best[0]}' trades avg +$${(best[1].pnl / best[1].count).toFixed(2)} vs '${worst[0]}' avg $${(worst[1].pnl / worst[1].count).toFixed(2)}.`;
    },
    getActionable: (_, ctx) => {
      const revenge = ctx.trades.filter(t => t.journal?.emotion === 'revenge');
      if (revenge.length > 0) {
        const avgLoss = revenge.reduce((s, t) => s + t.pnl, 0) / revenge.length;
        return `Revenge trading costs ~$${Math.abs(avgLoss).toFixed(2)} per trade. Recognizing the pattern is the first step.`;
      }
      return 'Continue tagging trades with emotions to build a stronger behavioral dataset.';
    },
  },
  setupPerformance: {
    title: 'Setup Performance',
    definition: 'Which trade setups (breakout, trend, etc.) work best for your specific trading style.',
    benchmarks: [{ label: 'Range', min: -Infinity, max: Infinity, color: '#6366f1' }],
    getPersonalInsight: (_, ctx) => {
      const setups = new Map<string, { pnl: number; count: number; wins: number }>();
      for (const t of ctx.trades) {
        if (!t.journal) continue;
        const s = setups.get(t.journal.setup) || { pnl: 0, count: 0, wins: 0 };
        s.pnl += t.pnl; s.count++; if (t.pnl > 0) s.wins++;
        setups.set(t.journal.setup, s);
      }
      const best = [...setups.entries()].filter(([, v]) => v.count >= 3).sort((a, b) => b[1].wins / b[1].count - a[1].wins / a[1].count)[0];
      if (!best) return 'Tag more trades with setups to discover your best patterns.';
      return `Best setup: '${best[0]}' with ${(best[1].wins / best[1].count * 100).toFixed(0)}% win rate and $${best[1].pnl.toFixed(2)} total PnL.`;
    },
    getActionable: (_, ctx) => {
      const setups = new Map<string, { count: number; wr: number }>();
      for (const t of ctx.trades) {
        if (!t.journal) continue;
        const s = setups.get(t.journal.setup) || { count: 0, wr: 0 };
        s.count++; if (t.pnl > 0) s.wr++;
        setups.set(t.journal.setup, s);
      }
      const underused = [...setups.entries()]
        .filter(([, v]) => v.count >= 3)
        .map(([k, v]) => ({ k, wr: v.wr / v.count * 100, pct: v.count / ctx.trades.length * 100 }))
        .filter(x => x.wr > 60 && x.pct < 20);
      if (underused.length > 0) return `'${underused[0].k}' has ${underused[0].wr.toFixed(0)}% WR but only ${underused[0].pct.toFixed(0)}% of your trades. Use it more.`;
      return 'Continue journaling setups to identify your highest-edge patterns.';
    },
  },
};

function formatDur(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function getMetricInsight(metric: string): MetricInsight | undefined {
  return METRIC_INSIGHTS[metric];
}

export function getBenchmarkPosition(value: number, benchmarks: MetricInsight['benchmarks']): { position: number; label: string; color: string } {
  for (const b of benchmarks) {
    if (value >= b.min && value < b.max) {
      const range = Math.min(b.max, 100) - Math.max(b.min, -100);
      const pos = range > 0 ? Math.min(Math.max((value - Math.max(b.min, -100)) / range, 0), 1) : 0.5;
      return { position: pos, label: b.label, color: b.color };
    }
  }
  const last = benchmarks[benchmarks.length - 1];
  return { position: 1, label: last.label, color: last.color };
}
