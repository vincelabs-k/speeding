import { useState, useCallback, useEffect, useRef } from 'react';

const PRESETS = [0.5, 1, 1.5, 2, 3, 4, 8, 16];
const MIN_SPEED = 0.5;
const MAX_SPEED = 16;
const STEP = 0.25;

// Log-scale math constants
const LOG_MIN = Math.log(MIN_SPEED);
const LOG_MAX = Math.log(MAX_SPEED);
const LOG_RANGE = LOG_MAX - LOG_MIN;

const SLIDER_LABELS = [
  { label: '0.5', value: 0.5 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '8', value: 8 },
  { label: '16', value: 16 },
];

const clamp = (v: number) => Math.max(MIN_SPEED, Math.min(MAX_SPEED, v));
const formatSpeed = (v: number) => {
  const rounded = Math.round(v * 100) / 100;
  return parseFloat(rounded.toFixed(2)).toString();
};

const speedToLogPct = (s: number) => ((Math.log(s) - LOG_MIN) / LOG_RANGE) * 100;
const logPctToSpeed = (p: number) => Math.exp(LOG_MIN + (p / 100) * LOG_RANGE);

type VideoInfo = { speed: number; videoCount: number };
type LoadingState = 'loading' | 'loaded' | 'no-video';

function App() {
  const [speed, setSpeed] = useState(1);
  const [videoCount, setVideoCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadingState>('loading');
  const [customInput, setCustomInput] = useState('1');
  const [sliderDragPct, setSliderDragPct] = useState(speedToLogPct(1));
  const initialized = useRef(false);

  const sendMessage = useCallback(async (type: 'GET_SPEED' | 'SET_SPEED', speedVal?: number) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const payload = speedVal !== undefined
      ? ({ type, speed: speedVal } as const)
      : ({ type } as const);

    const response = await browser.tabs.sendMessage(tab.id, payload);
    return response as VideoInfo | { success: boolean; speed: number } | undefined;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    sendMessage('GET_SPEED').then((res) => {
      if (res && 'speed' in res && typeof res.speed === 'number') {
        const info = res as VideoInfo;
        setSpeed(info.speed);
        setVideoCount(info.videoCount);
        setCustomInput(formatSpeed(info.speed));
        setSliderDragPct(speedToLogPct(info.speed));
        setLoadState(info.videoCount > 0 ? 'loaded' : 'no-video');
      } else {
        setLoadState('no-video');
      }
    }).catch(() => {
      setLoadState('no-video');
    });
  }, [sendMessage]);

  const applySpeed = useCallback((val: number) => {
    const clamped = clamp(val);
    setSpeed(clamped);
    setCustomInput(formatSpeed(clamped));
    setSliderDragPct(speedToLogPct(clamped));
    sendMessage('SET_SPEED', clamped);
  }, [sendMessage]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    setSliderDragPct(pct);
    const raw = logPctToSpeed(pct);
    setSpeed(raw);
    setCustomInput(formatSpeed(raw));
  }, []);

  const handleSliderCommit = useCallback(() => {
    const raw = logPctToSpeed(sliderDragPct);
    const snapped = Math.round(raw / STEP) * STEP;
    applySpeed(snapped);
  }, [sliderDragPct, applySpeed]);

  const handleCustomInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomInput(e.target.value);
  }, []);

  const handleCustomApply = useCallback(() => {
    const val = parseFloat(customInput);
    if (isNaN(val)) {
      setCustomInput(formatSpeed(speed));
      return;
    }
    applySpeed(val);
  }, [customInput, speed, applySpeed]);

  const handleCustomKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomApply();
    }
  }, [handleCustomApply]);

  // ── Loading ──
  if (loadState === 'loading') {
    return (
      <div className="w-80 p-[3px] bg-slate-100">
        <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white min-h-[360px] flex items-center justify-center">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-200 border-t-indigo-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // ── No video ──
  if (loadState === 'no-video') {
    return (
      <div className="w-80 p-[3px] bg-slate-100">
        <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white min-h-[360px] flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">No video detected</p>
          <p className="text-[11px] text-slate-300">Open a page with video to get started</p>
        </div>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className="w-80 p-[3px] bg-slate-100">
    <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white text-slate-800 select-none overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Speeding
          </h1>
          <p className="text-[12px] text-slate-400 mt-0.5 font-medium">
            {videoCount} video{videoCount !== 1 ? 's' : ''} detected
          </p>
        </div>
        {/* Speed badge */}
        <div className="flex-shrink-0 w-[68px] h-[68px] rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100/60 flex flex-col items-center justify-center shadow-lg shadow-indigo-500/5">
          <span className="text-[28px] font-bold leading-none bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            {formatSpeed(speed)}
          </span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5 tracking-wide uppercase">
            speed
          </span>
        </div>
      </div>

      {/* Slider */}
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
              <span
                key={item.label}
                className="absolute text-[10px] text-slate-400 font-medium"
                style={style}
              >
                {item.label}
              </span>
            );
          })}
        </div>

        {/* Slider track + progress */}
        <div className="relative h-7 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-200" />
          {/* Progress fill */}
          <div
            className="absolute h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${sliderDragPct}%` }}
          />
          {/* Invisible range input overlaid */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(sliderDragPct)}
            onChange={handleSlider}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="relative w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none"
          />
          <style>{`
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: linear-gradient(135deg, #6366F1, #818CF8);
              border: 3px solid #FFFFFF;
              box-shadow: 0 2px 8px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.1);
              cursor: pointer;
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              box-shadow: 0 3px 12px rgba(99,102,241,0.45), 0 0 0 1px rgba(99,102,241,0.15);
            }
            input[type=range]::-webkit-slider-thumb:active {
              transform: scale(1.08);
            }
            input[type=range]::-moz-range-thumb {
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: linear-gradient(135deg, #6366F1, #818CF8);
              border: 3px solid #FFFFFF;
              box-shadow: 0 2px 8px rgba(99,102,241,0.35);
              cursor: pointer;
            }
            input[type=range]::-moz-range-track {
              background: transparent;
            }
          `}</style>
        </div>

        {/* Hint */}
        <div className="text-center mt-1.5">
          <span className="text-[11px] text-slate-400 font-medium">
            Drag to adjust &middot; {formatSpeed(speed)}&times;
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 px-1 font-semibold">Presets</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => {
            const isActive = speed === p;
            return (
              <button
                key={p}
                onClick={() => applySpeed(p)}
                className={`
                  relative py-2 rounded-lg text-[13px] font-semibold
                  transition-all duration-150 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-1
                  active:scale-[0.96]
                  ${isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                    : 'bg-white/80 text-slate-500 border border-slate-200/80 hover:bg-indigo-50/60 hover:border-indigo-200 hover:text-indigo-600'
                  }
                `}
              >
                {formatSpeed(p)}&times;
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom */}
      <div className="px-4 pb-5">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 px-1 font-semibold">Custom</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={handleCustomInput}
              onBlur={handleCustomApply}
              onKeyDown={handleCustomKeyDown}
              placeholder="0.5 – 16"
              className="w-full h-9 bg-white border border-slate-200 rounded-lg pl-3 pr-7 text-[13px] font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-medium pointer-events-none select-none">
              &times;
            </span>
          </div>
          <button
            onClick={handleCustomApply}
            className="h-9 px-5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-[13px] font-semibold hover:from-indigo-600 hover:to-indigo-700 active:scale-[0.97] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/40 focus-visible:ring-offset-1 shadow-md shadow-indigo-500/20"
          >
            Apply
          </button>
        </div>
        <p className="text-[10px] text-slate-300 mt-2 text-center font-medium">
          Range: {formatSpeed(MIN_SPEED)}&times; – {formatSpeed(MAX_SPEED)}&times; &middot; Step: {STEP}&times;
        </p>
      </div>
    </div>
    </div>
  );
}

export default App;
