import { useState } from 'react';
import { Wallet, TrendingDown, ArrowRight } from 'lucide-react';
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
  { name: 'Elite', monthlyFee: 499, makerDiscount: 0.7, takerDiscount: 0.75 },
];

export function FeeSimulator() {
  const { filteredTrades, metrics } = useStore();
  const [selectedTier, setSelectedTier] = useState(2); // Default to Pro

  const currentFees = metrics.totalFees;
  const tier = TIERS[selectedTier];

  // Calculate savings
  const makerTrades = filteredTrades.filter(t => t.orderType === 'limit');
  const takerTrades = filteredTrades.filter(t => t.orderType !== 'limit');
  const makerFees = makerTrades.reduce((s, t) => s + t.fees.entry + t.fees.exit, 0);
  const takerFees = takerTrades.reduce((s, t) => s + t.fees.entry + t.fees.exit, 0);

  const discountedMaker = makerFees * (1 - tier.makerDiscount);
  const discountedTaker = takerFees * (1 - tier.takerDiscount);
  const fundingFees = filteredTrades.reduce((s, t) => s + Math.abs(t.fees.funding), 0);
  const discountedTotal = discountedMaker + discountedTaker + fundingFees;

  // 90-day period, extrapolate monthly cost
  const monthsInPeriod = 3;
  const subscriptionCost = tier.monthlyFee * monthsInPeriod;
  const totalWithSub = discountedTotal + subscriptionCost;
  const savings = currentFees - totalWithSub;
  const roi = subscriptionCost > 0 ? ((savings / subscriptionCost) * 100) : 0;

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
          <Wallet size={16} className="text-accent" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-text-primary">Deriverse Fee Optimizer</h3>
          <p className="text-xs text-text-muted">Calculate subscription ROI based on your trading</p>
        </div>
      </div>

      {/* Tier selector */}
      <div className="grid grid-cols-4 gap-1.5 mb-5">
        {TIERS.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setSelectedTier(i)}
            className={`py-2 px-2 rounded-lg text-center transition-all border ${
              selectedTier === i
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'bg-bg-primary border-border text-text-muted hover:border-text-muted/30'
            }`}
          >
            <span className="text-[10px] font-medium block">{t.name}</span>
            <span className="text-xs font-mono block mt-0.5">{t.monthlyFee > 0 ? `$${t.monthlyFee}/mo` : 'Free'}</span>
          </button>
        ))}
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center p-3 bg-bg-primary rounded-lg border border-border">
          <span className="text-[10px] text-text-muted uppercase block mb-1">Current Fees</span>
          <span className="text-lg font-mono font-bold text-loss">${currentFees.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight size={20} className="text-text-muted" />
        </div>
        <div className="text-center p-3 bg-bg-primary rounded-lg border border-border">
          <span className="text-[10px] text-text-muted uppercase block mb-1">With {tier.name}</span>
          <span className="text-lg font-mono font-bold text-profit">${totalWithSub.toFixed(2)}</span>
        </div>
      </div>

      {/* Savings highlight */}
      {savings > 0 && (
        <div className="bg-profit/5 border border-profit/20 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={16} className="text-profit" />
            <span className="text-sm font-medium text-profit">
              You&apos;d save ${savings.toFixed(2)} with {tier.name}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary">
              ROI: <span className="font-mono text-profit">{roi.toFixed(0)}%</span> on subscription
            </span>
            <span className="text-xs text-text-muted">
              ({monthsInPeriod}-month period)
            </span>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2 pt-3 border-t border-border/50">
        <span className="text-[10px] text-text-muted uppercase">Fee Breakdown</span>
        {[
          { label: 'Maker fees', current: makerFees, discounted: discountedMaker, discount: tier.makerDiscount },
          { label: 'Taker fees', current: takerFees, discounted: discountedTaker, discount: tier.takerDiscount },
          { label: 'Funding fees', current: fundingFees, discounted: fundingFees, discount: 0 },
          { label: 'Subscription cost', current: 0, discounted: subscriptionCost, discount: 0 },
        ].map(({ label, current, discounted, discount }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{label}</span>
            <div className="flex items-center gap-2">
              {discount > 0 && <span className="text-[10px] text-profit">-{(discount * 100).toFixed(0)}%</span>}
              {current > 0 && current !== discounted && (
                <span className="text-xs font-mono text-text-muted line-through">${current.toFixed(2)}</span>
              )}
              <span className="text-xs font-mono text-text-primary">${discounted.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
