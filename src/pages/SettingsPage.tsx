import { useStore, type ExperienceLevel } from '../store/useStore';
import { Toggle } from '../components/shared/Toggle';
import { useWallet } from '@solana/wallet-adapter-react';

const LEVELS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: 'essential', label: 'Essential', desc: 'Clean metrics only. No tooltips or smart insights.' },
  { value: 'standard', label: 'Standard', desc: 'Tooltips, insights, and trader profile enabled.' },
  { value: 'advanced', label: 'Advanced', desc: 'Everything on. Full contextual education.' },
];

export function SettingsPage() {
  const { allTrades, experience, setExperienceLevel, setExperienceToggle } = useStore();
  const { connected, publicKey } = useWallet();

  return (
    <div className="max-w-2xl space-y-8 animate-fade-in px-1 sm:px-0">
      {/* Dashboard Experience */}
      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Dashboard Experience</h3>
        <p className="text-[10px] sm:text-xs text-text-muted mb-5">Choose how much context and education you want to see.</p>

        {/* Preset pills */}
        <div className="flex gap-2 mb-5">
          {LEVELS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setExperienceLevel(value)}
              className={`flex-1 p-3 rounded-lg text-center transition-all border ${
                experience.level === value
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-bg-primary border-border/50 text-text-muted hover:border-text-muted/30'
              }`}
            >
              <span className="text-xs font-medium block">{label}</span>
              <span className="text-[10px] text-text-muted block mt-0.5">{desc}</span>
            </button>
          ))}
        </div>

        {/* Individual toggles */}
        <div className="space-y-4 pt-4 border-t border-border/50">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Individual Controls</span>
          <Toggle
            label="Insight Tooltips"
            description="Hover/tap on metrics for explanations and benchmarks"
            enabled={experience.showInsightTooltips}
            onChange={(v) => setExperienceToggle('showInsightTooltips', v)}
          />
          <Toggle
            label="Smart Insights"
            description="Automated trading observations on the dashboard"
            enabled={experience.showSmartInsights}
            onChange={(v) => setExperienceToggle('showSmartInsights', v)}
          />
          <Toggle
            label="Savings Banner"
            description="Fee savings notification on the dashboard"
            enabled={experience.showSavingsBanner}
            onChange={(v) => setExperienceToggle('showSavingsBanner', v)}
          />
          <Toggle
            label="Trader Profile"
            description="Behavioral analysis and style detection tab"
            enabled={experience.showTraderProfile}
            onChange={(v) => setExperienceToggle('showTraderProfile', v)}
          />
          <Toggle
            label="Education Mode"
            description="Show contextual learning content throughout the app"
            enabled={experience.showEducation}
            onChange={(v) => setExperienceToggle('showEducation', v)}
          />
        </div>
      </div>

      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary mb-5">Data Summary</h3>
        <div className="space-y-2">
          {[
            { label: 'Total Trades', value: allTrades.length.toString() },
            { label: 'Date Range', value: `${new Date(allTrades[0]?.timestamp).toLocaleDateString()} - ${new Date(allTrades[allTrades.length - 1]?.timestamp).toLocaleDateString()}` },
            { label: 'Unique Symbols', value: new Set(allTrades.map(t => t.symbol)).size.toString() },
            { label: 'Instruments', value: [...new Set(allTrades.map(t => t.instrument))].join(', ') },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-text-muted">{label}</span>
              <span className="text-xs font-mono text-text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary mb-5">About</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Built for the Deriverse ecosystem on Solana. Designed to complement the Deriverse trading experience with institutional-grade analytics.
          Features include Sharpe Ratio, Sortino Ratio, Profit Factor, and Expectancy calculations,
          along with an intelligent trade journal and Deriverse-specific fee optimization tools.
        </p>
        <p className="text-xs text-text-muted mt-3">
          Currently running with simulated data. Connect to Deriverse SDK when available for live portfolio tracking.
        </p>
      </div>

      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary mb-5">Data Source</h3>
        <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg border border-border/50">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div>
            <span className="text-xs font-medium text-text-primary">Mock Data (Demo Mode)</span>
            <p className="text-[10px] text-text-muted mt-0.5">
              Using realistic simulated trading data with {allTrades.length} trades across 90 days
            </p>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-bg-secondary/80 border border-border/50 rounded-2xl p-6 shadow-sm shadow-black/20">
        <h3 className="text-sm font-semibold text-text-primary mb-5">Network Status</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-bg-primary rounded-lg border border-border/50">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <div>
              <span className="text-xs font-medium text-text-primary">Connected to Solana Devnet</span>
              <p className="text-[10px] text-text-muted mt-0.5">
                RPC: https://api.devnet.solana.com
              </p>
            </div>
          </div>
          {connected && publicKey && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">Wallet</span>
              <span className="text-xs font-mono text-text-secondary">{publicKey.toBase58()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
