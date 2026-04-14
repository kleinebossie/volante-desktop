import type { Track } from '../../types/track';
import { TRACK_CATALOG } from './trackCatalog';

export const TRACKS: Track[] = TRACK_CATALOG;

export function getTrackById(id: string): Track | undefined {
  return TRACKS.find(t => t.id === id);
}

export function getTrackByLayoutId(layoutId: string): Track | undefined {
  return TRACKS.find(t => t.layoutId === layoutId);
}
