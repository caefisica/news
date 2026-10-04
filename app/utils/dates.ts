const TIME_ZONE = "America/Lima";
const DAY_MS = 86_400_000;
// Date accepts at most ±8.64e15 ms, so a larger timestamp in seconds cannot be formatted.
const MAX_SECONDS = 8.64e12;

const dayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const timeFormat = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const weekdayFormat = new Intl.DateTimeFormat("es-PE", { timeZone: TIME_ZONE, weekday: "short" });
const dayMonthFormat = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});
const monthFormat = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIME_ZONE,
  month: "long",
  year: "numeric",
});
const longFormat = new Intl.DateTimeFormat("es-PE", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export type DayGroup = "today" | "yesterday" | "week" | "month" | "none";

export function isValidTimestamp(ts: unknown): ts is number {
  return typeof ts === "number" && Number.isFinite(ts) && Math.abs(ts) <= MAX_SECONDS;
}

// Days since the Unix epoch for the calendar day in Lima.
function limaDay(date: Date): number {
  return Date.parse(`${dayFormat.format(date)}T00:00:00Z`) / DAY_MS;
}

// Monday is the first day of the week in Peru.
function weekStart(day: number): number {
  const weekday = (new Date(day * DAY_MS).getUTCDay() + 6) % 7;
  return day - weekday;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function dayGroup(ts: number | null, now: Date): DayGroup {
  if (!isValidTimestamp(ts)) return "none";
  const today = limaDay(now);
  const day = limaDay(new Date(ts * 1000));
  if (day >= today) return "today";
  if (day === today - 1) return "yesterday";
  if (day >= weekStart(today)) return "week";
  return "month";
}

export interface ArticleGroup<T> {
  key: string;
  label: string;
  items: T[];
}

// Group a list already sorted by date, newest first, under day headings.
export function groupByDay<T extends { published_at: number | null }>(
  items: T[],
  now: Date,
): ArticleGroup<T>[] {
  const groups: ArticleGroup<T>[] = [];
  for (const item of items) {
    const group = dayGroup(item.published_at, now);
    let key: string = group;
    let label: string;
    if (group === "today") label = "Hoy";
    else if (group === "yesterday") label = "Ayer";
    else if (group === "week") label = "Esta semana";
    else if (group === "none") label = "Sin fecha";
    else {
      const date = new Date((item.published_at as number) * 1000);
      label = capitalize(monthFormat.format(date));
      key = `month-${dayFormat.format(date).slice(0, 7)}`;
    }
    const last = groups.at(-1);
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label, items: [item] });
  }
  return groups;
}

// The row shows the time for recent days, the weekday this week and the day otherwise.
export function shortDate(ts: number | null, now: Date): string | null {
  if (!isValidTimestamp(ts)) return null;
  const date = new Date(ts * 1000);
  const group = dayGroup(ts, now);
  if (group === "today" || group === "yesterday") return timeFormat.format(date);
  if (group === "week") return weekdayFormat.format(date);
  return dayMonthFormat.format(date);
}

export function longDate(ts: number | null): string | null {
  if (!isValidTimestamp(ts)) return null;
  return capitalize(longFormat.format(new Date(ts * 1000)));
}

export function isoDate(ts: number | null): string | null {
  if (!isValidTimestamp(ts)) return null;
  return new Date(ts * 1000).toISOString();
}
