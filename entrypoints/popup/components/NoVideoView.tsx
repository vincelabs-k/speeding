export const NoVideoView = () => (
  <div className="w-[360px] bg-white">
    <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white min-h-[360px] flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
        <svg aria-hidden="true" className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
        </svg>
      </div>
      <p className="text-sm text-slate-400 font-medium">{browser.i18n.getMessage('noVideo')}</p>
      <p className="text-hint text-slate-300">{browser.i18n.getMessage('noVideoHint')}</p>
    </div>
  </div>
);
