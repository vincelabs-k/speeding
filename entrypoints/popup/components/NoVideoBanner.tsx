/** Example site opened by the no-video banner CTA. */
const SAMPLE_VIDEO_URL = 'https://www.youtube.com/';

/** Prominent banner shown when no video is detected on the current page. */
export const NoVideoBanner = () => {
  const handleOpen = () => {
    browser.tabs.create({ url: SAMPLE_VIDEO_URL });
  };

  return (
    <div className="px-5 pb-3">
      <div className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 text-white shadow-md shadow-brand-500/20">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 text-white/90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <p className="text-body font-semibold">{browser.i18n.getMessage('noVideo')}</p>
        </div>
        <p className="text-hint text-white/80 mt-1">{browser.i18n.getMessage('noVideoHint')}</p>
        <button
          onClick={handleOpen}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-caption font-semibold text-brand-600 shadow-sm transition-all duration-150 hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 active:scale-[0.97]"
        >
          <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
          {browser.i18n.getMessage('noVideoCta')}
        </button>
      </div>
    </div>
  );
};
