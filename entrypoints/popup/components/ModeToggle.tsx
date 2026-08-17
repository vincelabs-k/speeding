import type { SpeedMode } from '../speed-model';

type Props = {
  mode: SpeedMode;
  domain: string;
  onModeChange: (mode: SpeedMode) => void;
};

export const ModeToggle = ({ mode, domain, onModeChange }: Props) => {
  const renderButton = (target: SpeedMode, labelKey: 'thisSite' | 'allSites', iconPath: string) => {
    const isActive = mode === target;
    return (
      <button
        onClick={() => onModeChange(target)}
        aria-pressed={isActive}
        className={`
          flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-caption font-semibold
          transition-all duration-150 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-1
          active:scale-[0.97]
          ${isActive
            ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/20'
            : 'text-slate-500 hover:bg-sky-50/60 hover:text-sky-600'
          }
        `}
      >
        <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
        {browser.i18n.getMessage(labelKey)}
      </button>
    );
  };

  return (
    <div>
      <div className="flex gap-1 p-0.5 bg-slate-100/80 rounded-lg border border-slate-200/60">
        {renderButton(
          'this',
          'thisSite',
          'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
        )}
        {renderButton(
          'all',
          'allSites',
          'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
        )}
      </div>
      {mode === 'this' && domain && (
        <p className="text-micro text-slate-400 mt-1.5 text-center font-medium truncate">{domain}</p>
      )}
    </div>
  );
};
