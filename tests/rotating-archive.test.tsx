// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RotatingArchive, buildArchiveFrames } from "../src/components/RotatingArchive";
import { photoArchive } from "../src/data/seed";

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

function activeCaption() {
  return document.querySelector(".archive-frame.is-active figcaption")?.textContent;
}

describe("RotatingArchive", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("distributes every archive image exactly once across a complete cycle", () => {
    const sources = buildArchiveFrames().flat().map((photo) => photo.src);
    expect(sources).toHaveLength(9);
    expect(new Set(sources)).toEqual(new Set(photoArchive.map((photo) => photo.src)));
  });

  it("advances after 12 seconds and pauses while hovered", () => {
    render(<RotatingArchive placement="today" />);
    const archive = screen.getByTestId("archive-today");
    expect(screen.getByText(/drinking the motion potion/i)).toBeTruthy();
    const firstCaption = activeCaption();

    act(() => vi.advanceTimersByTime(12_000));
    expect(activeCaption()).not.toBe(firstCaption);

    fireEvent.mouseEnter(archive);
    const pausedCaption = activeCaption();
    act(() => vi.advanceTimersByTime(24_000));
    expect(activeCaption()).toBe(pausedCaption);

    fireEvent.mouseLeave(archive);
    act(() => vi.advanceTimersByTime(12_000));
    expect(activeCaption()).not.toBe(pausedCaption);
  });

  it("stays on the first frame when reduced motion is enabled", () => {
    mockReducedMotion(true);
    render(<RotatingArchive placement="plan" />);
    const firstCaption = activeCaption();

    act(() => vi.advanceTimersByTime(36_000));
    expect(activeCaption()).toBe(firstCaption);
  });
});
