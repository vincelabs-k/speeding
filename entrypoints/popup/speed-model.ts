export type SpeedMode = 'this' | 'scenes' | 'all';

export type Scene = {
  id: string;
  name: string;
  speed: number;
  /** true = name holds an i18n key (e.g. `sceneCourse`); false = user-typed free text */
  builtin?: boolean;
};

export const MIN_SPEED = 0.5;
export const MAX_SPEED = 16;
export const STEP = 0.25;
export const PRESETS = [0.5, 1, 1.5, 2, 3, 4, 8, 16];

/** Built-in scenes — name values are i18n keys, resolved via browser.i18n.getMessage. */
export const DEFAULT_SCENES: Scene[] = [
  { id: 'course', name: 'sceneCourse', speed: 16, builtin: true },
  { id: 'series', name: 'sceneSeries', speed: 1.25, builtin: true },
  { id: 'listening', name: 'sceneListening', speed: 0.75, builtin: true },
];

/**
 * Preset scene bindings for popular sites (bare domain → scene id).
 * Matched by exact hostname or `.`-prefixed suffix; user-set bindings always win.
 *
 * Classification rules:
 * - `course` (study / points farming): education, MOOC, and skill-learning platforms.
 * - `series` (bingeing): long-form streaming, drama, anime, and entertainment platforms.
 * - `listening` (foreign-language listening): podcasts, talks, audiobooks, and
 *   foreign-news/listening practice platforms.
 */
export const DEFAULT_SITE_SCENES: Record<string, string> = {
  // Course study / points farming
  'udemy.com': 'course',
  'coursera.org': 'course',
  'bilibili.com': 'course',
  'khanacademy.org': 'course',
  'edx.org': 'course',
  'pluralsight.com': 'course',
  'skillshare.com': 'course',
  'icourse163.org': 'course',
  'xuetangx.com': 'course',
  'linkedin.com': 'course',
  'codecademy.com': 'course',
  'udacity.com': 'course',
  'masterclass.com': 'course',
  'study.163.com': 'course',
  'ke.qq.com': 'course',
  'teachable.com': 'course',
  'alison.com': 'course',
  // Series bingeing
  'netflix.com': 'series',
  'disneyplus.com': 'series',
  'primevideo.com': 'series',
  'hulu.com': 'series',
  'hbo.com': 'series',
  'iqiyi.com': 'series',
  'youku.com': 'series',
  'v.qq.com': 'series',
  'mgtv.com': 'series',
  'tv.apple.com': 'series',
  'paramountplus.com': 'series',
  'peacocktv.com': 'series',
  'max.com': 'series',
  'crunchyroll.com': 'series',
  'sohu.com': 'series',
  'le.com': 'series',
  // Foreign-language listening
  'youtube.com': 'listening',
  'ted.com': 'listening',
  'vimeo.com': 'listening',
  'dailymotion.com': 'listening',
  'twitch.tv': 'listening',
  'spotify.com': 'listening',
  'soundcloud.com': 'listening',
  'podbean.com': 'listening',
  'audible.com': 'listening',
  'ximalaya.com': 'listening',
  'npr.org': 'listening',
  'voanews.com': 'listening',
  'bbc.com': 'listening',
};

// Log-scale math constants
const LOG_MIN = Math.log(MIN_SPEED);
const LOG_MAX = Math.log(MAX_SPEED);
const LOG_RANGE = LOG_MAX - LOG_MIN;

export const SLIDER_LABELS = [
  { label: '0.5', value: 0.5 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '4', value: 4 },
  { label: '8', value: 8 },
  { label: '16', value: 16 },
];

export const clamp = (v: number) => Math.max(MIN_SPEED, Math.min(MAX_SPEED, v));

export const formatSpeed = (v: number) => {
  const rounded = Math.round(v * 100) / 100;
  return parseFloat(rounded.toFixed(2)).toString();
};

export const speedToLogPct = (s: number) => ((Math.log(s) - LOG_MIN) / LOG_RANGE) * 100;

export const logPctToSpeed = (p: number) => Math.exp(LOG_MIN + (p / 100) * LOG_RANGE);
