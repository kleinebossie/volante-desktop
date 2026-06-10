import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTrackProgress, useTrackProgressData } from './useTrackProgress';
import { renderHook } from '@testing-library/react';
import * as interpolatePath from '../utils/interpolatePath';
import { useSessionStore } from '../stores/sessionStore';

vi.mock('../utils/interpolatePath', () => ({
  getPointAtProgress: vi.fn(),
}));

describe('useTrackProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns DEFAULT_POINT when pathRef is null', () => {
    const { result } = renderHook(() => useTrackProgress(null, 0.5));
    expect(result.current).toEqual({ x: 0, y: 0, angle: 0 });
    expect(interpolatePath.getPointAtProgress).not.toHaveBeenCalled();
  });

  it('calls getPointAtProgress and returns its result when pathRef is provided', () => {
    const mockPoint = { x: 100, y: 200, angle: 45 };
    vi.mocked(interpolatePath.getPointAtProgress).mockReturnValue(mockPoint);

    const mockPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const { result } = renderHook(() => useTrackProgress(mockPathElement, 0.5));

    expect(interpolatePath.getPointAtProgress).toHaveBeenCalledWith(mockPathElement, 0.5);
    expect(result.current).toEqual(mockPoint);
  });

  it('memoizes the calculation until pathRef or lapProgress changes', () => {
    const mockPoint1 = { x: 100, y: 200, angle: 45 };
    const mockPoint2 = { x: 110, y: 210, angle: 50 };
    vi.mocked(interpolatePath.getPointAtProgress).mockReturnValueOnce(mockPoint1).mockReturnValueOnce(mockPoint2);

    const mockPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const { result, rerender } = renderHook(
      ({ path, progress }) => useTrackProgress(path, progress),
      { initialProps: { path: mockPathElement, progress: 0.5 } }
    );

    expect(interpolatePath.getPointAtProgress).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(mockPoint1);

    // Rerender with SAME props
    rerender({ path: mockPathElement, progress: 0.5 });
    expect(interpolatePath.getPointAtProgress).toHaveBeenCalledTimes(1);
    expect(result.current).toEqual(mockPoint1);

    // Rerender with DIFFERENT progress
    rerender({ path: mockPathElement, progress: 0.6 });
    expect(interpolatePath.getPointAtProgress).toHaveBeenCalledTimes(2);
    expect(result.current).toEqual(mockPoint2);
  });
});

describe('useTrackProgressData', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useSessionStore.getState().clearSession();
  });

  it('should return 0 when session is null', () => {
    const { result } = renderHook(() => useTrackProgressData());
    expect(result.current).toBe(0);
  });

  it('should return effectiveProgressSec when session is not null', () => {
    // Set a dummy session
    useSessionStore.setState({
      session: {
        effectiveProgressSec: 123.45,
      } as any // using any for partial mock of session
    });

    const { result } = renderHook(() => useTrackProgressData());
    expect(result.current).toBe(123.45);
  });
});
