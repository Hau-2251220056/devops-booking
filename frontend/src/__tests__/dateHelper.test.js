import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getNext6Days, formatDisplayDate, formatDateForApi } from '../utils/dateHelper';

describe('dateHelper', () => {
  beforeEach(() => {
    // Reset to a known date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15'));
  });

  describe('getNext6Days', () => {
    it('should return 6 consecutive days starting from today', () => {
      const days = getNext6Days();
      expect(days.length).toBe(6);
      expect(days[0].toDateString()).toContain('Jan 15');
    });

    it('should return dates in ascending order', () => {
      const days = getNext6Days();
      for (let i = 1; i < days.length; i++) {
        expect(days[i].getTime()).toBeGreaterThan(days[i - 1].getTime());
      }
    });
  });

  describe('formatDisplayDate', () => {
    it('should return "Hôm nay" for today', () => {
      const today = new Date('2024-01-15');
      const result = formatDisplayDate(today);
      expect(result).toContain('Hôm nay');
      expect(result).toContain('15');
    });

    it('should return day name and date for other days', () => {
      const futureDate = new Date('2024-01-16'); // Tuesday
      const result = formatDisplayDate(futureDate);
      expect(result).toMatch(/^T\d \d+$/);
    });
  });

  describe('formatDateForApi', () => {
    it('should format date to YYYY-MM-DD format', () => {
      const date = new Date('2024-01-15');
      const result = formatDateForApi(date);
      expect(result).toBe('2024-01-15');
    });

    it('should handle single digit months and days with padding', () => {
      const date = new Date('2024-02-05');
      const result = formatDateForApi(date);
      expect(result).toBe('2024-02-05');
    });

    it('should accept string dates', () => {
      const result = formatDateForApi('2024-01-15');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});
