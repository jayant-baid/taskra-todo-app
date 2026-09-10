/**
 * Local device time date utilities.
 * Ensures consistent handling of ISO YYYY-MM-DD date strings based on device local calendar.
 */

export function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

/**
 * Returns YYYY-MM-DD based on local device time for a given Date object (default: now).
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Returns the app's task date. A task day runs from 4:00 AM through 3:59 AM.
 */
export function getTaskDateString(date: Date = new Date()): string {
  const taskDate = new Date(date);
  if (taskDate.getHours() < 4) {
    taskDate.setDate(taskDate.getDate() - 1);
  }
  return getLocalDateString(taskDate);
}

export function isBeforeTaskDayStart(date: Date = new Date()): boolean {
  return date.getHours() < 4;
}

/**
 * Parses YYYY-MM-DD string into a Date object set at local midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string and returns a new YYYY-MM-DD string.
 */
export function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Calculates calendar day difference (targetDateStr - baseDateStr).
 * Positive if targetDateStr is after baseDateStr.
 */
export function getDaysDifference(
  baseDateStr: string,
  targetDateStr: string,
): number {
  const base = parseLocalDate(baseDateStr);
  const target = parseLocalDate(targetDateStr);
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Extracts YYYY-MM-DD from an ISO timestamp string using local time.
 */
export function getLocalDateFromISO(isoString: string): string {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return getLocalDateString();
  return getLocalDateString(d);
}

export function formatShortDay(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function formatShortMonth(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function formatDisplayDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatFullDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Returns an array of 7 consecutive dates (YYYY-MM-DD) for the week containing the given date.
 * Starts from Monday (or Sunday if preferred). Standard ops dashboard starts Monday.
 */
export function getWeekDays(
  centerDateStr: string,
  startOnMonday = true,
): string[] {
  const date = parseLocalDate(centerDateStr);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...

  let diffToStart = 0;
  if (startOnMonday) {
    diffToStart = day === 0 ? -6 : 1 - day;
  } else {
    diffToStart = -day;
  }

  const startDateStr = addDays(centerDateStr, diffToStart);
  const weekDays: string[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(startDateStr, i));
  }
  return weekDays;
}
