import { PRESETS, formatSpeed } from '../speed-model';

type Props = {
  speed: number;
  onSelect: (value: number) => void;
};

export const PresetGrid = ({ speed, onSelect }: Props) => (
  <div className="grid grid-cols-4 gap-1.5">
    {PRESETS.map((p) => {
      const isActive = speed === p;
      return (
        <button
          key={p}
          onClick={() => onSelect(p)}
          aria-pressed={isActive}
          aria-label={browser.i18n.getMessage('ariaPresetSpeed', formatSpeed(p))}
          className={`
            relative py-2 rounded-lg text-body font-semibold
            transition-all duration-150 ease-out
            focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-1
            active:scale-[0.96]
            ${isActive
              ? 'bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md shadow-sky-500/25 scale-[1.02]'
              : 'bg-white/80 text-slate-500 border border-slate-200/80 hover:bg-sky-50/60 hover:border-sky-200 hover:text-sky-600'
            }
          `}
        >
          {formatSpeed(p)}&times;
          {isActive && (
            <span aria-hidden="true" className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
          )}
        </button>
      );
    })}
  </div>
);
