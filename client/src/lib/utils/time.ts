// All schedule dates and times are Croatian wall time ("YYYY-MM-DD" and "HH:MM" strings).
// The page renders on a UTC server and in browsers that may be in any timezone, so
// "today" and "now" are always computed in Europe/Zagreb, and calendar dates are
// handled as plain strings instead of local Date objects.

export const TIME_ZONE = 'Europe/Zagreb';

const zagrebFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

function zagrebParts(date: Date): Record<string, string> {
  return Object.fromEntries(
    zagrebFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
}

const millisecondsInADay = 24 * 60 * 60 * 1000;

/** Today's date in Zagreb as "YYYY-MM-DD". */
export function todayYMD(now: Date = new Date()): string {
  const { year, month, day } = zagrebParts(now);
  return `${year}-${month}-${day}`;
}

/** Minutes since midnight in Zagreb. */
export function zagrebMinutesOfDay(now: Date = new Date()): number {
  const { hour, minute } = zagrebParts(now);
  return Number(hour) * 60 + Number(minute);
}

export function isYMD(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(ymdToUtcMs(value));
}

function ymdToUtcMs(ymd: string): number {
  const [year, month, day] = ymd.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Adds whole calendar days to a "YYYY-MM-DD" date. */
export function addDaysYMD(ymd: string, days: number): string {
  return new Date(ymdToUtcMs(ymd) + days * millisecondsInADay).toISOString().slice(0, 10);
}

/** Calendar days from `from` to `to` (both "YYYY-MM-DD"). */
export function daysBetweenYMD(from: string, to: string): number {
  return Math.round((ymdToUtcMs(to) - ymdToUtcMs(from)) / millisecondsInADay);
}

/** Formats a calendar date the same way on every server and browser. */
export function formatYMD(ymd: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(ymdToUtcMs(ymd)).toLocaleDateString('hr-HR', {
    ...options,
    timeZone: 'UTC'
  });
}
