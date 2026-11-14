import { describe, expect, it } from "vitest";
import { MIN_EASE, preview, RELEARN_MINUTES, schedule } from "@/server/srs";

const fresh = { ease: 2.5, interval_days: 0, repetitions: 0, lapses: 0 };

describe("schedule", () => {
  it("grows Good intervals with the ease factor", () => {
    let state = fresh;
    const intervals: number[] = [];
    for (let step = 0; step < 4; step++) {
      const next = schedule(state, "good");
      intervals.push(next.state.interval_days);
      state = next.state;
    }
    expect(intervals).toEqual([1, 3, 8, 20]);
  });

  it("sends Again back to the queue and lowers the ease", () => {
    const next = schedule({ ease: 1.4, interval_days: 20, repetitions: 4, lapses: 0 }, "again");
    expect(next.delayMinutes).toBe(RELEARN_MINUTES);
    expect(next.state).toMatchObject({ repetitions: 0, lapses: 1, ease: MIN_EASE });
  });

  it("makes Easy longer than Good", () => {
    const state = { ...fresh, interval_days: 3, repetitions: 2 };
    expect(schedule(state, "easy").delayMinutes).toBeGreaterThan(schedule(state, "good").delayMinutes);
    expect(Object.keys(preview(fresh))).toEqual(["again", "hard", "good", "easy"]);
  });
});
