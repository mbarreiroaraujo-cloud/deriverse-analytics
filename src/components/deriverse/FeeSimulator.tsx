import { useState } from 'react';
import { Wallet, TrendingDown, ArrowRight, Star, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Tier {
  name: string;
  monthlyFee: number;
  makerDiscount: number;
  takerDiscount: number;
}

const TIERS: Tier[] = [
  { name: 'No Subscription', monthlyFee: 0, makerDiscount: 0, takerDiscount: 0 },
  { name: 'Basic', monthlyFee: 49, makerDiscount: 0.3, takerDiscount: 0.25 },
  { name: 'Pro', monthlyFee: 149, makerDiscount: 0.5, takerDiscount: 0.5 },
  { name: 'Enterprise', monthlyFee: 499, makerDiscount: 0.7, takerDiscount: 0.75 },
];

function formatFee(value: number, compact = false): string {
  if (compact && value > 100) return `$${Math.round(value)}`;
  return `$${value.toFixed(2)}`;
}

function calcTierSavings(currentFees: number, makerFees: number, takerFees: number, fundingFees: number, tier: Tier) {
  const discountedMaker = makerFees * (1 - tier.makerDiscount);
  const discountedTaker = takerFees * (1 - tier.takerDiscount);
  const discountedTotal = discountedMaker + discountedTaker + fundingFees;
  const monthsInPeriod = 3;
  const subscriptionCost = tier.monthlyFee * monthsInPeriod;
  const totalWithSub = discountedTotal + subscriptionCost;
  const savings = currentFees - totalWithSub;
  const roi = subscriptionCost > 0 ? ((savings / subscriptionCost) * 100) : 0;
  return { savings, roi, totalWithSub, subscriptionCost, discountedMaker, discountedTaker };
}

export function FeeSimulator() {
  const { filteredTrades, metrics } = useStore();
  const [selectedTier, setSelectedTier] = useState(2); // Default to Pro

  const currentFees = metrics.totalFees;
  const tier = TIERS[selectedTier];

  const makerTrades = filteredTrades.filter(t => t.orderType === 'limit');
  const takerTrades = filteredTrades.filter(t => t.orderType !== 'limit');
  const makerFees = makerTrades.reduce((s, t) => s + t.fees.entry + t.fees.exit, 0);
  const takerFees = takerTrades.reduce((s, t) => s + t.fees.entry + t.fees.exit, 0);
  const fundingFees = filteredTrades.reduce((s, t) => s + Math.abs(t.fees.funding), 0);

  const { savings, roi, totalWithSub, subscriptionCost, discountedMaker, discountedTaker } = calcTierSavings(currentFees, makerFees, takerFees, fundingFees, tier);

  // Find best tier (highest savings)
  const allTierSavings = TIERS.map((t, i) => ({ index: i, ...calcTierSavings(currentFees, makerFees, takerFees, fundingFees, t) }));
  const bestTier = allTierSavings.reduce((best, curr) => curr.savings > best.savings ? curr : best, allTierSavings[0]);

  // Monthly projection
  const monthlySavings = savings / 3;
  const monthlyFees = currentFees / 3;

  // Break-even: how many trades at current rate to recoup subscription
  const avgFeePerTrade = filteredTrades.length > 0 ? currentFees / filteredTrades.length : 0;
  const avgDiscountPerTrade = avgFeePerTrade > 0 ? (currentFees - (totalWithSub - subscriptionCost)) / filteredTrades.length : 0;
  const breakEvenTrades = avgDiscountPerTrade > 0 ? Math.ceil(tier.monthlyFee / avgDiscountPerTrade) : Infinity;

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-hover card-accent">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
          <Wallet size={16} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Deriverse Fee Optimizer</h3>
          <p className="text-[10px] sm:text-xs text-text-muted hidden sm:block">Calculate subscription ROI based on your trading</p>
        </div>
      </div>

      {/* Tier selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-5">
        {TIERS.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setSelectedTier(i)}
            className={`relative py-2 px-2 rounded-lg text-center transition-all border ${
              selectedTier === i
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-bg-primary border-border/50 text-text-muted hover:border-text-muted/30'
            }`}
          >
            {bestTier.index === i && i > 0 && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-accent text-white text-[8px] font-semibold px-1.5 py-0.5 rounded-full">
                <Star size={8} /> Best
              </span>
            )}
            <span className="text-[10px] font-medium block">{t.name}</span>
            <span className="text-xs font-mono font-medium block mt-0.5">{t.monthlyFee > 0 ? `$${t.monthlyFee}/mo` : 'Free'}</span>
          </button>
        ))}
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <div className="text-center p-2 sm:p-3 bg-bg-primary rounded-lg border border-border/50">
          <span className="text-[10px] text-text-muted uppercase block mb-1">Current Fees</span>
          <span className="text-sm sm:text-lg font-mono font-bold text-text-primary">{formatFee(currentFees, true)}</span>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight size={16} className="text-text-muted sm:hidden" />
          <ArrowRight size={20} className="text-text-muted hidden sm:block" />
        </div>
        <div className="text-center p-2 sm:p-3 bg-bg-primary rounded-lg border border-border/50">
          <span className="text-[10px] text-text-muted uppercase block mb-1">With {tier.name}</span>
          <span className="text-sm sm:text-lg font-mono font-bold text-accent">{formatFee(totalWithSub, true)}</span>
        </div>
      </div>

      {/* Savings highlight */}
      {savings > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-accent" />
            <span className="text-xs sm:text-sm font-medium text-accent">
              You&apos;d save {formatFee(savings, true)} with {tier.name}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <span className="text-[10px] text-text-muted uppercase block">ROI</span>
              <span className="text-xs font-mono font-semibold text-accent">{roi.toFixed(0)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Monthly Savings</span>
              <span className="text-xs font-mono font-semibold text-accent">${monthlySavings.toFixed(0)}/mo</span>
            </div>
            {breakEvenTrades < Infinity && (
              <div className="flex items-start gap-1">
                <Clock size={10} className="text-text-muted mt-0.5" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase block">Break-even</span>
                  <span className="text-xs font-mono font-semibold text-text-primary">{breakEvenTrades} trades/mo</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly projection */}
      {tier.monthlyFee > 0 && (
        <div className="bg-bg-primary/50 rounded-lg p-3 mb-4 border border-border/30">
          <span className="text-[10px] text-text-muted uppercase block mb-2">Monthly Projection</span>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">Without subscription</span>
            <span className="text-xs font-mono font-medium text-text-primary">${monthlyFees.toFixed(2)}/mo</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-text-secondary">With {tier.name}</span>
            <span className="text-xs font-mono font-medium text-accent">${((totalWithSub) / 3).toFixed(2)}/mo</span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2 pt-4 border-t border-border/50">
        <span className="text-[10px] text-text-muted uppercase">Fee Breakdown</span>
        {[
          { label: 'Maker fees', current: makerFees, discounted: discountedMaker, discount: tier.makerDiscount },
          { label: 'Taker fees', current: takerFees, discounted: discountedTaker, discount: tier.takerDiscount },
          { label: 'Funding fees', current: fundingFees, discounted: fundingFees, discount: 0 },
          { label: 'Subscription cost', current: 0, discounted: subscriptionCost, discount: 0 },
        ].map(({ label, current, discounted, discount }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{label}</span>
            <div className="flex flex-col items-end gap-0.5 sm:flex-row sm:items-center sm:gap-2">
              {discount > 0 && <span className="text-[9px] text-accent">-{(discount * 100).toFixed(0)}%</span>}
              <div className="flex items-center gap-1.5">
                {current > 0 && current !== discounted && (
                  <span className="text-[10px] font-mono text-text-muted line-through">{formatFee(current, true)}</span>
                )}
                <span className="text-xs font-mono font-medium text-text-primary">{formatFee(discounted)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
