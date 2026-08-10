import { useEffect, useState } from 'react';
import { isQualifiedUser } from '../utils/stats';
import { getStoreUrl } from '../utils/constants';

export const RatingButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    isQualifiedUser().then(setVisible);
  }, []);

  if (!visible) return null;

  const handleClick = () => {
    browser.tabs.create({ url: getStoreUrl() });
  };

  return (
    <div className="flex justify-center mt-3">
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                   bg-white/80 border border-slate-200 text-slate-500 text-xs
                   hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600
                   transition-colors duration-200"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <span>{browser.i18n.getMessage('rateOnStore')}</span>
      </button>
    </div>
  );
};
