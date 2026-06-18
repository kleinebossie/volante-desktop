import { describe, expect, it } from 'vitest';
import { TRACKS, getTrackById, getTrackByLayoutId } from './index';
import { TRACK_CATALOG } from './trackCatalog';
import { TRACK_PATHS } from './trackPaths';

describe('tracks index', () => {
  it('re-exports the track catalog', () => {
    expect(TRACKS).toBe(TRACK_CATALOG);
    expect(TRACKS.length).toBe(24);
  });

  describe('getTrackById', () => {
    it('finds a track by its id', () => {
      const monaco = getTrackById('monaco');
      expect(monaco).toBeDefined();
      expect(monaco!.name).toBe('Circuit de Monaco');
      expect(monaco!.lapTimeSec).toBe(76);
    });

    it('returns undefined for an unknown id', () => {
      expect(getTrackById('nonexistent')).toBeUndefined();
    });
  });

  describe('getTrackByLayoutId', () => {
    it('finds a track by its layout id', () => {
      const silverstone = getTrackByLayoutId('silverstone-8');
      expect(silverstone).toBeDefined();
      expect(silverstone!.id).toBe('silverstone');
    });

    it('returns undefined for an unknown layout id', () => {
      expect(getTrackByLayoutId('silverstone')).toBeUndefined(); // id, not layoutId
      expect(getTrackByLayoutId('nope-99')).toBeUndefined();
    });
  });
});

describe('TRACK_CATALOG invariants', () => {
  it('has unique track ids', () => {
    const ids = TRACK_CATALOG.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique layout ids', () => {
    const layoutIds = TRACK_CATALOG.map((t) => t.layoutId);
    expect(new Set(layoutIds).size).toBe(layoutIds.length);
  });

  it('resolves a non-empty SVG path for every track', () => {
    for (const track of TRACK_CATALOG) {
      expect(TRACK_PATHS[track.layoutId], `missing path for ${track.layoutId}`).toBeTruthy();
      expect(track.svgPathD.length).toBeGreaterThan(0);
      expect(track.svgPathD).toBe(TRACK_PATHS[track.layoutId]);
    }
  });

  it('has a valid startOffset in [0, 1) for every track', () => {
    for (const track of TRACK_CATALOG) {
      expect(track.startOffset).toBeGreaterThanOrEqual(0);
      expect(track.startOffset).toBeLessThan(1);
    }
  });

  it('has a positive lap time for every track', () => {
    for (const track of TRACK_CATALOG) {
      expect(track.lapTimeSec).toBeGreaterThan(0);
    }
  });

  it('has all required display metadata populated', () => {
    for (const track of TRACK_CATALOG) {
      expect(track.name.length).toBeGreaterThan(0);
      expect(track.countryId.length).toBeGreaterThan(0);
      expect(track.countryName.length).toBeGreaterThan(0);
      expect(track.flagEmoji.length).toBeGreaterThan(0);
      expect(track.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof track.reversed).toBe('boolean');
    }
  });
});

describe('TRACK_PATHS', () => {
  it('every path string starts with a move command', () => {
    for (const [layoutId, d] of Object.entries(TRACK_PATHS)) {
      expect(d.length, `empty path for ${layoutId}`).toBeGreaterThan(0);
      expect(d.trimStart()[0].toLowerCase(), `path ${layoutId} should start with m`).toBe('m');
    }
  });
});
