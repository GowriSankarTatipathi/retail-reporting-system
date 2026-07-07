import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Ensure each test starts from a clean DOM - React Testing Library does not do
// this automatically outside of its Jest integration.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia, which MUI's theme (light/dark, responsive
// breakpoints) reads from. Stub it so components using useMediaQuery don't throw.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom does not implement ResizeObserver, which Recharts' ResponsiveContainer
// depends on.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: ResizeObserverStub,
});
