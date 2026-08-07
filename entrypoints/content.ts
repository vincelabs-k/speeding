import { SpeedController } from './utils/speed-controller';
import {
  getSpeedMode,
  getResolvedSpeed,
  setGlobalSpeed,
  setSiteSpeed,
  setSpeedMode,
} from './utils/storage';
import type { SpeedMode } from './utils/storage';

export default defineContentScript({
  matches: ['*://*/*'],
  async main() {
    const hostname = location.hostname;
    const initialSpeed = await getResolvedSpeed(hostname);
    let currentMode = await getSpeedMode();

    const controller = new SpeedController(initialSpeed);

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

        if (currentMode === 'all') {
          setGlobalSpeed(msg.speed);
        } else {
          setSiteSpeed(hostname, msg.speed);
        }

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
