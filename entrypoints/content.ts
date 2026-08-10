import { SpeedController } from './utils/speed-controller';
import {
  getSpeedMode,
  getResolvedSpeed,
  setGlobalSpeed,
  setSiteSpeed,
  setSpeedMode,
} from './utils/storage';
import type { SpeedMode } from './utils/storage';
import { recordUsage } from './utils/stats';

const STEP = 0.25;

export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    const hostname = location.hostname;
    const initialSpeed = await getResolvedSpeed(hostname);
    let currentMode = await getSpeedMode();

    let sessionRecorded = false;
    let persistTimer: ReturnType<typeof setTimeout> | null = null;

    const maybeRecord = () => {
      if (!sessionRecorded) {
        sessionRecorded = true;
        recordUsage();
      }
    };

    const persistSpeed = (speed: number) => {
      if (currentMode === 'all') {
        setGlobalSpeed(speed);
      } else {
        setSiteSpeed(hostname, speed);
      }
    };

    const controller = new SpeedController(initialSpeed);
    controller.onFirstApply = maybeRecord;

    const handleKeydown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

      e.preventDefault();
      const delta = e.key === 'ArrowUp' ? STEP : -STEP;
      const newSpeed = SpeedController.clamp(controller.getSpeed() + delta);
      controller.setSpeed(newSpeed);
      maybeRecord();

      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => persistSpeed(newSpeed), 300);
    };

    document.addEventListener('keydown', handleKeydown, true);

    browser.runtime.onMessage.addListener((msg: { type: string; speed?: number; mode?: SpeedMode }) => {
      if (msg.type === 'GET_SPEED') {
        return Promise.resolve({
          speed: controller.getSpeed(),
          videoCount: controller.getVideoCount(),
          speedMode: currentMode,
          domain: hostname,
        });
      }

      if (msg.type === 'SET_SPEED' && typeof msg.speed === 'number') {
        controller.setSpeed(msg.speed);
        persistSpeed(msg.speed);
        maybeRecord();

        return Promise.resolve({
          success: true,
          speed: controller.getSpeed(),
        });
      }

      if (msg.type === 'SET_MODE' && msg.mode) {
        currentMode = msg.mode;
        return (async () => {
          await setSpeedMode(msg.mode!);
          const resolved = await getResolvedSpeed(hostname);
          controller.setSpeed(resolved);
          maybeRecord();
          return {
            success: true,
            speed: controller.getSpeed(),
            speedMode: currentMode,
          };
        })();
      }
    });
  },
});
