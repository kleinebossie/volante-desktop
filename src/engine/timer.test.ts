// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimer } from './timer';

describe('createTimer', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let rafIdCounter = 0;

  const rafMock = vi.fn((cb: FrameRequestCallback) => {
    rafIdCounter++;
    rafCallbacks.push(cb);
    return rafIdCounter;
  });

  const cafMock = vi.fn((id: number) => {
    // Simply clear callbacks or record call
  });

  beforeEach(() => {
    rafCallbacks = [];
    rafIdCounter = 0;
    vi.stubGlobal('requestAnimationFrame', rafMock);
    vi.stubGlobal('cancelAnimationFrame', cafMock);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function triggerFrame(timestamp: number) {
    const list = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of list) {
      cb(timestamp);
    }
  }

  it('should start timer and call requestAnimationFrame', () => {
    const onTick = vi.fn();
    const timer = createTimer(onTick);

    expect(timer.isRunning()).toBe(false);
    expect(timer.isPaused()).toBe(false);

    timer.start();

    expect(timer.isRunning()).toBe(true);
    expect(timer.isPaused()).toBe(false);
    expect(rafMock).toHaveBeenCalledTimes(1);

    // First frame (baseline)
    triggerFrame(1000);
    expect(onTick).not.toHaveBeenCalled();
    expect(rafMock).toHaveBeenCalledTimes(2);

    // Second frame (tick with delta)
    triggerFrame(1016);
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenLastCalledWith(16);
    expect(rafMock).toHaveBeenCalledTimes(3);
  });

  it('should stop timer and cancel animation frame', () => {
    const onTick = vi.fn();
    const timer = createTimer(onTick);

    timer.start();
    triggerFrame(1000);
    triggerFrame(1016);

    expect(onTick).toHaveBeenCalledTimes(1);

    timer.stop();
    expect(timer.isRunning()).toBe(false);
    expect(timer.isPaused()).toBe(false);
    expect(cafMock).toHaveBeenCalledTimes(1);

    // Triggering a frame after stopping should not tick or queue more frames
    triggerFrame(1032);
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(rafCallbacks.length).toBe(0);
  });

  it('should pause and resume without massive delta time', () => {
    const onTick = vi.fn();
    const timer = createTimer(onTick);

    timer.start();
    triggerFrame(1000);
    triggerFrame(1016);
    expect(onTick).toHaveBeenLastCalledWith(16);

    // Pause timer
    timer.pause();
    expect(timer.isPaused()).toBe(true);

    // Frame occurs while paused
    triggerFrame(1032);
    expect(onTick).toHaveBeenCalledTimes(1); // not called again

    // Resume timer
    timer.resume();
    expect(timer.isPaused()).toBe(false);

    // First frame after resume sets new baseline
    triggerFrame(2000); // long pause gap!
    expect(onTick).toHaveBeenCalledTimes(1); // no tick call

    // Second frame after resume ticks with normal delta
    triggerFrame(2016);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenLastCalledWith(16); // small delta, not 1000ms cap
  });

  it('should cap deltaMs at 1000ms', () => {
    const onTick = vi.fn();
    const timer = createTimer(onTick);

    timer.start();
    triggerFrame(1000);
    triggerFrame(2500); // 1500ms jump

    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenLastCalledWith(1000); // capped
  });

  it('should ignore duplicate starts, pauses, resumes', () => {
    const onTick = vi.fn();
    const timer = createTimer(onTick);

    // Duplicate start
    timer.start();
    timer.start();
    expect(rafMock).toHaveBeenCalledTimes(1);

    // Pause when stopped
    const timer2 = createTimer(onTick);
    timer2.pause();
    expect(timer2.isPaused()).toBe(false);

    // Resume when stopped
    timer2.resume();
    expect(timer2.isPaused()).toBe(false);
  });
});
