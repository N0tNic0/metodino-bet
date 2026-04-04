'use client';

import { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export default function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60 pt-safe">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        <div className="flex flex-col">
          <h1 className="text-base font-bold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 leading-tight">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
