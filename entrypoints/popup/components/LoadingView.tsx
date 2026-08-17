export const LoadingView = () => (
  <div className="w-[360px] bg-white">
    <div
      role="status"
      aria-label={browser.i18n.getMessage('ariaLoading')}
      aria-busy="true"
      className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white min-h-[360px] flex items-center justify-center"
    >
      <div className="relative w-7 h-7" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 border-t-brand-500 animate-spin" />
      </div>
    </div>
  </div>
);
