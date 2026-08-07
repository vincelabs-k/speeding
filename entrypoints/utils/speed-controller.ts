export class SpeedController {
  private currentSpeed = 1.0;
  private observedVideos = new Set<HTMLVideoElement>();
  private videoListeners = new WeakMap<HTMLVideoElement, () => void>();
  private observer: MutationObserver | null = null;
  private scanTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private readonly MIN_SPEED = 0.5;
  private readonly MAX_SPEED = 16;
  private readonly CLEANUP_INTERVAL_MS = 5000;

  constructor(initialSpeed?: number) {
    if (initialSpeed !== undefined) {
      this.currentSpeed = SpeedController.clamp(initialSpeed);
    }
    this.scan();
    this.startObserver();
    this.cleanupTimer = setInterval(() => this.purgeDisconnected(), this.CLEANUP_INTERVAL_MS);
  }

  scan(): void {
    const videos = document.querySelectorAll<HTMLVideoElement>('video');
    videos.forEach((v) => this.trackVideo(v));
  }

  setSpeed(rate: number): void {
    this.currentSpeed = Math.max(this.MIN_SPEED, Math.min(this.MAX_SPEED, rate));
    this.observedVideos.forEach((v) => {
      v.playbackRate = this.currentSpeed;
    });
  }

  getSpeed(): number {
    return this.currentSpeed;
  }

  getVideoCount(): number {
    return this.observedVideos.size;
  }

  destroy(): void {
    this.observer?.disconnect();
    this.observer = null;
    if (this.scanTimer !== null) {
      clearTimeout(this.scanTimer);
      this.scanTimer = null;
    }
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    for (const video of this.observedVideos) {
      const listener = this.videoListeners.get(video);
      if (listener) {
        video.removeEventListener('ratechange', listener);
      }
    }
    this.videoListeners = new WeakMap();
    this.observedVideos.clear();
  }

  private trackVideo(video: HTMLVideoElement): void {
    if (this.observedVideos.has(video)) return;
    this.observedVideos.add(video);

    video.preservesPitch = true;

    const apply = () => {
      if (video.playbackRate !== this.currentSpeed) {
        video.playbackRate = this.currentSpeed;
      }
    };

    apply();
    video.addEventListener('ratechange', apply);
    this.videoListeners.set(video, apply);
  }

  private purgeDisconnected(): void {
    for (const video of this.observedVideos) {
      if (!video.isConnected) {
        const listener = this.videoListeners.get(video);
        if (listener) {
          video.removeEventListener('ratechange', listener);
          this.videoListeners.delete(video);
        }
        this.observedVideos.delete(video);
      }
    }
  }

  private startObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      // Only scan when <video> elements are added — skip unrelated mutations (e.g. danmaku)
      const hasVideo = mutations.some((m) =>
        Array.from(m.addedNodes).some(
          (n) =>
            n.nodeName === 'VIDEO' ||
            (n instanceof Element && n.querySelector('video') !== null),
        ),
      );
      if (!hasVideo) return;

      if (this.scanTimer !== null) {
        clearTimeout(this.scanTimer);
      }
      this.scanTimer = setTimeout(() => {
        this.scan();
        this.scanTimer = null;
      }, 200);
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  static clamp(rate: number): number {
    return Math.max(0.5, Math.min(16, rate));
  }
}
