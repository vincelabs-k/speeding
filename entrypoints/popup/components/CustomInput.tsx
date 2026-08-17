type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onApply: () => void;
};

export const CustomInput = ({ value, onValueChange, onApply }: Props) => (
  <div className="flex gap-2">
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        onBlur={onApply}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onApply();
        }}
        placeholder={browser.i18n.getMessage('speedPlaceholder')}
        aria-label={browser.i18n.getMessage('ariaCustomSpeed')}
        className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-3 pr-7 text-body font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/15 transition-all"
      />
      <span aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-slate-400 font-medium pointer-events-none select-none">
        &times;
      </span>
    </div>
    <button
      onClick={onApply}
      aria-label={browser.i18n.getMessage('ariaApplyCustom')}
      className="h-9 px-5 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 text-white text-body font-semibold hover:from-sky-600 hover:to-sky-700 active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-1 shadow-md shadow-sky-500/20"
    >
      {browser.i18n.getMessage('apply')}
    </button>
  </div>
);
