import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export const SectionLabel = ({ children }: Props) => (
  <p className="text-micro text-slate-400 uppercase tracking-wider mb-2 px-1 font-semibold">{children}</p>
);
