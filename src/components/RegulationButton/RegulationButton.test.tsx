// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RegulationButton } from './RegulationButton';
import type { RegulationState } from '../../engine/regulationsEngine';

function renderButton(overrides: Partial<React.ComponentProps<typeof RegulationButton>> = {}) {
  const onActivate = vi.fn();
  const props: React.ComponentProps<typeof RegulationButton> = {
    icon: '⚡',
    label: 'BOOST',
    accentColor: '#ffcc00',
    state: 'available' as RegulationState,
    cooldownProgress: 0,
    cooldownRemainingSec: 0,
    activeProgress: 0,
    activeRemainingSec: 0,
    remainingUses: 3,
    onActivate,
    ...overrides,
  };
  const result = render(<RegulationButton {...props} />);
  return { ...result, onActivate };
}

describe('RegulationButton', () => {
  it('renders the icon, label, and state text', () => {
    renderButton();
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('BOOST')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'BOOST regulation' })).toBeInTheDocument();
  });

  it('is clickable and fires onActivate only when available', () => {
    const { onActivate } = renderButton({ state: 'available' });
    fireEvent.click(screen.getByRole('button'));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('is disabled in non-available states', () => {
    const { onActivate } = renderButton({ state: 'cooldown', cooldownRemainingSec: 12 });
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('shows remaining uses when limited and hides them when unlimited', () => {
    const { rerender } = renderButton({ remainingUses: 2 });
    expect(screen.getByText('Uses left: 2')).toBeInTheDocument();

    rerender(
      <RegulationButton
        icon="⚡"
        label="BOOST"
        accentColor="#ffcc00"
        state="available"
        cooldownProgress={0}
        cooldownRemainingSec={0}
        activeProgress={0}
        activeRemainingSec={0}
        remainingUses={null}
        onActivate={() => {}}
      />
    );
    expect(screen.queryByText(/Uses left/)).not.toBeInTheDocument();
  });

  it('shows the active countdown and a progress bar when active', () => {
    const { container } = renderButton({
      state: 'active',
      activeRemainingSec: 8.2,
      activeProgress: 0.6,
    });
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('9s')).toBeInTheDocument(); // ceil(8.2)
    expect(container.querySelector('[role="presentation"]')).not.toBeNull();
  });

  it('shows the cooldown countdown and a progress bar when on cooldown', () => {
    const { container } = renderButton({
      state: 'cooldown',
      cooldownRemainingSec: 4.1,
      cooldownProgress: 0.3,
    });
    expect(screen.getByText('Cooldown')).toBeInTheDocument();
    expect(screen.getByText('5s')).toBeInTheDocument(); // ceil(4.1)
    expect(container.querySelector('[role="presentation"]')).not.toBeNull();
  });

  it('does not render a bar or time when locked or depleted', () => {
    const { container } = renderButton({ state: 'locked' });
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(container.querySelector('[role="presentation"]')).toBeNull();
  });
});
