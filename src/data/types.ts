export type Instrument = 'spot' | 'perpetual' | 'options' | 'futures';
export type Side = 'long' | 'short';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
export type Emotion = 'disciplined' | 'fomo' | 'revenge' | 'fearful' | 'greedy' | 'neutral';
export type Setup = 'breakout' | 'mean-reversion' | 'trend' | 'range' | 'news' | 'other';
export type Grade = 'A' | 'B' | 'C' | 'D';

export interface TradeFees {
  entry: number;
  exit: number;
  funding: number;
  total: number;
}

export interface OptionsData {
  type: 'call' | 'put';
  strike: number;
  expiry: number;
  iv: number;
  greeks: Greeks;
}

export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface TradeJournal {
  emotion: Emotion;
  setup: Setup;
  grade: Grade;
  preTradeNote: string;
  postTradeNote: string;
}

export interface Trade {
  id: string;
  timestamp: number;
  closeTimestamp: number;
  instrument: Instrument;
  symbol: string;
  side: Side;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  fees: TradeFees;
  orderType: OrderType;
  journal?: TradeJournal;
  optionsData?: OptionsData;
}

export interface Position {
  instrument: Instrument;
  symbol: string;
  side: Side;
  size: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  leverage: number;
  liquidationPrice: number;
  marginUsed: number;
}

export interface PortfolioState {
  totalEquity: number;
  availableMargin: number;
  usedMargin: number;
  unrealizedPnl: number;
  positions: Position[];
  greeksAggregate: Greeks;
}

export interface InstrumentMetrics {
  pnl: number;
  winRate: number;
  tradeCount: number;
  avgPnl: number;
  fees: number;
  volume: number;
}

export interface OrderTypeMetrics {
  pnl: number;
  winRate: number;
  tradeCount: number;
}

export interface RollingWindow {
  sharpe: number;
  winRate: number;
  pnl: number;
  sortino: number;
}

export interface DashboardMetrics {
  totalPnl: number;
  totalPnlPercent: number;
  winRate: number;
  tradeCount: number;
  avgTradeDuration: number;
  longShortRatio: number;
  largestWin: number;
  largestLoss: number;
  avgWin: number;
  avgLoss: number;
  totalVolume: number;
  totalFees: number;
  sharpeRatio: number;
  sortinoRatio: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  byInstrument: Record<string, InstrumentMetrics>;
  byOrderType: Record<string, OrderTypeMetrics>;
  bySymbol: Record<string, InstrumentMetrics>;
  equityCurve: EquityPoint[];
  drawdownCurve: DrawdownPoint[];
  dailyPnl: DailyPnl[];
  heatmapData: number[][];
  rolling7d: RollingWindow;
  rolling30d: RollingWindow;
  rolling90d: RollingWindow;
}

export interface EquityPoint {
  date: string;
  equity: number;
  pnl: number;
}

export interface DrawdownPoint {
  date: string;
  drawdown: number;
  drawdownPercent: number;
}

export interface DailyPnl {
  date: string;
  pnl: number;
  tradeCount: number;
  winRate: number;
}

export type Page = 'dashboard' | 'journal' | 'portfolio' | 'fees' | 'settings';

export interface FilterState {
  dateRange: [number, number];
  instruments: Instrument[];
  symbols: string[];
  sides: Side[];
}
