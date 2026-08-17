export type SpeedMode = 'this' | 'all';

export const MIN_SPEED = 0.5;
export const MAX_SPEED = 16;
export const STEP = 0.25;
export const PRESETS = [0.5, 1, 1.5, 2, 3, 4, 8, 16];

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
