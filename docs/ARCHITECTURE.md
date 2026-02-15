# Architecture Documentation

## Overview

Deriverse Analytics is a client-side React application that provides institutional-grade trading analytics. It uses a layered architecture with clear separation between data, computation, state management, and presentation.

## Component Hierarchy

```
App
├── DashboardShell
│   ├── Sidebar (navigation)
│   ├── Header (filters, wallet, export)
│   └── Main Content Area
│       ├── DashboardPage
│       │   ├── FilterBar
│       │   ├── PnLCard (with MiniChart)
│       │   ├── StatsGrid (8× MetricCard)
│       │   ├── EquityCurve
│       │   ├── PerformanceHeatmap
│       │   ├── DirectionalBias
│       │   ├── FeeAnalysis
│       │   ├── RollingMetrics
│       │   ├── BestWorstTrades
│       │   └── OrderTypeAnalysis
│       ├── JournalPage
│       │   ├── FilterBar
│       │   ├── EmotionPerformance panel
│       │   ├── SetupPerformance panel
│       │   ├── GradePerformance panel
│       │   └── TradeTable
│       │       └── TradeDetail (expandable)
│       │           ├── EmotionTagger
│       │           ├── SetupClassifier
│       │           └── TradeGrader
│       ├── PortfolioPage
│       │   ├── FilterBar
│       │   ├── InstrumentBreakdown
│       │   ├── RiskMetrics
│       │   ├── GreeksExposure
│       │   ├── MarginUtilization
│       │   └── CorrelationMatrix
│       ├── FeesPage
│       │   ├── FilterBar
│       │   ├── FeeSimulator
│       │   ├── FeeAnalysis
│       │   ├── FundingRatePnL
│       │   └── LiquidationProximity
│       └── SettingsPage
```

## Data Flow

```
┌──────────────────┐
│  Mock Generator   │  Seeded PRNG produces deterministic trades
│  (mockGenerator)  │  Called once during initialization
└────────┬─────────┘
         │
         v
┌──────────────────┐
│   Zustand Store   │  Single source of truth
│   (useStore)      │  allTrades, filteredTrades, portfolio, metrics
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Filters │  dateRange, instruments, symbols, sides
    └────┬────┘
         │
         v
┌──────────────────┐
│  Metrics Engine   │  Pure function: Trade[] → DashboardMetrics
│  (metrics.ts)     │  Sharpe, Sortino, equity curve, heatmap, etc.
└────────┬─────────┘
         │
         v
┌──────────────────┐
│   Components      │  Read from store via useStore()
│   (pages/*.tsx)    │  Render charts, tables, cards
└──────────────────┘
```

## State Management

### Zustand Store

The application uses a single Zustand store with the following shape:

```typescript
interface AppStore {
  // Navigation
  currentPage: Page;

  // Data
  allTrades: Trade[];
  filteredTrades: Trade[];
  portfolio: PortfolioState;
  metrics: DashboardMetrics;

  // Filters
  filters: FilterState;

  // Journal
  updateTradeJournal: (tradeId: string, journal: Partial<TradeJournal>) => void;

  // UI
  sidebarCollapsed: boolean;
}
```

### Filter Application

When any filter changes, the store:
1. Updates the filter state
2. Re-filters `allTrades` → `filteredTrades`
3. Recalculates `metrics` from `filteredTrades`

This ensures all components always display consistent, filtered data.

## Adapter Pattern

The data layer is designed for future Deriverse SDK integration:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Current:     │     │ Future:       │     │ Future:       │
│ mockGenerator│     │ Devnet SDK    │     │ Mainnet SDK   │
│ .ts          │     │ adapter       │     │ adapter       │
└──────┬──────┘     └──────┬───────┘     └──────┬───────┘
       │                   │                    │
       └───────────┬───────┘────────────────────┘
                   │
                   v
          ┌────────────────┐
          │   Store         │
          │ (same interface)│
          └────────────────┘
```

To switch data sources, only the initialization call in the store needs to change. All components, metrics calculations, and UI remain identical.

## Performance Considerations

- **Deterministic mock data:** Seeded PRNG ensures same data on every load, enabling effective React memoization
- **Metric calculation:** Runs once per filter change, not per render
- **Component isolation:** Each dashboard widget reads only the metrics it needs
- **Chart optimization:** Recharts components use `isAnimationActive` only on initial render
- **Pagination:** Trade table paginates to 20 rows to avoid DOM overload

## Styling Architecture

All styling uses Tailwind CSS utility classes with custom theme tokens defined in `@theme` block:

```css
@theme {
  --color-bg-primary: #0a0e17;
  --color-bg-secondary: #111827;
  --color-profit: #22c55e;
  --color-loss: #ef4444;
  --color-accent: #6366f1;
  /* ... */
}
```

This enables:
- Consistent color usage across all components
- Easy theme modification
- CSS variable fallbacks for non-Tailwind contexts (chart libraries)

## Build Output

The production build produces:
- Single HTML entry point
- CSS bundle (~32KB gzipped: ~6KB)
- JS bundle (~811KB gzipped: ~242KB, includes Recharts)
- Static assets (favicon, fonts loaded from Google Fonts CDN)
