// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimer } from './useTimer';
import { useSessionStore } from '../stores/sessionStore';
import * as timerEngine from '../engine/timer';

// Mock the timer engine
vi.mock('../engine/timer', () => {
  return {
    createTimer: vi.fn(),
  };
});

describe('useTimer', () => {
  let mockTimer: any;
  let mockTick: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Set up mock timer
    mockTimer = {
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      isRunning: vi.fn().mockReturnValue(false),
      isPaused: vi.fn().mockReturnValue(false),
    };

    (timerEngine.createTimer as any).mockReturnValue(mockTimer);

    // Mock store state
    mockTick = vi.fn();
    useSessionStore.setState({
      session: null,
      tick: mockTick,
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and stop timer correctly on mount and unmount', () => {
    const { unmount } = renderHook(() => useTimer());

    expect(timerEngine.createTimer).toHaveBeenCalledTimes(1);

    // Unmount should stop the timer
    unmount();
    expect(mockTimer.stop).toHaveBeenCalled();
  });

  it('should call tick function using the created timer', () => {
    renderHook(() => useTimer());

    // Get the tick callback passed to createTimer
    const tickCallback = (timerEngine.createTimer as any).mock.calls[0][0];

    // The actual call to useSessionStore.getState().tick
    const realTick = vi.fn();
    useSessionStore.setState({ tick: realTick } as any);

    // Call it
    tickCallback(16);
    expect(realTick).toHaveBeenCalledWith(16);
  });

  it('should start timer when session is running', () => {
    const { rerender } = renderHook(() => useTimer());

    // Change state to running
    useSessionStore.setState({ session: { state: 'running' } } as any);
    rerender();

    expect(mockTimer.start).toHaveBeenCalled();
  });

  it('should resume timer if already running but paused', () => {
    mockTimer.isRunning.mockReturnValue(true);
    mockTimer.isPaused.mockReturnValue(true);

    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: { state: 'running' } } as any);
    rerender();

    expect(mockTimer.resume).toHaveBeenCalled();
  });

  it('should pause timer when session is paused', () => {
    mockTimer.isRunning.mockReturnValue(true);
    mockTimer.isPaused.mockReturnValue(false);

    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: { state: 'paused' } } as any);
    rerender();

    expect(mockTimer.pause).toHaveBeenCalled();
  });

  it('should stop timer when session is completed', () => {
    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: { state: 'completed' } } as any);
    rerender();

    expect(mockTimer.stop).toHaveBeenCalled();
  });

  it('should stop timer when session is abandoned', () => {
    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: { state: 'abandoned' } } as any);
    rerender();

    expect(mockTimer.stop).toHaveBeenCalled();
  });

  it('should stop timer when session state is null', () => {
    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: null } as any);
    rerender();

    expect(mockTimer.stop).toHaveBeenCalled();
  });

  it('should stop timer in setup state', () => {
    const { rerender } = renderHook(() => useTimer());

    useSessionStore.setState({ session: { state: 'setup' } } as any);
    rerender();

    expect(mockTimer.stop).toHaveBeenCalled();
  });
});
