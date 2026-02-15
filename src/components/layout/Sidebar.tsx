import { BarChart3, BookOpen, PieChart, Wallet, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Page } from '../../data/types';
import { useStore } from '../../store/useStore';

const NAV_ITEMS: { page: Page; label: string; icon: typeof BarChart3 }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { page: 'journal', label: 'Journal', icon: BookOpen },
  { page: 'portfolio', label: 'Portfolio', icon: PieChart },
  { page: 'fees', label: 'Fees', icon: Wallet },
  { page: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentPage, setPage, sidebarCollapsed, toggleSidebar, sidebarOpen, setSidebarOpen } = useStore();

  return (
    <>
      {/* Backdrop — visible only on <lg when sidebarOpen */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-screen bg-bg-secondary border-r border-border flex flex-col z-50',
          // Desktop: static sidebar with collapse
          'lg:translate-x-0 transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'lg:w-16' : 'lg:w-56',
          // Mobile/Tablet: slide-in drawer
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
            <BarChart3 size={18} className="text-accent" />
          </div>
          <div className={`overflow-hidden ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <h1 className="text-sm font-semibold text-text-primary truncate">Deriverse</h1>
            <p className="text-[10px] text-text-muted truncate">Analytics</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => setPage(page)}
                className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary border border-transparent'
                } ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="hidden lg:block px-2 py-3 border-t border-border">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
