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
  type Scene,
} from './speed-model';
import { LoadingView } from './components/LoadingView';
import { NoVideoBanner } from './components/NoVideoBanner';
import { SpeedBadge } from './components/SpeedBadge';
import { SectionLabel } from './components/SectionLabel';
import { ModeToggle } from './components/ModeToggle';
import { SpeedSlider } from './components/SpeedSlider';
import { PresetGrid } from './components/PresetGrid';
import { CustomInput } from './components/CustomInput';
import { SceneSection } from './components/SceneSection';
import { RatingButton } from './RatingButton';
import { setSpeedMode as persistSpeedMode } from '../utils/storage';

type VideoInfo = {
  speed: number;
  videoCount: number;
  speedMode?: SpeedMode;
  domain?: string;
  sceneId?: string | null;
};
type SceneInfo = { scenes?: Scene[]; siteSceneId?: string | null };
type LoadingState = 'loading' | 'loaded' | 'no-video';

function App() {
  const [speed, setSpeed] = useState(1);
  const [videoCount, setVideoCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadingState>('loading');
  const [customInput, setCustomInput] = useState('1');
  const [sliderDragPct, setSliderDragPct] = useState(speedToLogPct(1));
  const [speedMode, setSpeedMode] = useState<SpeedMode>('this');
  const [domain, setDomain] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [siteSceneId, setSiteSceneId] = useState<string | null>(null);
  const initialized = useRef(false);

  const sendMessage = useCallback(async (type: 'GET_SPEED' | 'SET_SPEED' | 'SET_MODE' | 'GET_SCENES' | 'SAVE_SCENES' | 'SET_SCENE', arg?: number | string | Scene[] | null) => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    let payload: Record<string, unknown>;
    if (type === 'SET_SPEED' && typeof arg === 'number') payload = { type, speed: arg };
    else if (type === 'SET_MODE' && typeof arg === 'string') payload = { type, mode: arg };
    else if (type === 'SET_SCENE') payload = { type, sceneId: typeof arg === 'string' ? arg : null };
    else if (type === 'SAVE_SCENES' && Array.isArray(arg)) payload = { type, scenes: arg };
    else payload = { type };

    const response = await browser.tabs.sendMessage(tab.id, payload);
    return response as (VideoInfo | SceneInfo) | undefined;
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    sendMessage('GET_SCENES').then((res) => {
      const data = res as SceneInfo | undefined;
      if (data && Array.isArray(data.scenes)) setScenes(data.scenes);
      if (data && 'siteSceneId' in data) setSiteSceneId(data.siteSceneId ?? null);
    }).catch(() => undefined);

    sendMessage('GET_SPEED').then((res) => {
      if (res && 'speed' in res && typeof res.speed === 'number') {
        const info = res as VideoInfo;
        setSpeed(info.speed);
        setVideoCount(info.videoCount);
        setCustomInput(formatSpeed(info.speed));
        setSliderDragPct(speedToLogPct(info.speed));
        if (info.speedMode) setSpeedMode(info.speedMode);
        if (info.domain) setDomain(info.domain);
        if (info.sceneId !== undefined) setSiteSceneId(info.sceneId);
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
    sendMessage('SET_SPEED', clamped).then((res) => {
      const data = res as { speedMode?: SpeedMode } | undefined;
      if (data?.speedMode) setSpeedMode(data.speedMode);
    }).catch(() => undefined);
  }, [sendMessage]);

  const handleModeChange = useCallback(async (mode: SpeedMode) => {
    if (mode === speedMode) return;
    // Optimistic: respond immediately even on pages without a content script.
    setSpeedMode(mode);
    const res = await sendMessage('SET_MODE', mode).catch(() => undefined);
    if (res && 'speed' in res && typeof res.speed === 'number') {
      const info = res as VideoInfo;
      const newSpeed = info.speed;
      setSpeed(newSpeed);
      setCustomInput(formatSpeed(newSpeed));
      setSliderDragPct(speedToLogPct(newSpeed));
      if (info.sceneId !== undefined) setSiteSceneId(info.sceneId);
    } else {
      // Content script unreachable (chrome://, Web Store, etc.): persist the mode
      // directly so the next video page picks it up on load.
      await persistSpeedMode(mode).catch(() => undefined);
    }
  }, [speedMode, sendMessage]);

  const handleSceneSelect = useCallback(async (sceneId: string | null) => {
    const res = await sendMessage('SET_SCENE', sceneId).catch(() => undefined);
    if (res && 'speed' in res && typeof res.speed === 'number') {
      const info = res as VideoInfo;
      setSpeed(info.speed);
      if (info.speedMode) setSpeedMode(info.speedMode);
      setCustomInput(formatSpeed(info.speed));
      setSliderDragPct(speedToLogPct(info.speed));
      setSiteSceneId(info.sceneId ?? null);
    }
  }, [sendMessage]);

  const handleScenesSave = useCallback((next: Scene[]) => {
    setScenes(next);
    if (siteSceneId !== null && !next.some((s) => s.id === siteSceneId)) {
      setSiteSceneId(null);
    }
    sendMessage('SAVE_SCENES', next).then((res) => {
      // Editing the bound scene's speed syncs the slider / badge / input.
      const data = res as { speed?: number; speedMode?: SpeedMode } | undefined;
      if (data && typeof data.speed === 'number') {
        setSpeed(data.speed);
        setCustomInput(formatSpeed(data.speed));
        setSliderDragPct(speedToLogPct(data.speed));
        if (data.speedMode) setSpeedMode(data.speedMode);
      }
    }).catch(() => undefined);
  }, [sendMessage, siteSceneId]);

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

  // ── Main ──
  return (
    <div className="w-[360px] bg-white">
      <div className="rounded-xl border border-slate-200/60 bg-gradient-to-b from-slate-50 to-white text-slate-800 select-none overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800">Speeding</h1>
            {videoCount > 0 && (
              <p className="text-caption text-slate-400 mt-0.5 font-medium">
                {browser.i18n.getMessage(videoCount === 1 ? 'videoDetected' : 'videosDetected', videoCount.toString())}
              </p>
            )}
          </div>
          <SpeedBadge speed={speed} />
        </div>

        {/* No-video banner */}
        {videoCount === 0 && <NoVideoBanner />}

        {/* Mode Toggle */}
        <div className="px-5 pb-3">
          <ModeToggle mode={speedMode} domain={domain} onModeChange={handleModeChange} />
        </div>

        {/* Scenes */}
        {speedMode === 'scenes' && (
          <div className="px-5 pb-3">
            <SectionLabel>{browser.i18n.getMessage('scenes')}</SectionLabel>
            <SceneSection
              scenes={scenes}
              siteSceneId={siteSceneId}
              onSelect={handleSceneSelect}
              onSave={handleScenesSave}
            />
          </div>
        )}

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
