import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { Info } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col lg:flex-row text-surface-900">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar onOpenMobileMenu={() => setIsDrawerOpen(true)} />

        {/* Subtle Demonstration Banner */}
        <div className="bg-brand-50/60 border-b border-brand-200/50 px-4 py-1.5 text-[11px] text-brand-900 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Info className="w-3.5 h-3.5 text-brand-700 flex-shrink-0" />
            <span className="font-medium truncate">
              HostelHub Demonstration Environment — Live MongoDB persistence enabled
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-brand-700/80 uppercase font-mono">
            Build v1.0
          </span>
        </div>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation (Bottom bar & slide-in drawer) */}
      <MobileNav
        isDrawerOpen={isDrawerOpen}
        onCloseDrawer={() => setIsDrawerOpen(false)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />
    </div>
  );
};
