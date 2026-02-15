import { Download } from 'lucide-react';
import type { Trade } from '../../data/types';
import { format } from 'date-fns';

interface ExportButtonProps {
  trades: Trade[];
  filename?: string;
}

export function ExportButton({ trades, filename = 'deriverse-trades' }: ExportButtonProps) {
  const exportCSV = () => {
    const headers = [
      'ID', 'Date', 'Close Date', 'Instrument', 'Symbol', 'Side',
      'Entry Price', 'Exit Price', 'Size', 'Leverage', 'PnL',
      'Entry Fee', 'Exit Fee', 'Funding Fee', 'Total Fees', 'Order Type',
      'Emotion', 'Setup', 'Grade', 'Pre-Trade Note', 'Post-Trade Note',
    ];

    const rows = trades.map(t => [
      t.id,
      format(new Date(t.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      format(new Date(t.closeTimestamp), 'yyyy-MM-dd HH:mm:ss'),
      t.instrument,
      t.symbol,
      t.side,
      t.entryPrice,
      t.exitPrice,
      t.size,
      t.leverage,
      t.pnl,
      t.fees.entry,
      t.fees.exit,
      t.fees.funding,
      t.fees.total,
      t.orderType,
      t.journal?.emotion || '',
      t.journal?.setup || '',
      t.journal?.grade || '',
      t.journal?.preTradeNote || '',
      t.journal?.postTradeNote || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => typeof val === 'string' && val.includes(',') ? `"${val}"` : val).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}-${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <button
      onClick={exportCSV}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-bg-secondary border border-border rounded-md hover:border-accent/30 hover:text-text-primary transition-colors"
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}
