import { formatSpeed } from '../speed-model';

type Props = { speed: number };

export const SpeedBadge = ({ speed }: Props) => (
  <div className="flex-shrink-0 w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-sky-50 via-white to-cyan-50 border border-sky-100/60 flex flex-col items-center justify-center shadow-lg shadow-sky-500/5">
    <span className="text-display font-bold leading-none bg-gradient-to-br from-sky-600 to-cyan-600 bg-clip-text text-transparent">
      {formatSpeed(speed)}
    </span>
    <span className="text-micro text-slate-400 font-semibold mt-0.5 tracking-wide uppercase">
      {browser.i18n.getMessage('speedLabel')}
    </span>
  </div>
);
