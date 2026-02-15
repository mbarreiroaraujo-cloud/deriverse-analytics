import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardShell } from './components/layout/DashboardShell';
import { DashboardPage } from './pages/DashboardPage';
import { JournalPage } from './pages/JournalPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { FeesPage } from './pages/FeesPage';
import { SettingsPage } from './pages/SettingsPage';
import { useStore } from './store/useStore';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function App() {
  const { currentPage, initialize } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'journal': return <JournalPage />;
      case 'portfolio': return <PortfolioPage />;
      case 'fees': return <FeesPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <DashboardShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </DashboardShell>
  );
}

export default App;
