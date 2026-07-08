import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { OfflineBanner } from './OfflineBanner';

function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', { configurable: true, value });
}

describe('OfflineBanner', () => {
  afterEach(() => {
    setOnline(true);
  });

  it('renders nothing while online', () => {
    setOnline(true);
    render(<OfflineBanner />);
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();
  });

  it('shows a warning banner when the browser goes offline, and hides it again when back online', () => {
    setOnline(true);
    render(<OfflineBanner />);

    act(() => {
      setOnline(false);
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByText(/you're offline/i)).toBeInTheDocument();

    act(() => {
      setOnline(true);
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.queryByText(/you're offline/i)).not.toBeInTheDocument();
  });
});
