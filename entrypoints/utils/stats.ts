const STORAGE_KEY = 'usageStats';
const RETENTION_DAYS = 14;

interface DailyUsage {
  date: string;
  count: number;
}

interface UsageData {
  daily: DailyUsage[];
}

const todayStr = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as week start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const cutoffDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - RETENTION_DAYS);
  return d.toISOString().split('T')[0];
};

const pruneOld = (daily: DailyUsage[]): DailyUsage[] => {
  const cutoff = cutoffDate();
  return daily.filter((r) => r.date >= cutoff);
};

/**
 * Read usage data from sync first, then local. Merge by date (take max count).
 */
const readUsageData = async (): Promise<UsageData> => {
  const syncResult = await chrome.storage.sync.get(STORAGE_KEY).catch(() => ({}));
  const localResult = await chrome.storage.local.get(STORAGE_KEY).catch(() => ({}));

  const syncDaily: DailyUsage[] = syncResult[STORAGE_KEY]?.daily ?? [];
  const localDaily: DailyUsage[] = localResult[STORAGE_KEY]?.daily ?? [];

  const merged = new Map<string, number>();
  for (const r of syncDaily) {
    merged.set(r.date, Math.max(r.count, merged.get(r.date) ?? 0));
  }
  for (const r of localDaily) {
    merged.set(r.date, Math.max(r.count, merged.get(r.date) ?? 0));
  }

  const daily: DailyUsage[] = [];
  for (const [date, count] of merged) {
    daily.push({ date, count });
  }
  daily.sort((a, b) => a.date.localeCompare(b.date));

  return { daily };
};

/**
 * Write usage data — try sync first, fallback to local.
 */
const writeUsageData = async (data: UsageData): Promise<void> => {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: data });
  } catch {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }
};

/**
 * Record one usage event for today. Per-session dedup is handled by the caller.
 */
export const recordUsage = async (): Promise<void> => {
  const data = await readUsageData();
  const today = todayStr();

  const existing = data.daily.find((r) => r.date === today);
  if (existing) {
    existing.count += 1;
  } else {
    data.daily.push({ date: today, count: 1 });
  }

  data.daily = pruneOld(data.daily);
  await writeUsageData(data);
};

/**
 * Get total usage count for the current calendar week (Mon–Sun).
 */
export const getWeeklyUsageCount = async (): Promise<number> => {
  const data = await readUsageData();
  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split('T')[0];

  return data.daily
    .filter((r) => r.date >= weekStartStr)
    .reduce((sum, r) => sum + r.count, 0);
};

/**
 * Check if the user is a qualified (active) user: >= 3 speed usages this week.
 */
export const isQualifiedUser = async (): Promise<boolean> => {
  const count = await getWeeklyUsageCount();
  return count >= 3;
};
