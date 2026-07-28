import { useState, useCallback, useEffect, useRef } from 'react';

const PRESETS = [0.5, 1, 1.5, 2, 3, 4, 8, 16];
const MIN_SPEED = 0.5;
const MAX_SPEED = 16;
const STEP = 0.25;

const clamp = (v: number) => Math.max(MIN_SPEED, Math.min(MAX_SPEED, v));
const formatSpeed = (v: number) => {
  const rounded = Math.round(v * 100) / 100;
  return rounded % 1 === 0 ? `${rounded}` : rounded.toFixed(2);
};

type VideoInfo = { speed: number; videoCount: number };
type LoadingState = 'loading' | 'loaded' | 'no-video';

function App() {
  const [speed, setSpeed] = useState(1);
  const [videoCount, setVideoCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadingState>('loading');
  const [customInput, setCustomInput] = useState('1');
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
    sendMessage('SET_SPEED', clamped);
  }, [sendMessage]);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    setCustomInput(formatSpeed(val));
  }, []);

  const handleSliderCommit = useCallback((e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    applySpeed(val);
  }, [applySpeed]);

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

  const sliderPercent = ((speed - MIN_SPEED) / (MAX_SPEED - MIN_SPEED)) * 100;

  // ── Loading ──
  if (loadState === 'loading') {
    return (
      <div className="w-80 h-[340px] flex items-center justify-center bg-[#F9F9F9]">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full border-[2.5px] border-[#E0E0E0] border-t-[#0078D4] animate-spin" />
        </div>
      </div>
    );
  }

  // ── No video ──
  if (loadState === 'no-video') {
    return (
      <div className="w-80 h-[340px] flex items-center justify-center bg-[#F9F9F9]">
        <p className="text-sm text-[#6B6B6B] font-medium">No video detected</p>
      </div>
    );
  }

  // ── Main ──
  return (
    <div className="w-80 bg-[#F9F9F9] text-[#1A1A1A] select-none">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-[#1A1A1A]">
            Speeding
          </h1>
          <p className="text-[11px] text-[#8A8A8A] mt-0.5">
            {videoCount} video{videoCount !== 1 ? 's' : ''} detected
          </p>
        </div>
        {/* Speed badge */}
        <div className="flex-shrink-0 w-[64px] h-[64px] rounded-xl bg-white border border-[#E8E8E8] flex flex-col items-center justify-center shadow-sm">
          <span className="text-[26px] font-semibold leading-none text-[#0078D4]">
            {formatSpeed(speed)}
          </span>
          <span className="text-[10px] text-[#8A8A8A] font-medium mt-0.5">x SPEED</span>
        </div>
      </div>

      {/* Slider */}
      <div className="px-5 pb-4">
        <div className="flex justify-between text-[10px] text-[#A0A0A0] mb-1.5 px-0.5 font-medium">
          <span>0.5</span>
          <span>4</span>
          <span>8</span>
          <span>12</span>
          <span>16</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={STEP}
            value={speed}
            onChange={handleSlider}
            onMouseUp={handleSliderCommit}
            onTouchEnd={handleSliderCommit}
            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-[#E0E0E0] focus:outline-none"
            style={{
              background: `linear-gradient(to right, #0078D4 ${sliderPercent}%, #E0E0E0 ${sliderPercent}%)`,
            }}
          />
          <style>{`
            input[type=range]::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #FFFFFF;
              border: 2px solid #0078D4;
              box-shadow: 0 1px 3px rgba(0,0,0,0.12);
              cursor: pointer;
              transition: transform 0.1s ease;
            }
            input[type=range]::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              border-color: #006CBE;
            }
            input[type=range]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #FFFFFF;
              border: 2px solid #0078D4;
              box-shadow: 0 1px 3px rgba(0,0,0,0.12);
              cursor: pointer;
            }
          `}</style>
        </div>

        <div className="text-center mt-2">
          <span className="text-[11px] text-[#A0A0A0]">
            Drag to adjust · {formatSpeed(speed)}x
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[#A0A0A0] uppercase tracking-[0.05em] mb-1.5 px-1 font-medium">Presets</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESETS.map((p) => {
            const isActive = speed === p;
            return (
              <button
                key={p}
                onClick={() => applySpeed(p)}
                className={`
                  py-1.5 rounded-md text-[13px] font-medium
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078D4]/30
                  ${isActive
                    ? 'bg-[#0078D4] text-white shadow-sm'
                    : 'bg-white border border-[#E0E0E0] text-[#4A4A4A] hover:bg-[#F3F3F3] hover:border-[#CCCCCC] active:bg-[#E8E8E8]'
                  }
                `}
              >
                {formatSpeed(p)}<span className="text-[10px] opacity-70 ml-0.5">x</span>
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#107C10] rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom */}
      <div className="px-4 pb-5">
        <p className="text-[10px] text-[#A0A0A0] uppercase tracking-[0.05em] mb-1.5 px-1 font-medium">Custom</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customInput}
              onChange={handleCustomInput}
              onBlur={handleCustomApply}
              onKeyDown={handleCustomKeyDown}
              placeholder="0.5 - 16"
              className="w-full h-8 bg-white border border-[#E0E0E0] rounded-md px-2.5 text-[13px] text-[#1A1A1A] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#0078D4] focus:ring-1 focus:ring-[#0078D4]/20 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#A0A0A0] pointer-events-none">
              x
            </span>
          </div>
          <button
            onClick={handleCustomApply}
            className="h-8 px-4 rounded-md bg-[#0078D4] text-white text-[13px] font-medium hover:bg-[#006CBE] active:bg-[#005DA6] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0078D4]/30"
          >
            Apply
          </button>
        </div>
        <p className="text-[10px] text-[#A0A0A0] mt-1.5 text-center">
          Range: {MIN_SPEED}x – {MAX_SPEED}x · Step: {STEP}x
        </p>
      </div>
    </div>
  );
}

export default App;
