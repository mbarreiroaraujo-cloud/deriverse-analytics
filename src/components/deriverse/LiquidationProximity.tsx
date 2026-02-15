import { AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export function LiquidationProximity() {
  const { portfolio } = useStore();

  const leveragedPositions = portfolio.positions.filter(p => p.leverage > 1 && p.liquidationPrice > 0);

  return (
    <div className="bg-bg-secondary border border-border rounded-xl p-5 card-hover">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-spot" />
        <div>
          <h3 className="text-sm font-medium text-text-primary">Liquidation Proximity</h3>
          <p className="text-xs text-text-muted">Distance to liquidation for leveraged positions</p>
        </div>
      </div>

      {leveragedPositions.length === 0 ? (
        <p className="text-xs text-text-muted italic">No leveraged positions open</p>
      ) : (
        <div className="space-y-4">
          {leveragedPositions.map((pos, i) => {
            const distance = pos.side === 'long'
              ? ((pos.currentPrice - pos.liquidationPrice) / pos.currentPrice) * 100
              : ((pos.liquidationPrice - pos.currentPrice) / pos.currentPrice) * 100;

            const getColor = (d: number) => {
              if (d > 30) return { bar: 'bg-profit', text: 'text-profit', status: 'Safe' };
              if (d > 15) return { bar: 'bg-spot', text: 'text-spot', status: 'Moderate' };
              if (d > 5) return { bar: 'bg-loss/70', text: 'text-loss', status: 'Warning' };
              return { bar: 'bg-loss', text: 'text-loss', status: 'Danger' };
            };

            const { bar, text, status } = getColor(distance);

            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${pos.side === 'long' ? 'text-profit' : 'text-loss'}`}>
                      {pos.side === 'long' ? 'L' : 'S'}
                    </span>
                    <span className="text-xs font-mono text-text-primary">{pos.symbol}</span>
                    <span className="text-[10px] text-text-muted">{pos.leverage}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${text} bg-bg-tertiary`}>{status}</span>
                    <span className={`text-xs font-mono ${text}`}>{distance.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${bar}`}
                    style={{ width: `${Math.min(distance, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] font-mono text-text-muted">
                    Liq: ${pos.liquidationPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    Current: ${pos.currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
