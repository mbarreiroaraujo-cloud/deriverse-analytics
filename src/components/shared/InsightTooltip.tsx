import { useState, useRef, useEffect, type ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMetricInsight, getBenchmarkPosition, type TradeContext } from '../../engine/insightEngine';
import { useStore } from '../../store/useStore';

interface InsightTooltipProps {
  metric: string;
  value: number;
  children: ReactNode;
}

export function InsightTooltip({ metric, value, children }: InsightTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { filteredTrades, metrics, portfolio } = useStore();

  const insight = getMetricInsight(metric);

  // Close on outside click (mobile) — must be before early return to satisfy rules-of-hooks
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  if (!insight) return <>{children}</>;

  const ctx: TradeContext = { trades: filteredTrades, metrics, portfolio };
  const benchmark = getBenchmarkPosition(value, insight.benchmarks);
  const personalInsight = insight.getPersonalInsight(value, ctx);
  const actionable = insight.getActionable(value, ctx);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 320 ? 'top' : 'bottom');
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      updatePosition();
      setOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setOpen(false);
  };

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setOpen(prev => !prev);
  };

  return (
    <div className="relative inline-flex items-center gap-1" ref={triggerRef}>
      {children}
      <button
        className="text-text-muted/40 hover:text-text-muted/70 transition-colors flex-shrink-0 hidden sm:block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`Info about ${insight.title}`}
      >
        <HelpCircle size={12} />
      </button>
      <button
        className="text-text-muted/40 active:text-text-muted/70 transition-colors flex-shrink-0 sm:hidden"
        onClick={handleTap}
        aria-label={`Info about ${insight.title}`}
      >
        <HelpCircle size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[60] left-0 ${
              position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2'
            } w-[280px] sm:w-[320px] bg-bg-primary border border-border/70 rounded-xl p-4 shadow-xl`}
            onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Title */}
            <h4 className="text-xs font-semibold text-text-primary mb-1">{insight.title}</h4>
            <p className="text-[10px] text-text-muted leading-relaxed mb-3">{insight.definition}</p>

            {/* Benchmark bar */}
            {insight.benchmarks.length > 1 && (
              <div className="mb-3">
                <div className="flex h-2 rounded-full overflow-hidden mb-1">
                  {insight.benchmarks.map((b, i) => (
                    <div
                      key={i}
                      className="flex-1 first:rounded-l-full last:rounded-r-full"
                      style={{ backgroundColor: b.color + '40' }}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {insight.benchmarks.map((b, i) => (
                    <span key={i} className="text-[9px] text-text-muted">{b.label}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: benchmark.color }} />
                  <span className="text-[10px] font-medium" style={{ color: benchmark.color }}>
                    You: {benchmark.label}
                  </span>
                </div>
              </div>
            )}

            {/* Personal insight */}
            <div className="bg-bg-secondary/60 rounded-lg p-2.5 mb-2">
              <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">Your Data</span>
              <p className="text-[10px] text-text-secondary leading-relaxed">{personalInsight}</p>
            </div>

            {/* Actionable */}
            <div className="bg-accent/5 border border-accent/10 rounded-lg p-2.5">
              <span className="text-[9px] text-accent uppercase tracking-wider block mb-1">Action</span>
              <p className="text-[10px] text-text-secondary leading-relaxed">{actionable}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
