import { SpeedController } from './utils/speed-controller';
import {
  getSpeedMode,
  getResolvedSpeed,
  getScenes,
  saveScenes,
  getSiteSceneId,
  setSiteScene,
  setGlobalSpeed,
  setSiteSpeed,
  setSpeedMode,
} from './utils/storage';
import type { SpeedMode } from './utils/storage';
import type { Scene } from './popup/speed-model';
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

    const persistSpeed = async (speed: number) => {
      if (currentMode === 'all') {
        await setGlobalSpeed(speed);
        return;
      }
      // A manual speed adjustment exits Scenes mode back to This site.
      if (currentMode === 'scenes') {
        currentMode = 'this';
        await setSpeedMode('this');
      }
      await setSiteSpeed(hostname, speed);
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
      persistTimer = setTimeout(() => {
        void persistSpeed(newSpeed);
      }, 300);
    };

    document.addEventListener('keydown', handleKeydown, true);

    browser.runtime.onMessage.addListener(
      (msg: {
        type: string;
        speed?: number;
        mode?: SpeedMode;
        sceneId?: string | null;
        scenes?: Scene[];
      }) => {
        if (msg.type === 'GET_SPEED') {
          return (async () => ({
            speed: controller.getSpeed(),
            videoCount: controller.getVideoCount(),
            speedMode: currentMode,
            domain: hostname,
            sceneId: await getSiteSceneId(hostname),
          }))();
        }

        if (msg.type === 'SET_SPEED' && typeof msg.speed === 'number') {
          return (async () => {
            controller.setSpeed(msg.speed);
            await persistSpeed(msg.speed);
            maybeRecord();
            return {
              success: true,
              speed: controller.getSpeed(),
              speedMode: currentMode,
            };
          })();
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
              sceneId: await getSiteSceneId(hostname),
            };
          })();
        }

        if (msg.type === 'GET_SCENES') {
          return (async () => {
            const scenes = await getScenes();
            const siteSceneId = await getSiteSceneId(hostname);
            return { scenes, siteSceneId };
          })();
        }

        if (msg.type === 'SET_SCENE') {
          return (async () => {
            const sceneId = msg.sceneId ?? null;
            if (sceneId !== null) {
              const scenes = await getScenes();
              const exists = scenes.some((s) => s.id === sceneId);
              if (!exists) {
                return { success: false, error: 'SCENE_NOT_FOUND', speed: controller.getSpeed(), sceneId: null };
              }
            }
            if (currentMode !== 'scenes') {
              currentMode = 'scenes';
              await setSpeedMode('scenes');
            }
            await setSiteScene(hostname, sceneId);
            const resolved = await getResolvedSpeed(hostname);
            controller.setSpeed(resolved);
            maybeRecord();
            return {
              success: true,
              speed: controller.getSpeed(),
              speedMode: currentMode,
              sceneId,
            };
          })();
        }

        if (msg.type === 'SAVE_SCENES' && Array.isArray(msg.scenes)) {
          return (async () => {
            await saveScenes(msg.scenes!);
            // Editing the bound scene's speed should take effect immediately.
            if (currentMode === 'scenes') {
              const resolved = await getResolvedSpeed(hostname);
              controller.setSpeed(resolved);
              return { success: true, speed: controller.getSpeed(), speedMode: currentMode };
            }
            return { success: true };
          })();
        }
      },
    );
  },
});
