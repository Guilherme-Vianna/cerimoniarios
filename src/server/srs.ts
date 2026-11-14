import type { Rating } from "@/lib/api/types";

export const MIN_EASE = 1.3;
export const DEFAULT_EASE = 2.5;
export const RELEARN_MINUTES = 10;
const MAX_INTERVAL_DAYS = 365;
const MINUTES_PER_DAY = 1440;

export const RATINGS: Rating[] = ["again", "hard", "good", "easy"];

export type CardState = { ease: number; interval_days: number; repetitions: number; lapses: number };

export type Schedule = { state: CardState; delayMinutes: number };

function days(value: number) {
  return Math.max(1, Math.min(MAX_INTERVAL_DAYS, Math.round(value)));
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export function schedule(state: CardState, rating: Rating): Schedule {
  if (rating === "again") {
    return {
      state: {
        ease: Math.max(MIN_EASE, round2(state.ease - 0.2)),
        interval_days: 0,
        repetitions: 0,
        lapses: state.lapses + 1,
      },
      delayMinutes: RELEARN_MINUTES,
    };
  }

  let ease = state.ease;
  let interval: number;
  if (rating === "hard") {
    ease = Math.max(MIN_EASE, state.ease - 0.15);
    interval = state.repetitions ? days(state.interval_days * 1.2) : 1;
  } else if (rating === "good") {
    interval =
      state.repetitions === 0 ? 1 : state.repetitions === 1 ? 3 : days(state.interval_days * state.ease);
  } else {
    ease = state.ease + 0.15;
    interval = state.repetitions === 0 ? 4 : days(state.interval_days * state.ease * 1.3);
  }

  return {
    state: { ease: round2(ease), interval_days: interval, repetitions: state.repetitions + 1, lapses: state.lapses },
    delayMinutes: interval * MINUTES_PER_DAY,
  };
}

export function preview(state: CardState): Record<Rating, number> {
  return Object.fromEntries(RATINGS.map((rating) => [rating, schedule(state, rating).delayMinutes])) as Record<
    Rating,
    number
  >;
}
