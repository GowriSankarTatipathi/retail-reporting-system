import { format, startOfDay, endOfDay, subMonths, subDays } from 'date-fns';
import type { DateRangeParams } from '@/types';

/**
 * The backend binds these query params directly to java.time.LocalDateTime
 * (see e.g. ReportController.salesSummary's `@DateTimeFormat(iso =
 * DateTimeFormat.ISO.DATE_TIME) LocalDateTime start`), which Spring parses
 * with `DateTimeFormatter.ISO_LOCAL_DATE_TIME` - no trailing "Z" and no
 * offset, unlike `Date.prototype.toISOString()`. This formats a local Date
 * the way the backend expects.
 */
function toLocalDateTimeParam(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
}

export function lastNMonths(n: number): DateRangeParams {
  const end = endOfDay(new Date());
  const start = startOfDay(subMonths(end, n));
  return { start: toLocalDateTimeParam(start), end: toLocalDateTimeParam(end) };
}

export function lastNDays(n: number): DateRangeParams {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, n));
  return { start: toLocalDateTimeParam(start), end: toLocalDateTimeParam(end) };
}
