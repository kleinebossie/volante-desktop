import { describe, expect, it } from 'vitest';
import {
  calculateEffectiveProgress,
  calculateLapInfo,
  calculateOverallProgress,
  calculateRemainingSec,
} from './progressCalculator';

describe('progressCalculator', () => {
  describe('calculateEffectiveProgress', () => {
    it('calculates normal progress at 1x pace', () => {
      expect(calculateEffectiveProgress(1000, 1.0, 0)).toBe(1);
      expect(calculateEffectiveProgress(5000, 1.0, 0)).toBe(5);
    });

    it('applies pace multipliers correctly', () => {
      expect(calculateEffectiveProgress(1000, 2.0, 0)).toBe(2);
      expect(calculateEffectiveProgress(1000, 0.5, 0)).toBe(0.5);
    });

    it('subtracts penalties from progress', () => {
      expect(calculateEffectiveProgress(10000, 1.0, 3)).toBe(7);
      expect(calculateEffectiveProgress(10000, 2.0, 5)).toBe(15);
    });

    it('clamps progress to a minimum of 0', () => {
      expect(calculateEffectiveProgress(1000, 1.0, 5)).toBe(0);
      expect(calculateEffectiveProgress(0, 1.0, 10)).toBe(0);
    });
  });

  describe('calculateLapInfo', () => {
    const TARGET_DURATION = 1500; // 25 mins
    const LAP_TIME = 75; // 20 laps total

    it('returns Lap 1 at the very start', () => {
      const info = calculateLapInfo(0, TARGET_DURATION, LAP_TIME);
      expect(info.currentLap).toBe(1);
      expect(info.lapProgress).toBe(0);
      expect(info.totalLaps).toBe(20);
    });

    it('calculates mid-lap progress correctly', () => {
      // Halfway through first lap (75s / 2 = 37.5s)
      const info = calculateLapInfo(37.5, TARGET_DURATION, LAP_TIME);
      expect(info.currentLap).toBe(1);
      expect(info.lapProgress).toBe(0.5);
    });

    it('transitions to the next lap correctly', () => {
      // Exactly at the start of lap 2
      const info = calculateLapInfo(75, TARGET_DURATION, LAP_TIME);
      expect(info.currentLap).toBe(2);
      expect(info.lapProgress).toBe(0);
    });

    it('clamps to total laps at the end of the session', () => {
      const info = calculateLapInfo(1500, TARGET_DURATION, LAP_TIME);
      expect(info.currentLap).toBe(20);
      // At exactly target duration, it might show 0 progress of a hypothetical next lap,
      // but currentLap is clamped to totalLaps.
      expect(info.lapProgress).toBe(0);
    });

    it('handles exceeding target duration gracefully', () => {
      const info = calculateLapInfo(1600, TARGET_DURATION, LAP_TIME);
      expect(info.currentLap).toBe(20);
      expect(info.totalLaps).toBe(20);
    });

    it('adapts to different lap times', () => {
      // Monaco: 76s lap -> 1500/76 = 19.7 -> 20 laps
      const monaco = calculateLapInfo(0, 1500, 76);
      expect(monaco.totalLaps).toBe(20);

      // Spa: 107s lap -> 1500/107 = 14.01 -> 15 laps
      const spa = calculateLapInfo(0, 1500, 107);
      expect(spa.totalLaps).toBe(15);
    });
  });

  describe('calculateOverallProgress', () => {
    it('returns 0 at the start', () => {
      expect(calculateOverallProgress(0, 1000)).toBe(0);
    });

    it('calculates progress fraction correctly', () => {
      expect(calculateOverallProgress(500, 1000)).toBe(0.5);
      expect(calculateOverallProgress(250, 1000)).toBe(0.25);
    });

    it('returns 1.0 when target reached', () => {
      expect(calculateOverallProgress(1000, 1000)).toBe(1);
    });

    it('clamps progress between 0 and 1', () => {
      expect(calculateOverallProgress(-10, 1000)).toBe(0);
      expect(calculateOverallProgress(1100, 1000)).toBe(1);
    });

    it('handles zero target duration', () => {
      expect(calculateOverallProgress(100, 0)).toBe(0);
    });
  });

  describe('calculateRemainingSec', () => {
    it('calculates remaining time correctly', () => {
      expect(calculateRemainingSec(0, 1500)).toBe(1500);
      expect(calculateRemainingSec(500, 1500)).toBe(1000);
      expect(calculateRemainingSec(1500, 1500)).toBe(0);
    });

    it('clamps remaining time to 0', () => {
      expect(calculateRemainingSec(1600, 1500)).toBe(0);
    });
  });
});
