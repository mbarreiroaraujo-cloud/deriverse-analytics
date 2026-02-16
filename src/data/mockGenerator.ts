import type { Trade, Instrument, Side, OrderType, Emotion, Setup, Grade, OptionsData, Position, PortfolioState } from './types';

// Seeded PRNG for deterministic output
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) & 0xffffffff;
    return (this.seed >>> 0) / 0xffffffff;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  pick<T>(arr: T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
  gaussian(): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  pareto(alpha: number): number {
    const u = this.next();
    return 1 / Math.pow(1 - u, 1 / alpha);
  }
}

const SYMBOLS: Record<Instrument, string[]> = {
  spot: ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'BONK/USDC', 'WIF/USDC', 'JUP/USDC'],
  perpetual: ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'BONK-PERP'],
  options: ['SOL-CALL', 'SOL-PUT', 'BTC-CALL', 'ETH-CALL', 'ETH-PUT'],
  futures: ['SOL-FUT-0326', 'BTC-FUT-0326', 'ETH-FUT-0326'],
};

const BASE_PRICES: Record<string, number> = {
  'SOL/USDC': 148, 'BTC/USDC': 97500, 'ETH/USDC': 3450,
  'BONK/USDC': 0.000024, 'WIF/USDC': 1.85, 'JUP/USDC': 0.92,
  'SOL-PERP': 148, 'BTC-PERP': 97500, 'ETH-PERP': 3450, 'BONK-PERP': 0.000024,
  'SOL-CALL': 148, 'SOL-PUT': 148, 'BTC-CALL': 97500, 'ETH-CALL': 3450, 'ETH-PUT': 3450,
  'SOL-FUT-0326': 150, 'BTC-FUT-0326': 98200, 'ETH-FUT-0326': 3500,
};

const EMOTIONS: Emotion[] = ['disciplined', 'fomo', 'revenge', 'fearful', 'greedy', 'neutral'];
const SETUPS: Setup[] = ['breakout', 'mean-reversion', 'trend', 'range', 'news', 'other'];
const GRADES: Grade[] = ['A', 'B', 'C', 'D'];

function getTradeSize(rng: SeededRandom, symbol: string): number {
  const base = BASE_PRICES[symbol] || 100;
  if (base > 10000) return rng.range(0.01, 0.5);
  if (base > 100) return rng.range(1, 50);
  if (base > 1) return rng.range(10, 500);
  if (base > 0.001) return rng.range(100000, 5000000);
  return rng.range(1000000, 50000000);
}

function generateOptionsData(rng: SeededRandom, symbol: string, timestamp: number): OptionsData {
  const base = BASE_PRICES[symbol] || 100;
  const isCall = symbol.includes('CALL');
  const strikeOffset = rng.range(-0.1, 0.1) * base;
  const strike = Math.round((base + strikeOffset) * 100) / 100;
  const expiry = timestamp + rng.int(7, 45) * 86400000;
  const iv = rng.range(0.4, 1.2);
  const delta = isCall ? rng.range(0.2, 0.8) : rng.range(-0.8, -0.2);
  return {
    type: isCall ? 'call' : 'put',
    strike,
    expiry,
    iv,
    greeks: {
      delta: Math.round(delta * 1000) / 1000,
      gamma: Math.round(rng.range(0.001, 0.05) * 10000) / 10000,
      theta: Math.round(-rng.range(0.5, 5) * 100) / 100,
      vega: Math.round(rng.range(0.1, 2) * 100) / 100,
    },
  };
}

export function generateTrades(seed: number = 42): Trade[] {
  const rng = new SeededRandom(seed);
  const trades: Trade[] = [];
  const numTrades = rng.int(580, 720);
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * 86400000;

  // Drawdown periods: 2-3 multi-day losing streaks
  const drawdownStarts = [
    ninetyDaysAgo + rng.int(15, 25) * 86400000,
    ninetyDaysAgo + rng.int(50, 60) * 86400000,
    ninetyDaysAgo + rng.int(72, 80) * 86400000,
  ];
  const drawdownDurations = [rng.int(3, 6), rng.int(4, 7), rng.int(2, 4)];

  for (let i = 0; i < numTrades; i++) {
    // Temporal clustering: more trades during Asian (00-08 UTC) and US (13-21 UTC) sessions
    const dayOffset = rng.range(0, 89);
    const day = ninetyDaysAgo + dayOffset * 86400000;

    const sessionRoll = rng.next();
    let hour: number;
    if (sessionRoll < 0.35) {
      hour = rng.range(0, 8); // Asian session
    } else if (sessionRoll < 0.8) {
      hour = rng.range(13, 21); // US session
    } else {
      hour = rng.range(0, 24); // Random
    }
    const timestamp = day + hour * 3600000 + rng.range(0, 3600000);

    // Instrument distribution: 40% spot, 35% perps, 15% options, 10% futures
    const instRoll = rng.next();
    let instrument: Instrument;
    if (instRoll < 0.4) instrument = 'spot';
    else if (instRoll < 0.75) instrument = 'perpetual';
    else if (instRoll < 0.9) instrument = 'options';
    else instrument = 'futures';

    const symbol = rng.pick(SYMBOLS[instrument]);
    const side: Side = rng.next() < 0.55 ? 'long' : 'short';

    // Leverage distribution
    let leverage = 1;
    if (instrument === 'perpetual' || instrument === 'futures') {
      const levRoll = rng.next();
      if (levRoll < 0.8) leverage = rng.range(2, 5);
      else if (levRoll < 0.95) leverage = rng.range(5, 8);
      else leverage = rng.range(8, 10);
      leverage = Math.round(leverage * 10) / 10;
    }

    const basePrice = BASE_PRICES[symbol] || 100;
    const volatility = rng.range(0.002, 0.03);
    const entryPrice = basePrice * (1 + rng.gaussian() * 0.05);

    // PnL: fat-tailed Pareto distribution
    // Check if in drawdown period
    let inDrawdown = false;
    for (let d = 0; d < drawdownStarts.length; d++) {
      if (timestamp >= drawdownStarts[d] && timestamp <= drawdownStarts[d] + drawdownDurations[d] * 86400000) {
        inDrawdown = true;
        break;
      }
    }

    // Base win probability: 60% normally, 35% during drawdowns
    const winProb = inDrawdown ? 0.35 : 0.62;
    const isWin = rng.next() < winProb;

    // PnL magnitude: Pareto-distributed (many small, few large)
    const magnitude = rng.pareto(2.5) * basePrice * volatility;
    const size = getTradeSize(rng, symbol);
    const notional = size * entryPrice;
    let pnlBase = magnitude * size * leverage;

    // Cap PnL to realistic range
    const maxPnl = notional * leverage * 0.15;
    pnlBase = Math.min(pnlBase, maxPnl);

    const pnl = isWin ? pnlBase : -pnlBase * rng.range(0.7, 1.3);

    // Calculate exit price from PnL
    const priceChange = pnl / (size * leverage);
    const exitPrice = side === 'long' ? entryPrice + priceChange : entryPrice - priceChange;

    // Trade duration
    let durationMs: number;
    if (instrument === 'spot') {
      durationMs = rng.range(2, 48) * 3600000; // 2h - 48h
    } else if (instrument === 'perpetual') {
      durationMs = rng.range(5, 480) * 60000; // 5min - 8h
    } else if (instrument === 'options') {
      durationMs = rng.range(1, 30) * 86400000; // 1d - 30d
    } else {
      durationMs = rng.range(4, 168) * 3600000; // 4h - 7d
    }

    const closeTimestamp = timestamp + durationMs;

    // Fees
    const orderType: OrderType = rng.pick(['market', 'limit', 'stop', 'stop-limit']);
    const isMaker = orderType === 'limit';
    const entryFeeRate = isMaker ? rng.range(0.0002, 0.0005) : rng.range(0.0005, 0.001);
    const exitFeeRate = isMaker ? rng.range(0.0002, 0.0005) : rng.range(0.0005, 0.001);
    const entryFee = notional * entryFeeRate;
    const exitFee = Math.abs(exitPrice * size) * exitFeeRate;
    let fundingFee = 0;
    if (instrument === 'perpetual') {
      const fundingPeriods = Math.floor(durationMs / (8 * 3600000));
      fundingFee = fundingPeriods * notional * rng.range(-0.0001, 0.0003);
    }

    // Journal data for ~30% of trades
    let journal: Trade['journal'] | undefined;
    if (rng.next() < 0.3) {
      const emotionWeights = inDrawdown
        ? [0.1, 0.25, 0.3, 0.2, 0.1, 0.05]
        : [0.4, 0.1, 0.05, 0.1, 0.1, 0.25];
      const emotionRoll = rng.next();
      let emotionIdx = 0;
      let cumWeight = 0;
      for (let e = 0; e < emotionWeights.length; e++) {
        cumWeight += emotionWeights[e];
        if (emotionRoll <= cumWeight) { emotionIdx = e; break; }
      }

      const gradeIdx = isWin
        ? (rng.next() < 0.6 ? 0 : rng.next() < 0.7 ? 1 : 2)
        : (rng.next() < 0.3 ? 1 : rng.next() < 0.6 ? 2 : 3);

      const preNotes = [
        'Strong trend forming, waiting for pullback entry',
        'Breaking above key resistance with volume',
        'Mean reversion setup at support',
        'News catalyst expected, positioning early',
        'Funding rate divergence opportunity',
        'Range bound, playing the levels',
        'Following institutional flow signals',
        'Momentum building after consolidation',
      ];
      const postNotes = [
        'Executed as planned, good entry timing',
        'Should have waited for better entry',
        'Took profit too early, left money on the table',
        'Stop was too tight, got shaken out',
        'Perfect execution on the setup',
        'Oversize position, need to manage risk better',
        'Market moved against thesis, cut quickly',
        'Held through noise, thesis played out',
      ];

      journal = {
        emotion: EMOTIONS[emotionIdx],
        setup: rng.pick(SETUPS),
        grade: GRADES[gradeIdx],
        preTradeNote: rng.pick(preNotes),
        postTradeNote: rng.pick(postNotes),
      };
    }

    // Options data
    let optionsData: OptionsData | undefined;
    if (instrument === 'options') {
      optionsData = generateOptionsData(rng, symbol, timestamp);
    }

    const roundedPnl = Math.round(pnl * 100) / 100;

    trades.push({
      id: `trade-${i.toString().padStart(4, '0')}`,
      timestamp,
      closeTimestamp,
      instrument,
      symbol,
      side,
      entryPrice: Math.round(entryPrice * 10000) / 10000,
      exitPrice: Math.round(exitPrice * 10000) / 10000,
      size: Math.round(size * 10000) / 10000,
      leverage,
      pnl: roundedPnl,
      fees: {
        entry: Math.round(entryFee * 100) / 100,
        exit: Math.round(exitFee * 100) / 100,
        funding: Math.round(fundingFee * 100) / 100,
        total: Math.round((entryFee + exitFee + Math.abs(fundingFee)) * 100) / 100,
      },
      orderType,
      journal,
      optionsData,
    });
  }

  // Sort by timestamp
  trades.sort((a, b) => a.timestamp - b.timestamp);
  return trades;
}

export function generatePositions(): Position[] {
  return [
    {
      instrument: 'perpetual', symbol: 'SOL-PERP', side: 'long', size: 120,
      entryPrice: 145.32, currentPrice: 148.67, unrealizedPnl: 402.00,
      leverage: 5, liquidationPrice: 121.10, marginUsed: 3487.68,
    },
    {
      instrument: 'perpetual', symbol: 'BTC-PERP', side: 'short', size: 0.15,
      entryPrice: 98200, currentPrice: 97450, unrealizedPnl: 112.50,
      leverage: 3, liquidationPrice: 130933.33, marginUsed: 4910.00,
    },
    {
      instrument: 'spot', symbol: 'ETH/USDC', side: 'long', size: 5.2,
      entryPrice: 3380, currentPrice: 3450, unrealizedPnl: 364.00,
      leverage: 1, liquidationPrice: 0, marginUsed: 17576.00,
    },
    {
      instrument: 'options', symbol: 'SOL-CALL', side: 'long', size: 50,
      entryPrice: 8.50, currentPrice: 12.20, unrealizedPnl: 185.00,
      leverage: 1, liquidationPrice: 0, marginUsed: 425.00,
    },
  ];
}

export function generatePortfolioState(): PortfolioState {
  const positions = generatePositions();
  const unrealizedPnl = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const usedMargin = positions.reduce((sum, p) => sum + p.marginUsed, 0);
  return {
    totalEquity: 67834.52,
    availableMargin: 67834.52 - usedMargin,
    usedMargin,
    unrealizedPnl,
    positions,
    greeksAggregate: {
      delta: 285.4,
      gamma: 12.8,
      theta: -45.2,
      vega: 38.7,
    },
  };
}
