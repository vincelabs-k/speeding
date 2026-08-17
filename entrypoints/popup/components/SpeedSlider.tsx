import { SLIDER_LABELS, formatSpeed, speedToLogPct } from '../speed-model';

type Props = {
  speed: number;
  dragPct: number;
  onDrag: (pct: number) => void;
  onCommit: () => void;
};

export const SpeedSlider = ({ speed, dragPct, onDrag, onCommit }: Props) => (
  <div className="px-5 pb-3">
    {/* Labels */}
    <div className="relative h-5 mb-1">
      {SLIDER_LABELS.map((item, idx) => {
        const pct = speedToLogPct(item.value);
        const isFirst = idx === 0;
        const isLast = idx === SLIDER_LABELS.length - 1;
        const style = isFirst
          ? { left: '0%' }
          : isLast
            ? { left: '100%', transform: 'translateX(-100%)' }
            : { left: `${pct}%`, transform: 'translateX(-50%)' };
        return (
          <span key={item.label} className="absolute text-micro text-slate-400 font-medium" style={style}>
            {item.label}
          </span>
        );
      })}
    </div>

    {/* Slider track + progress */}
    <div className="relative h-7 flex items-center">
      <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
      <div
        className="absolute h-1.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
        style={{ width: `${dragPct}%` }}
      />
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(dragPct)}
        onChange={(e) => onDrag(parseFloat(e.target.value))}
        onMouseUp={onCommit}
        onTouchEnd={onCommit}
        aria-label={browser.i18n.getMessage('ariaSlider')}
        aria-valuetext={`${formatSpeed(speed)}×`}
        className="speed-slider relative w-full h-full cursor-pointer focus:outline-none"
      />
    </div>

    {/* Hint */}
    <div className="text-center mt-1.5">
      <span className="text-hint text-slate-400 font-medium">
        {browser.i18n.getMessage('dragToAdjust', formatSpeed(speed))}
      </span>
    </div>
  </div>
);
