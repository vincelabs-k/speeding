import { useState, useCallback, useEffect, useRef } from 'react';
import {
  clamp,
  formatSpeed,
  logPctToSpeed,
  speedToLogPct,
  MIN_SPEED,
  MAX_SPEED,
  STEP,
  type SpeedMode,
} from './speed-model';
import { LoadingView } from './components/LoadingView';
import { NoVideoView } from './components/NoVideoView';
import { SpeedBadge } from './components/SpeedBadge';
import { SectionLabel } from './components/SectionLabel';
import { ModeToggle } from './components/ModeToggle';
import { SpeedSlider } from './components/SpeedSlider';
import { PresetGrid } from './components/PresetGrid';
import { CustomInput } from './components/CustomInput';
import { RatingButton } from './RatingButton';

type VideoInfo = { speed: number; videoCount: number; speedMode?: SpeedMode; domain?: string };
type LoadingState = 'loading' | 'loaded' | 'no-video';

function App() {
  const [speed, setSpeed] = useState(1);
  const [videoCount, setVideoCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadingState>('loading');
  const [customInput, setCustomInput] = useState('1');
  const [sliderDragPct, setSliderDragPct] = useState(speedToLogPct(1));
  const [speedMode, setSpeedMode] = useState<SpeedMode>('this');
  const [domain, setDomain] = useState('');
  const initialized = useRef(false);

  const sendMessage = useCallback(async (type: 'GET_SPEED' | 'SET_SPEED' | 'SET_MODE', speedOrMode?: number | string) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    const payload = type === 'SET_SPEED' && typeof speedOrMode === 'number'
      ? { type, speed: speedOrMode }
      : type === 'SET_MODE' && typeof speedOrMode === 'string'
        ? { type, mode: speedOrMode }
        : { type };

    const response = await browser.tabs.sendMessage(tab.id, payload);
    return response as VideoInfo | { success: boolean; speed: number; speedMode?: SpeedMode } | undefined;
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
        if (info.speedMode) setSpeedMode(info.speedMode);
        if (info.domain) setDomain(info.domain);
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

  const handleModeChange = useCallback(async (mode: SpeedMode) => {
    if (mode === speedMode) return;
    const res = await sendMessage('SET_MODE', mode);
    if (res && 'speed' in res && typeof res.speed === 'number') {
      const newSpeed = res.speed;
      setSpeed(newSpeed);
      setSpeedMode(mode);
      setCustomInput(formatSpeed(newSpeed));
      setSliderDragPct(speedToLogPct(newSpeed));
    }
  }, [speedMode, sendMessage]);

  const handleSlider = useCallback((pct: number) => {
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

  const handleCustomApply = useCallback(() => {
    const val = parseFloat(customInput);
    if (isNaN(val)) {
      setCustomInput(formatSpeed(speed));
      return;
    }
    applySpeed(val);
  }, [customInput, speed, applySpeed]);

  // ── Loading ──
  if (loadState === 'loading') {
    return <LoadingView />;
  }

  // ── No video ──
  if (loadState === 'no-video') {
    return <NoVideoView />;
  }

  // ── Main ──
  return (
    <div className="w-[360px] bg-white">
      <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white text-slate-800 select-none overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Speeding</h1>
            <p className="text-caption text-slate-400 mt-0.5 font-medium">
              {browser.i18n.getMessage(videoCount === 1 ? 'videoDetected' : 'videosDetected', videoCount.toString())}
            </p>
          </div>
          <SpeedBadge speed={speed} />
        </div>

        {/* Mode Toggle */}
        <div className="px-5 pb-3">
          <ModeToggle mode={speedMode} domain={domain} onModeChange={handleModeChange} />
        </div>

        {/* Slider */}
        <SpeedSlider speed={speed} dragPct={sliderDragPct} onDrag={handleSlider} onCommit={handleSliderCommit} />

        {/* Presets */}
        <div className="px-5 pb-3">
          <SectionLabel>{browser.i18n.getMessage('presets')}</SectionLabel>
          <PresetGrid speed={speed} onSelect={applySpeed} />
        </div>

        {/* Custom */}
        <div className="px-5 pb-5">
          <SectionLabel>{browser.i18n.getMessage('custom')}</SectionLabel>
          <CustomInput value={customInput} onValueChange={setCustomInput} onApply={handleCustomApply} />
          <p className="text-micro text-slate-300 mt-2 text-center font-medium">
            {browser.i18n.getMessage('rangeStep', [formatSpeed(MIN_SPEED), formatSpeed(MAX_SPEED), STEP.toString()])}
          </p>
          <RatingButton />
          <p className="text-micro text-slate-300 mt-2 text-center font-medium">
            {browser.i18n.getMessage('shortcutHint')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
