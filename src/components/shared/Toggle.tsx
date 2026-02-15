interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ enabled, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="flex items-center justify-between gap-3 w-full group"
    >
      {(label || description) && (
        <div className="text-left">
          {label && <span className="text-xs font-medium text-text-primary block">{label}</span>}
          {description && <span className="text-[10px] text-text-muted block mt-0.5">{description}</span>}
        </div>
      )}
      <div
        className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${
          enabled ? 'bg-accent' : 'bg-bg-tertiary border border-border/50'
        }`}
      >
        <div
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ${
            enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'
          }`}
        />
      </div>
    </button>
  );
}
