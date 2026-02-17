import { User, TrendingUp, TrendingDown, Shield, Clock, Zap } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { generateTraderProfile, type TraderStyle } from '../../engine/traderProfile';

const STYLE_ICONS: Record<TraderStyle, typeof Zap> = {
  scalper: Zap,
  day_trader: Clock,
  swing_trader: TrendingUp,
  position_trader: Shield,
};

const STYLE_LABELS: Record<TraderStyle, string> = {
  scalper: 'Scalper',
  day_trader: 'Day Trader',
  swing_trader: 'Swing Trader',
  position_trader: 'Position Trader',
};

export function TraderProfileCard() {
  const { filteredTrades, metrics } = useStore();
  const profile = generateTraderProfile(filteredTrades, metrics);

  const StyleIcon = STYLE_ICONS[profile.style];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Style card */}
      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-6 shadow-sm shadow-black/20 card-accent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <StyleIcon size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{STYLE_LABELS[profile.style]}</h3>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${profile.styleConfidence * 100}%` }} />
              </div>
              <span className="text-[10px] text-text-muted">{(profile.styleConfidence * 100).toFixed(0)}% confidence</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-text-secondary leading-relaxed">{profile.styleDescription}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-profit" />
            <h4 className="text-xs font-semibold text-text-primary">Strengths</h4>
          </div>
          <div className="space-y-2">
            {profile.strengths.length > 0 ? profile.strengths.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-profit flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-text-secondary">{s}</span>
              </div>
            )) : (
              <p className="text-[10px] text-text-muted italic">Not enough data yet</p>
            )}
          </div>
        </div>
        <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-loss" />
            <h4 className="text-xs font-semibold text-text-primary">Areas to Improve</h4>
          </div>
          <div className="space-y-2">
            {profile.weaknesses.length > 0 ? profile.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-loss flex-shrink-0" />
                <span className="text-[10px] sm:text-xs text-text-secondary">{w}</span>
              </div>
            )) : (
              <p className="text-[10px] text-text-muted italic">Looking good! No major issues detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Optimal Conditions */}
      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20">
        <h4 className="text-xs font-semibold text-text-primary mb-3">Optimal Trading Conditions</h4>
        <div className="grid grid-cols-2 gap-2">
          {profile.optimalConditions.map((c, i) => (
            <div key={i} className="bg-bg-primary/50 rounded-lg p-2.5 border border-border/30">
              <span className="text-[10px] sm:text-xs text-text-secondary">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Patterns */}
      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20">
        <h4 className="text-xs font-semibold text-text-primary mb-3">Behavioral Patterns</h4>
        <div className="space-y-2">
          {profile.patterns.map((p) => (
            <div key={p.id} className="flex items-start gap-2.5 p-2 rounded-lg bg-bg-primary/30">
              <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                p.severity === 'positive' ? 'bg-profit' : p.severity === 'warning' ? 'bg-spot' : 'bg-text-muted'
              }`} />
              <div>
                <span className="text-[10px] sm:text-xs font-medium text-text-primary block">{p.label}</span>
                <span className="text-[10px] text-text-muted">{p.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution */}
      {profile.evolution.length > 0 && (
        <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-4 sm:p-5 shadow-sm shadow-black/20">
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-accent" />
            <h4 className="text-xs font-semibold text-text-primary">Style Evolution</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {profile.evolution.map((e, i) => (
              <div key={i} className="text-center p-2.5 bg-bg-primary/50 rounded-lg border border-border/30">
                <span className="text-[10px] text-text-muted block mb-1">{e.period}</span>
                <span className="text-[10px] sm:text-xs font-medium text-text-primary block">{STYLE_LABELS[e.style]}</span>
                <span className={`text-[10px] font-mono ${e.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {e.pnl >= 0 ? '+' : ''}${e.pnl.toFixed(0)}
                </span>
                <span className="text-[10px] text-text-muted block">{e.winRate.toFixed(0)}% WR</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
