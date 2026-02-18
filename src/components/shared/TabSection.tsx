import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabSectionProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function TabSection({ tabs, defaultTab }: TabSectionProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  const activeContent = tabs.find(t => t.id === activeTab)?.content;

  return (
    <div>
      {/* Horizontal pills — all screen sizes */}
      <div className="flex gap-1.5 sm:gap-2 overflow-x-auto px-0 py-3 scrollbar-hide bg-bg-primary">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap min-h-[32px] sm:min-h-[36px] transition-colors ${
              activeTab === tab.id
                ? 'bg-accent/15 text-accent font-semibold'
                : 'bg-bg-tertiary/60 text-text-muted hover:text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
