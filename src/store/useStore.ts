import { create } from 'zustand';
import type { Trade, Page, FilterState, Instrument, DashboardMetrics, PortfolioState, TradeJournal } from '../data/types';
import { generateTrades, generatePortfolioState } from '../data/mockGenerator';
import { calculateMetrics } from '../engine/metrics';

interface AppStore {
  // Navigation
  currentPage: Page;
  setPage: (page: Page) => void;

  // Data
  allTrades: Trade[];
  filteredTrades: Trade[];
  portfolio: PortfolioState;
  metrics: DashboardMetrics;

  // Filters
  filters: FilterState;
  setDateRange: (range: [number, number]) => void;
  setInstruments: (instruments: Instrument[]) => void;
  setSymbols: (symbols: string[]) => void;
  resetFilters: () => void;

  // Journal
  updateTradeJournal: (tradeId: string, journal: Partial<TradeJournal>) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Init
  initialize: () => void;
}

const defaultFilters: FilterState = {
  dateRange: [Date.now() - 90 * 86400000, Date.now()],
  instruments: [],
  symbols: [],
  sides: [],
};

function applyFilters(trades: Trade[], filters: FilterState): Trade[] {
  return trades.filter(trade => {
    if (trade.timestamp < filters.dateRange[0] || trade.timestamp > filters.dateRange[1]) return false;
    if (filters.instruments.length > 0 && !filters.instruments.includes(trade.instrument)) return false;
    if (filters.symbols.length > 0 && !filters.symbols.includes(trade.symbol)) return false;
    if (filters.sides.length > 0 && !filters.sides.includes(trade.side)) return false;
    return true;
  });
}

export const useStore = create<AppStore>((set, get) => ({
  currentPage: 'dashboard',
  setPage: (page) => set({ currentPage: page, sidebarOpen: false }),

  allTrades: [],
  filteredTrades: [],
  portfolio: generatePortfolioState(),
  metrics: calculateMetrics([]),

  filters: defaultFilters,
  setDateRange: (range) => {
    const filters = { ...get().filters, dateRange: range };
    const filtered = applyFilters(get().allTrades, filters);
    set({ filters, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },
  setInstruments: (instruments) => {
    const filters = { ...get().filters, instruments };
    const filtered = applyFilters(get().allTrades, filters);
    set({ filters, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },
  setSymbols: (symbols) => {
    const filters = { ...get().filters, symbols };
    const filtered = applyFilters(get().allTrades, filters);
    set({ filters, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },
  resetFilters: () => {
    const filters = defaultFilters;
    const filtered = applyFilters(get().allTrades, filters);
    set({ filters, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },

  updateTradeJournal: (tradeId, journalUpdate) => {
    const allTrades = get().allTrades.map(t => {
      if (t.id !== tradeId) return t;
      return {
        ...t,
        journal: {
          emotion: 'neutral' as const,
          setup: 'other' as const,
          grade: 'C' as const,
          preTradeNote: '',
          postTradeNote: '',
          ...t.journal,
          ...journalUpdate,
        },
      };
    });
    const filtered = applyFilters(allTrades, get().filters);
    set({ allTrades, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },

  sidebarCollapsed: false,
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  initialize: () => {
    const allTrades = generateTrades(42);
    const filtered = applyFilters(allTrades, defaultFilters);
    set({ allTrades, filteredTrades: filtered, metrics: calculateMetrics(filtered) });
  },
}));
