import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestLog } from "@/components/quest-log";

let intersectionCallback: IntersectionObserverCallback | undefined;

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [0.15];

  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

const observerInstance = {
  root: null,
  rootMargin: "",
  thresholds: [0.15],
  disconnect() {},
  observe() {},
  unobserve() {},
  takeRecords: () => [],
} satisfies IntersectionObserver;

describe("trilha de missões", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
    intersectionCallback = undefined;
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("conclui a missão ao visitar a seção e persiste o XP", () => {
    render(
      <>
        <QuestLog />
        <section data-quest-id="sobre">Sobre</section>
      </>,
    );

    expect(screen.getByRole("link", { name: /conhecer a dev/i })).toHaveAttribute("href", "#sobre");
    const section = screen.getByText("Sobre");

    act(() =>
      intersectionCallback?.(
        [
          {
            target: section,
            isIntersecting: true,
            intersectionRatio: 1,
            boundingClientRect: section.getBoundingClientRect(),
            intersectionRect: section.getBoundingClientRect(),
            rootBounds: null,
            time: 0,
          },
        ],
        observerInstance,
      ),
    );

    expect(
      screen.getByRole("progressbar", { name: "Missões do portfólio concluídas" }),
    ).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByText("+25 XP")).toBeInTheDocument();
    expect(window.localStorage.getItem("livia-portfolio-quests-v1")).toBe('["sobre"]');
    expect(screen.getByText("Missão concluída: Conhecer a dev. +25 XP")).toBeInTheDocument();
  });
});
