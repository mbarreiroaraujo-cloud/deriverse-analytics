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
    <div className="flex sm:block">
      {/* Vertical tab column — mobile only */}
      <div className="flex flex-col gap-1 w-[72px] shrink-0 border-r border-border/30 bg-bg-secondary/50 pt-2 sm:hidden">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2 py-3 text-[10px] font-medium text-center transition-all ${
              activeTab === tab.id
                ? 'border-l-2 border-accent bg-accent/10 text-accent'
                : 'border-l-2 border-transparent text-text-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Horizontal pills — desktop only */}
      <div className="hidden sm:flex gap-2 overflow-x-auto px-1 py-3 scrollbar-hide sticky top-14 z-20 bg-bg-primary">
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
      <div className="flex-1 min-w-0 sm:w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pl-3 sm:pl-0"
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
