import { useState } from 'react';
import { ChevronDown, ChevronUp, Brain, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { generateInsights, type SmartInsight } from '../../engine/insightGenerator';

const SENTIMENT_CONFIG: Record<SmartInsight['sentiment'], { border: string; icon: typeof TrendingUp; iconColor: string }> = {
  positive: { border: 'border-l-profit', icon: TrendingUp, iconColor: 'text-profit' },
  negative: { border: 'border-l-loss', icon: TrendingDown, iconColor: 'text-loss' },
  warning: { border: 'border-l-spot', icon: AlertTriangle, iconColor: 'text-spot' },
  neutral: { border: 'border-l-accent', icon: Lightbulb, iconColor: 'text-accent' },
};

export function SmartInsights() {
  const [expanded, setExpanded] = useState(true);
  const { filteredTrades, metrics, portfolio } = useStore();

  const insights = generateInsights(filteredTrades, metrics, portfolio);

  if (insights.length === 0) return null;

  return (
    <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl shadow-sm shadow-black/20 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-bg-tertiary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-accent" />
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary">Smart Insights</h3>
          <span className="text-[10px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded-full">
            {insights.length}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-2">
              {insights.map((insight) => {
                const { border, icon: Icon, iconColor } = SENTIMENT_CONFIG[insight.sentiment];
                return (
                  <div
                    key={insight.id}
                    className={`border-l-2 ${border} bg-bg-primary/50 rounded-r-lg p-3`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon size={13} className={`${iconColor} mt-0.5 flex-shrink-0`} />
                      <div>
                        <h4 className="text-[11px] font-medium text-text-primary mb-0.5">{insight.title}</h4>
                        <p className="text-[10px] text-text-muted leading-relaxed">{insight.body}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
