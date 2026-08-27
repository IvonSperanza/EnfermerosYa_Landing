import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import ClientSidebar from './ClientSidebar';
import ClientTopbar from './ClientTopbar';

const COLLAPSE_KEY = 'ey_client_sidebar_collapsed_v1';

export default function ClientLayout({ children }) {
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(COLLAPSE_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      window.localStorage.setItem(COLLAPSE_KEY, current ? '0' : '1');
      return !current;
    });
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-slate-50">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-action focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Saltar al contenido
      </a>
      <ClientSidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('flex min-h-screen flex-col transition-all duration-300', collapsed ? 'lg:pl-20' : 'lg:pl-72')}>
        <ClientTopbar onOpenMobileMenu={() => setMobileOpen(true)} />
        <main id="portal-main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
