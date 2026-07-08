import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, formatDateTime, formatNumber, initialsOf } from './format';

describe('formatCurrency', () => {
  it('formats a number as USD with two decimal places', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatNumber', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });
});

describe('formatDate', () => {
  it('formats an ISO date-time string as a short date', () => {
    expect(formatDate('2026-03-15T10:30:00')).toBe('Mar 15, 2026');
  });
});

describe('formatDateTime', () => {
  it('formats an ISO date-time string with a time component', () => {
    expect(formatDateTime('2026-03-15T10:30:00')).toMatch(/Mar 15, 2026, \d{1,2}:30/);
  });
});

describe('initialsOf', () => {
  it('takes the first letter of the first and last name', () => {
    expect(initialsOf('Jane Doe')).toBe('JD');
  });

  it('handles a single-word name', () => {
    expect(initialsOf('Cher')).toBe('C');
  });

  it('collapses extra whitespace', () => {
    expect(initialsOf('  Jane   Middle   Doe  ')).toBe('JD');
  });
});
