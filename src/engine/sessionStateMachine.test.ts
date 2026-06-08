import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getValidTransitions,
  isTerminalState,
  isActiveState,
} from './sessionStateMachine';
import type { SessionState } from '../types/session';

describe('sessionStateMachine', () => {
  describe('canTransition', () => {
    it('allows valid transitions from setup', () => {
      expect(canTransition('setup', 'running')).toBe(true);
    });

    it('denies invalid transitions from setup', () => {
      expect(canTransition('setup', 'paused')).toBe(false);
      expect(canTransition('setup', 'completed')).toBe(false);
      expect(canTransition('setup', 'abandoned')).toBe(false);
    });

    it('allows valid transitions from running', () => {
      expect(canTransition('running', 'paused')).toBe(true);
      expect(canTransition('running', 'completed')).toBe(true);
      expect(canTransition('running', 'abandoned')).toBe(true);
    });

    it('denies invalid transitions from running', () => {
      expect(canTransition('running', 'setup')).toBe(false);
    });

    it('allows valid transitions from paused', () => {
      expect(canTransition('paused', 'running')).toBe(true);
      expect(canTransition('paused', 'abandoned')).toBe(true);
    });

    it('denies invalid transitions from paused', () => {
      expect(canTransition('paused', 'setup')).toBe(false);
      expect(canTransition('paused', 'completed')).toBe(false);
    });

    it('denies all transitions from terminal states', () => {
      const terminalStates: SessionState[] = ['completed', 'abandoned'];
      const allStates: SessionState[] = ['setup', 'running', 'paused', 'completed', 'abandoned'];

      terminalStates.forEach((from) => {
        allStates.forEach((to) => {
          expect(canTransition(from, to)).toBe(false);
        });
      });
    });
  });

  describe('getValidTransitions', () => {
    it('returns correct transitions for each state', () => {
      expect(getValidTransitions('setup')).toEqual(['running']);
      expect(getValidTransitions('running')).toEqual(['paused', 'completed', 'abandoned']);
      expect(getValidTransitions('paused')).toEqual(['running', 'abandoned']);
      expect(getValidTransitions('completed')).toEqual([]);
      expect(getValidTransitions('abandoned')).toEqual([]);
    });
  });

  describe('isTerminalState', () => {
    it('correctly identifies terminal states', () => {
      expect(isTerminalState('setup')).toBe(false);
      expect(isTerminalState('running')).toBe(false);
      expect(isTerminalState('paused')).toBe(false);
      expect(isTerminalState('completed')).toBe(true);
      expect(isTerminalState('abandoned')).toBe(true);
    });
  });

  describe('isActiveState', () => {
    it('correctly identifies active states', () => {
      expect(isActiveState('setup')).toBe(false);
      expect(isActiveState('running')).toBe(true);
      expect(isActiveState('paused')).toBe(true);
      expect(isActiveState('completed')).toBe(false);
      expect(isActiveState('abandoned')).toBe(false);
    });
  });

});
