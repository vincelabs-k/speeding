import { formatSpeed } from '../speed-model';

type Props = { speed: number };

export const SpeedBadge = ({ speed }: Props) => (
  <div className="flex-shrink-0 w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-brand-50 via-white to-brand-100 border border-brand-100/60 flex flex-col items-center justify-center shadow-lg shadow-brand-500/5">
    <span className="text-display font-bold leading-none bg-gradient-to-br from-brand-600 to-brand-400 bg-clip-text text-transparent">
      {formatSpeed(speed)}
    </span>
    <span className="text-micro text-slate-400 font-semibold mt-0.5 tracking-wide uppercase">
      {browser.i18n.getMessage('speedLabel')}
    </span>
  </div>
);
