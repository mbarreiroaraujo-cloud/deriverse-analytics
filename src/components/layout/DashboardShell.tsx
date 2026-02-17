import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useStore } from '../../store/useStore';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { sidebarCollapsed } = useStore();

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden">
      <Sidebar />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'
        }`}
      >
        <Header />
        <main className="flex-1 px-4 py-4 sm:px-5 lg:px-6 pb-8 lg:py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
