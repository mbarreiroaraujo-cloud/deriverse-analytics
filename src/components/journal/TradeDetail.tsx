import { format } from 'date-fns';
import type { Trade } from '../../data/types';
import { EmotionTagger } from './EmotionTagger';
import { SetupClassifier } from './SetupClassifier';
import { TradeGrader } from './TradeGrader';

interface TradeDetailProps {
  trade: Trade;
}

export function TradeDetail({ trade }: TradeDetailProps) {
  const duration = trade.closeTimestamp - trade.timestamp;
  const hours = Math.floor(duration / 3600000);
  const mins = Math.floor((duration % 3600000) / 60000);
  const durationStr = hours >= 24
    ? `${Math.floor(hours / 24)}d ${hours % 24}h`
    : `${hours}h ${mins}m`;

  const priceChange = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice * 100);

  return (
    <div className="bg-bg-tertiary/50 border-t border-border px-6 py-4 animate-fade-in">
      <div className="grid grid-cols-4 gap-6">
        {/* Trade Details */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Trade Details</h4>
          {[
            { label: 'Entry', value: `$${trade.entryPrice.toFixed(4)}` },
            { label: 'Exit', value: `$${trade.exitPrice.toFixed(4)}` },
            { label: 'Change', value: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`, color: priceChange >= 0 ? 'text-profit' : 'text-loss' },
            { label: 'Size', value: trade.size.toFixed(4) },
            { label: 'Duration', value: durationStr },
            { label: 'Opened', value: format(new Date(trade.timestamp), 'MMM dd yyyy, HH:mm') },
            { label: 'Closed', value: format(new Date(trade.closeTimestamp), 'MMM dd yyyy, HH:mm') },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{label}</span>
              <span className={`text-xs font-mono ${color || 'text-text-primary'}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* Fees Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Fees</h4>
          {[
            { label: 'Entry Fee', value: trade.fees.entry },
            { label: 'Exit Fee', value: trade.fees.exit },
            { label: 'Funding', value: trade.fees.funding },
            { label: 'Total', value: trade.fees.total, bold: true },
          ].map(({ label, value, bold }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{label}</span>
              <span className={`text-xs font-mono text-text-primary ${bold ? 'font-medium' : ''}`}>
                ${Math.abs(value).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Net PnL</span>
              <span className={`text-xs font-mono font-medium ${(trade.pnl - trade.fees.total) >= 0 ? 'text-profit' : 'text-loss'}`}>
                {(trade.pnl - trade.fees.total) >= 0 ? '+' : ''}${(trade.pnl - trade.fees.total).toFixed(2)}
              </span>
            </div>
          </div>

          {trade.optionsData && (
            <>
              <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mt-4 mb-2">Greeks</h4>
              {Object.entries(trade.optionsData.greeks).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted capitalize">{key}</span>
                  <span className="text-xs font-mono text-text-primary">{val.toFixed(4)}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Journal Tags */}
        <div>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Journal</h4>
          <div className="space-y-3">
            <EmotionTagger tradeId={trade.id} current={trade.journal?.emotion} />
            <SetupClassifier tradeId={trade.id} current={trade.journal?.setup} />
            <TradeGrader tradeId={trade.id} current={trade.journal?.grade} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">Notes</h4>
          {trade.journal?.preTradeNote && (
            <div className="mb-3">
              <span className="text-[10px] text-text-muted uppercase block mb-1">Pre-Trade</span>
              <p className="text-xs text-text-secondary bg-bg-primary rounded p-2 border border-border/50">
                {trade.journal.preTradeNote}
              </p>
            </div>
          )}
          {trade.journal?.postTradeNote && (
            <div>
              <span className="text-[10px] text-text-muted uppercase block mb-1">Post-Trade</span>
              <p className="text-xs text-text-secondary bg-bg-primary rounded p-2 border border-border/50">
                {trade.journal.postTradeNote}
              </p>
            </div>
          )}
          {!trade.journal?.preTradeNote && !trade.journal?.postTradeNote && (
            <p className="text-xs text-text-muted italic">No notes for this trade</p>
          )}
        </div>
      </div>
    </div>
  );
}
