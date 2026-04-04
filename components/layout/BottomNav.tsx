'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBetsContext } from '@/providers/BetsProvider';

export default function BottomNav() {
  const pathname  = usePathname();
  const { openForm } = useBetsContext();

  const tabs = [
    { href: '/',     icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/bets', icon: List,            label: 'Scommesse' },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 h-16">
        {/* Left tab */}
        <NavTab href={tabs[0].href} icon={tabs[0].icon} label={tabs[0].label} active={pathname === tabs[0].href} />

        {/* Central FAB */}
        <button
          onClick={() => openForm()}
          aria-label="Aggiungi scommessa"
          className={cn(
            'flex flex-col items-center justify-center w-14 h-14 rounded-2xl',
            'bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-900/40',
            'transition-all duration-150 active:scale-90 -mt-5',
          )}
        >
          <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
        </button>

        {/* Right tab */}
        <NavTab href={tabs[1].href} icon={tabs[1].icon} label={tabs[1].label} active={pathname === tabs[1].href} />
      </div>
    </nav>
  );
}

function NavTab({ href, icon: Icon, label, active }: {
  href: string; icon: React.FC<React.SVGProps<SVGSVGElement> & { strokeWidth?: number }>; label: string; active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-5 py-2 group">
      <Icon
        className={cn(
          'w-5 h-5 transition-colors duration-150',
          active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300',
        )}
        strokeWidth={active ? 2.5 : 2}
      />
      <span className={cn(
        'text-[10px] font-medium transition-colors duration-150',
        active ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300',
      )}>
        {label}
      </span>
    </Link>
  );
}
