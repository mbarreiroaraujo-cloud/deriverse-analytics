# Metrics Engine Documentation

All financial metrics are calculated in `src/engine/metrics.ts`. This document provides the mathematical foundation for each metric.

## Risk-Adjusted Returns

### Sharpe Ratio

Measures risk-adjusted return by comparing excess returns to volatility.

```
Sharpe = (μ - Rf) / σ × √252

Where:
  μ  = Mean daily return
  Rf = Risk-free daily rate (5% annual / 365)
  σ  = Standard deviation of daily returns
  252 = Trading days for annualization
```

**Interpretation:**
| Value | Rating |
|-------|--------|
| > 2.0 | Excellent |
| 1.0 - 2.0 | Good |
| 0.0 - 1.0 | Fair |
| < 0.0 | Poor |

### Sortino Ratio

Similar to Sharpe but only penalizes downside volatility, making it more appropriate for trading where upside volatility is desirable.

```
Sortino = (μ - Rf) / σd × √252

Where:
  σd = Standard deviation of returns below Rf (downside deviation)
  Only negative returns contribute to σd
```

**Interpretation:**
| Value | Rating |
|-------|--------|
| > 3.0 | Excellent |
| 1.5 - 3.0 | Good |
| 0.0 - 1.5 | Fair |
| < 0.0 | Poor |

## Performance Metrics

### Profit Factor

The ratio of gross profits to gross losses. A fundamental measure of trading system quality.

```
Profit Factor = Σ(winning trades) / |Σ(losing trades)|
```

**Interpretation:**
| Value | Rating |
|-------|--------|
| > 2.0 | Excellent |
| 1.5 - 2.0 | Good |
| 1.0 - 1.5 | Marginal |
| < 1.0 | Unprofitable |

### Expectancy

The expected profit per trade, combining win rate with average win/loss sizes.

```
Expectancy = (WR × AvgWin) - ((1 - WR) × AvgLoss)

Where:
  WR     = Win rate (0-1)
  AvgWin = Average winning trade size
  AvgLoss = Average losing trade size (absolute value)
```

A positive expectancy means the system has a mathematical edge.

### Win Rate

```
Win Rate = Winning Trades / Total Trades × 100

Where: Winning Trade = trade with PnL > 0
```

## Risk Metrics

### Maximum Drawdown

The largest peak-to-trough decline in portfolio equity, expressed as a percentage.

```
Max Drawdown % = max((Peak - Trough) / Peak × 100)

Calculated across the entire equity curve:
  1. Track running peak equity
  2. At each point, calculate (peak - current) / peak
  3. Maximum of all such calculations = Max Drawdown
```

### Equity Curve

Built by accumulating daily net PnL (PnL minus fees) starting from initial equity:

```
Equity(day) = Initial Equity + Σ(PnL(i) - Fees(i)) for all trades closed on or before day
```

### Drawdown Curve

```
Drawdown(day) = Peak(day) - Equity(day)
Drawdown%(day) = Drawdown(day) / Peak(day) × 100

Where: Peak(day) = max(Equity(1), Equity(2), ..., Equity(day))
```

## Directional Metrics

### Long/Short Ratio

```
L/S Ratio = Number of Long Trades / Number of Short Trades
```

Values > 1.0 indicate long bias, < 1.0 indicate short bias.

## Temporal Metrics

### Performance Heatmap

PnL is aggregated into a 6×7 matrix:
- **Rows:** 6 time blocks (00-04, 04-08, 08-12, 12-16, 16-20, 20-24 UTC)
- **Columns:** 7 days (Monday through Sunday)

Each cell = sum of PnL for trades opened during that time block and day.

### Rolling Windows

Sharpe, Sortino, Win Rate, and PnL are calculated for 7-day, 30-day, and 90-day trailing windows to show how edge evolves over time.

## Fee Metrics

### Fee Breakdown

Fees are categorized into:
- **Entry fees:** Cost to open position (maker or taker rate × notional)
- **Exit fees:** Cost to close position
- **Funding fees:** Periodic payments on perpetual futures (can be positive or negative)
- **Total fees:** Entry + Exit + |Funding|

### Cumulative Fee Chart

Running total of fees over time, showing the compounding cost of trading.

## Deriverse-Specific

### Fee Subscription Savings

```
Savings = Current Fees - (Discounted Fees + Subscription Cost)

Discounted Maker Fees = Maker Fees × (1 - Maker Discount%)
Discounted Taker Fees = Taker Fees × (1 - Taker Discount%)

ROI = Savings / Subscription Cost × 100
```

### Funding Rate PnL Separation

For perpetual futures, total PnL is split into:
- **Trading PnL:** Profit/loss from price movement
- **Funding Cost:** Net funding payments over the position lifetime

```
Net Perps PnL = Trading PnL - |Funding Cost|
```

## Correlation Matrix

Pearson correlation coefficient between daily PnL series of different instruments:

```
ρ(A,B) = Σ((Ai - μA)(Bi - μB)) / √(Σ(Ai - μA)² × Σ(Bi - μB)²)

Computed over common trading days with minimum 5 data points
```
