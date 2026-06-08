import { describe, it, expect } from 'vitest';
import {
  formatMMSS,
  formatPenalty,
  formatMinutes,
  minutesToSeconds,
  secondsToMinutes,
} from './formatTime';

describe('formatTime utilities', () => {
  describe('formatMMSS', () => {
    it('formats standard durations', () => {
      expect(formatMMSS(90)).toBe('01:30');
      expect(formatMMSS(45)).toBe('00:45');
    });

    it('rolls hours into minutes', () => {
      expect(formatMMSS(3661)).toBe('61:01');
    });

    it('handles zero', () => {
      expect(formatMMSS(0)).toBe('00:00');
    });

    it('clamps negative values to zero', () => {
      expect(formatMMSS(-10)).toBe('00:00');
    });

    it('floors decimal values', () => {
      expect(formatMMSS(90.7)).toBe('01:30');
    });
  });

  describe('formatPenalty', () => {
    it('formats positive penalties', () => {
      expect(formatPenalty(10)).toBe('+10s');
    });

    it('formats negative penalties', () => {
      expect(formatPenalty(-10)).toBe('-10s');
    });

    it('formats zero penalty', () => {
      expect(formatPenalty(0)).toBe('+0s');
    });

    it('rounds decimal penalties', () => {
      expect(formatPenalty(10.6)).toBe('+11s');
      expect(formatPenalty(-10.6)).toBe('-11s');
    });
  });

  describe('formatMinutes', () => {
    it('formats durations less than 60 minutes', () => {
      expect(formatMinutes(25)).toBe('25 min');
    });

    it('formats exact hour multiples', () => {
      expect(formatMinutes(60)).toBe('1h');
      expect(formatMinutes(120)).toBe('2h');
    });

    it('formats durations over 60 minutes with remainder', () => {
      expect(formatMinutes(90)).toBe('1h 30m');
    });

    it('handles zero', () => {
      expect(formatMinutes(0)).toBe('0 min');
    });

    it('handles negative values (though unlikely in UI)', () => {
      expect(formatMinutes(-10)).toBe('-10 min');
    });
  });

  describe('minutesToSeconds', () => {
    it('converts standard minutes to seconds', () => {
      expect(minutesToSeconds(25)).toBe(1500);
    });

    it('handles zero', () => {
      expect(minutesToSeconds(0)).toBe(0);
    });

    it('handles decimal minutes', () => {
      expect(minutesToSeconds(1.5)).toBe(90);
    });
  });

  describe('secondsToMinutes', () => {
    it('converts standard seconds to minutes', () => {
      expect(secondsToMinutes(1500)).toBe(25);
    });

    it('handles zero', () => {
      expect(secondsToMinutes(0)).toBe(0);
    });

    it('floors remainder seconds', () => {
      expect(secondsToMinutes(89)).toBe(1);
    });

    it('handles negative values', () => {
      expect(secondsToMinutes(-10)).toBe(-1); // Math.floor(-0.16) is -1
    });
  });
});
