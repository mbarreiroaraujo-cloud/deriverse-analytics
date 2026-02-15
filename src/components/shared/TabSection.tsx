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
      {/* Tab bar */}
      <div className="flex gap-2 overflow-x-auto px-1 py-3 scrollbar-hide sticky top-14 z-20 bg-bg-primary">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap min-h-[36px] transition-colors ${
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
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeContent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
