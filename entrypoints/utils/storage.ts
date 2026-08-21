import { DEFAULT_SCENES, DEFAULT_SITE_SCENES } from '../popup/speed-model';
import type { Scene } from '../popup/speed-model';

const GLOBAL_SPEED_KEY = 'globalSpeed';
const MODE_KEY = 'speedMode';
const SITE_SPEEDS_KEY = 'siteSpeeds';
const SCENES_KEY = 'scenes';
const SITE_SCENES_KEY = 'siteScenes';

type SpeedMode = 'this' | 'scenes' | 'all';
type SiteSpeeds = Record<string, number>;
type SiteScenes = Record<string, string>;

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
  if (mode === 'this' || mode === 'scenes' || mode === 'all') return mode;
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

// ── Scenes ──────────────────────────────────────────────────────────

/**
 * Returns the scenes list, seeding built-in scenes on first run (whenever
 * the `scenes` key is missing or empty).
 */
export async function getScenes(): Promise<Scene[]> {
  const result = await readStorage<Scene[]>([SCENES_KEY]);
  const scenes = result[SCENES_KEY];
  if (Array.isArray(scenes) && scenes.length > 0) {
    return scenes.filter(isValidScene);
  }
  await writeStorage({ [SCENES_KEY]: DEFAULT_SCENES });
  return DEFAULT_SCENES;
}

function isValidScene(s: Scene): s is Scene {
  return (
    typeof s === 'object' &&
    s !== null &&
    typeof s.id === 'string' &&
    typeof s.name === 'string' &&
    typeof s.speed === 'number'
  );
}

/** Persists the full scene list, cleaning dangling siteScene references in the same write. */
export async function saveScenes(scenes: Scene[]): Promise<void> {
  await writeStorage({ [SCENES_KEY]: scenes });
  await cleanDanglingSiteScenes(new Set(scenes.map((s) => s.id)));
}

/**
 * Returns the scene id bound to this hostname.
 * Falls back to the preset default binding table when the user never
 * explicitly bound a scene for this hostname.
 */
export async function getSiteSceneId(hostname: string): Promise<string | null> {
  const result = await readStorage<SiteScenes>([SITE_SCENES_KEY]);
  const siteScenes = result[SITE_SCENES_KEY];
  if (siteScenes && typeof siteScenes === 'object' && typeof siteScenes[hostname] === 'string') {
    return siteScenes[hostname];
  }
  for (const [domain, sceneId] of Object.entries(DEFAULT_SITE_SCENES)) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return sceneId;
    }
  }
  return null;
}

/** Binds (or unbinds, when sceneId is null) a scene to the current hostname. */
export async function setSiteScene(hostname: string, sceneId: string | null): Promise<void> {
  const result = await readStorage<SiteScenes>([SITE_SCENES_KEY]);
  const siteScenes: SiteScenes = result[SITE_SCENES_KEY] && typeof result[SITE_SCENES_KEY] === 'object'
    ? { ...result[SITE_SCENES_KEY] }
    : {};
  if (sceneId === null) {
    delete siteScenes[hostname];
  } else {
    siteScenes[hostname] = sceneId;
  }
  await writeStorage({ [SITE_SCENES_KEY]: siteScenes });
}

async function cleanDanglingSiteScenes(validIds: Set<string>): Promise<void> {
  const result = await readStorage<SiteScenes>([SITE_SCENES_KEY]);
  const siteScenes = result[SITE_SCENES_KEY];
  if (!siteScenes || typeof siteScenes !== 'object') return;
  const kept: SiteScenes = {};
  let changed = false;
  for (const [host, id] of Object.entries(siteScenes)) {
    if (validIds.has(id)) {
      kept[host] = id;
    } else {
      changed = true;
    }
  }
  if (changed) {
    await writeStorage({ [SITE_SCENES_KEY]: kept });
  }
}

// ── Resolution ──────────────────────────────────────────────────────

export async function getResolvedSpeed(hostname: string): Promise<number> {
  const mode = await getSpeedMode();
  if (mode === 'all') {
    return getGlobalSpeed();
  }
  if (mode === 'scenes') {
    const sceneId = await getSiteSceneId(hostname);
    if (sceneId === null) return 1;
    const scenes = await getScenes();
    const scene = scenes.find((s) => s.id === sceneId);
    return scene ? scene.speed : 1;
  }
  const siteSpeed = await getSiteSpeed(hostname);
  return siteSpeed ?? 1;
}

export { GLOBAL_SPEED_KEY, MODE_KEY, SITE_SPEEDS_KEY, SCENES_KEY, SITE_SCENES_KEY };
export type { SpeedMode, SiteSpeeds, SiteScenes };
