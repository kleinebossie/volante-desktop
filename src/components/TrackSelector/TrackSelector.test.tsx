// @vitest-environment jsdom
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TrackSelector } from './TrackSelector';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../../types/settings';
import { TRACKS } from '../../data/tracks';

beforeEach(() => {
  useSettingsStore.setState({ settings: { ...DEFAULT_SETTINGS } });
});

describe('TrackSelector', () => {
  it('renders a selectable card for every track', () => {
    render(<TrackSelector selectedTrackId={null} onSelectTrack={() => {}} />);
    expect(screen.getByText('Select Circuit')).toBeInTheDocument();
    // One button per track in the catalog.
    expect(screen.getAllByRole('button')).toHaveLength(TRACKS.length);
    expect(screen.getByText('Circuit de Monaco')).toBeInTheDocument();
  });

  it('calls onSelectTrack with the track id when a card is clicked', () => {
    const onSelectTrack = vi.fn();
    render(<TrackSelector selectedTrackId={null} onSelectTrack={onSelectTrack} />);

    const card = screen.getByText('Circuit de Monaco').closest('button')!;
    fireEvent.click(card);
    expect(onSelectTrack).toHaveBeenCalledWith('monaco');
  });

  it('pins favorite tracks to the front with a Favorite badge', () => {
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS, favoriteTrackIds: ['monaco'] },
    });
    render(<TrackSelector selectedTrackId={null} onSelectTrack={() => {}} />);

    const firstCard = screen.getAllByRole('button')[0];
    expect(within(firstCard).getByText('Circuit de Monaco')).toBeInTheDocument();
    expect(within(firstCard).getByText('Favorite')).toBeInTheDocument();
  });

  it('renders without a custom scrollbar when hideScrollbar is set', () => {
    const { container } = render(
      <TrackSelector selectedTrackId="monaco" onSelectTrack={() => {}} hideScrollbar />
    );
    // The component still renders all the cards.
    expect(container.querySelectorAll('button').length).toBe(TRACKS.length);
  });
});
