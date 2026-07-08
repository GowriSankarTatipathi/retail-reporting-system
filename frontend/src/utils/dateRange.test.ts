import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lastNDays, lastNMonths } from './dateRange';

describe('dateRange', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lastNDays returns start/end as local-datetime strings with no timezone suffix', () => {
    const { start, end } = lastNDays(7);
    // Matches Spring's ISO_LOCAL_DATE_TIME - no trailing "Z" or offset.
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}T23:59:59$/);
    expect(start.endsWith('Z')).toBe(false);
    expect(end.endsWith('Z')).toBe(false);
  });

  it('lastNDays start is 7 days before end', () => {
    const { start, end } = lastNDays(7);
    expect(start.slice(0, 10)).toBe('2026-07-08');
    expect(end.slice(0, 10)).toBe('2026-07-15');
  });

  it('lastNMonths subtracts calendar months', () => {
    const { start, end } = lastNMonths(6);
    expect(start.slice(0, 10)).toBe('2026-01-15');
    expect(end.slice(0, 10)).toBe('2026-07-15');
  });
});
