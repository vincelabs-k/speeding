const GLOBAL_SPEED_KEY = 'globalSpeed';
const MODE_KEY = 'speedMode';
const SITE_SPEEDS_KEY = 'siteSpeeds';

type SpeedMode = 'this' | 'all';
type SiteSpeeds = Record<string, number>;

async function readStorage<T>(keys: string[]): Promise<Record<string, T>> {
  const syncResult = await chrome.storage.sync.get(keys);
  const missing = keys.filter((k) => syncResult[k] === undefined || syncResult[k] === null);
  if (missing.length === 0) return syncResult as Record<string, T>;

  const localResult = await chrome.storage.local.get(missing);
  return { ...localResult, ...syncResult } as Record<string, T>;
}

async function writeStorage(items: Record<string, unknown>): Promise<void> {
  try {
    await chrome.storage.sync.set(items);
  } catch {
    await chrome.storage.local.set(items);
  }
}

export async function getSpeedMode(): Promise<SpeedMode> {
  const result = await readStorage<SpeedMode>([MODE_KEY]);
  const mode = result[MODE_KEY];
  if (mode === 'this' || mode === 'all') return mode;
  return 'this';
}

export async function setSpeedMode(mode: SpeedMode): Promise<void> {
  await writeStorage({ [MODE_KEY]: mode });
}

export async function getGlobalSpeed(): Promise<number> {
  const result = await readStorage<number>([GLOBAL_SPEED_KEY]);
  const speed = result[GLOBAL_SPEED_KEY];
  return typeof speed === 'number' ? speed : 1;
}

export async function setGlobalSpeed(speed: number): Promise<void> {
  await writeStorage({ [GLOBAL_SPEED_KEY]: speed });
}

export async function getSiteSpeed(hostname: string): Promise<number | null> {
  const result = await readStorage<SiteSpeeds>([SITE_SPEEDS_KEY]);
  const siteSpeeds = result[SITE_SPEEDS_KEY];
  if (siteSpeeds && typeof siteSpeeds === 'object' && typeof siteSpeeds[hostname] === 'number') {
    return siteSpeeds[hostname];
  }
  return null;
}

export async function setSiteSpeed(hostname: string, speed: number): Promise<void> {
  const result = await readStorage<SiteSpeeds>([SITE_SPEEDS_KEY]);
  const siteSpeeds: SiteSpeeds = result[SITE_SPEEDS_KEY] && typeof result[SITE_SPEEDS_KEY] === 'object'
    ? { ...result[SITE_SPEEDS_KEY] }
    : {};
  siteSpeeds[hostname] = speed;
  await writeStorage({ [SITE_SPEEDS_KEY]: siteSpeeds });
}

export async function getResolvedSpeed(hostname: string): Promise<number> {
  const mode = await getSpeedMode();
  if (mode === 'all') {
    return getGlobalSpeed();
  }
  const siteSpeed = await getSiteSpeed(hostname);
  return siteSpeed ?? 1;
}

export { GLOBAL_SPEED_KEY, MODE_KEY, SITE_SPEEDS_KEY };
export type { SpeedMode, SiteSpeeds };
