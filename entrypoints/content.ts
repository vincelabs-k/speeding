import { SpeedController } from './utils/speed-controller';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    const controller = new SpeedController();

    browser.runtime.onMessage.addListener((msg: { type: string; speed?: number }) => {
      if (msg.type === 'GET_SPEED') {
        return Promise.resolve({
          speed: controller.getSpeed(),
          videoCount: controller.getVideoCount(),
        });
      }

      if (msg.type === 'SET_SPEED' && typeof msg.speed === 'number') {
        controller.setSpeed(msg.speed);
        return Promise.resolve({
          success: true,
          speed: controller.getSpeed(),
        });
      }
    });
  },
});
