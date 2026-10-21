import test from "node:test";
import assert from "node:assert/strict";
import { Rating, State } from "ts-fsrs";

import {
  createSchedule,
  previewRatings,
  applyRating,
  isDue,
  serializeSchedule,
  deserializeSchedule,
} from "./scheduling.js";

const NOW = new Date("2026-01-15T12:00:00.000Z");

const RATINGS = [
  ["Again", Rating.Again],
  ["Hard", Rating.Hard],
  ["Good", Rating.Good],
  ["Easy", Rating.Easy],
];

function dateOffset(date, milliseconds) {
  return new Date(date.getTime() + milliseconds);
}

function snapshotSchedule(schedule) {
  return JSON.stringify(serializeSchedule(schedule));
}

function reviewedSchedule() {
  return applyRating(createSchedule(NOW), Rating.Good, NOW).schedule;
}

test("createSchedule creates a new schedule at the supplied time", () => {
  const schedule = createSchedule(NOW);

  assert.ok(schedule.due instanceof Date);
  assert.equal(schedule.due.getTime(), NOW.getTime());
  assert.equal(schedule.state, State.New);
  assert.equal(schedule.reps, 0);
  assert.equal(schedule.lapses, 0);
  assert.equal(schedule.last_review, undefined);
});

test("createSchedule requires a valid Date", () => {
  assert.throws(
    () => createSchedule("2026-01-15"),
    /now must be a valid Date/
  );

  assert.throws(
    () => createSchedule(new Date(NaN)),
    /now must be a valid Date/
  );
});

test("previewRatings returns a schedule and review log for all ratings", () => {
  const schedule = createSchedule(NOW);
  const before = snapshotSchedule(schedule);

  const previews = previewRatings(schedule, NOW);

  for (const [name, rating] of RATINGS) {
    assert.ok(previews[name], `Missing ${name} preview`);
    assert.ok(previews[name].schedule.due instanceof Date);
    assert.ok(previews[name].log.due instanceof Date);
    assert.ok(previews[name].log.review instanceof Date);
    assert.equal(previews[name].log.rating, rating);
    assert.equal(previews[name].log.review.getTime(), NOW.getTime());
  }

  assert.equal(snapshotSchedule(schedule), before);
});

test("previewRatings rejects an invalid schedule or time", () => {
  assert.throws(
    () => previewRatings({}, NOW),
    /Schedule due must be a valid Date/
  );

  assert.throws(
    () => previewRatings(createSchedule(NOW), "not a date"),
    /now must be a valid Date/
  );
});

test("applyRating supports Again, Hard, Good, and Easy", async (t) => {
  for (const [name, rating] of RATINGS) {
    await t.test(name, () => {
      const schedule = createSchedule(NOW);
      const before = snapshotSchedule(schedule);

      const result = applyRating(schedule, rating, NOW);

      assert.ok(result.schedule.due instanceof Date);
      assert.ok(result.log.due instanceof Date);
      assert.ok(result.log.review instanceof Date);
      assert.equal(result.log.rating, rating);
      assert.equal(result.log.review.getTime(), NOW.getTime());
      assert.equal(result.schedule.reps, 1);
      assert.equal(snapshotSchedule(schedule), before);
    });
  }
});

test("applyRating rejects unsupported ratings and invalid dates", () => {
  const schedule = createSchedule(NOW);

  assert.throws(
    () => applyRating(schedule, Rating.Manual, NOW),
    /Rating must be/
  );

  assert.throws(
    () => applyRating(schedule, 99, NOW),
    /Rating must be/
  );

  assert.throws(
    () => applyRating(schedule, Rating.Good, new Date(NaN)),
    /now must be a valid Date/
  );
});

test("isDue handles before, equal-to, and after due-time boundaries", () => {
  const schedule = createSchedule(NOW);
  schedule.due = dateOffset(NOW, 60_000);

  assert.equal(
    isDue(schedule, dateOffset(NOW, 59_999)),
    false,
    "A card is not due just before its due time"
  );

  assert.equal(
    isDue(schedule, dateOffset(NOW, 60_000)),
    true,
    "A card is due exactly at its due time"
  );

  assert.equal(
    isDue(schedule, dateOffset(NOW, 60_001)),
    true,
    "A card remains due after its due time"
  );
});

test("isDue rejects invalid schedules and dates", () => {
  assert.throws(
    () => isDue({}, NOW),
    /Schedule due must be a valid Date/
  );

  assert.throws(
    () => isDue(createSchedule(NOW), new Date(NaN)),
    /now must be a valid Date/
  );
});

test("serializeSchedule omits undefined last_review for a never-reviewed card", () => {
  const schedule = createSchedule(NOW);
  const before = snapshotSchedule(schedule);
  const serialized = serializeSchedule(schedule);

  assert.equal(serialized.due, schedule.due.toISOString());
  assert.equal(Object.hasOwn(serialized, "last_review"), false);
  assert.equal(snapshotSchedule(schedule), before);

  // Even if a caller provides an own optional property with undefined,
  // serialization should treat it as absent.
  const withUndefinedLastReview = {
    ...schedule,
    last_review: undefined,
  };

  const serializedWithUndefined = serializeSchedule(
    withUndefinedLastReview
  );

  assert.equal(
    Object.hasOwn(serializedWithUndefined, "last_review"),
    false
  );
});

test("serializeSchedule converts reviewed-card Date fields to ISO strings", () => {
  const schedule = reviewedSchedule();
  const before = snapshotSchedule(schedule);
  const serialized = serializeSchedule(schedule);

  assert.equal(serialized.due, schedule.due.toISOString());
  assert.equal(
    serialized.last_review,
    schedule.last_review.toISOString()
  );
  assert.equal(snapshotSchedule(schedule), before);
});

test("never-reviewed schedule round-trips as an object and through JSON", () => {
  const original = createSchedule(NOW);
  const serialized = serializeSchedule(original);

  // Object round trip.
  const restoredObject = deserializeSchedule(serialized);

  assert.ok(restoredObject.due instanceof Date);
  assert.equal(restoredObject.due.getTime(), original.due.getTime());
  assert.equal(restoredObject.last_review, undefined);
  assert.equal(Object.hasOwn(restoredObject, "last_review"), false);

  // JSON round trip.
  const restoredJson = deserializeSchedule(JSON.stringify(serialized));

  assert.ok(restoredJson.due instanceof Date);
  assert.equal(restoredJson.due.getTime(), original.due.getTime());
  assert.equal(restoredJson.last_review, undefined);
  assert.equal(Object.hasOwn(restoredJson, "last_review"), false);

  for (const field of [
    "stability",
    "difficulty",
    "elapsed_days",
    "scheduled_days",
    "learning_steps",
    "reps",
    "lapses",
    "state",
  ]) {
    assert.equal(restoredJson[field], original[field], field);
  }
});

test("reviewed schedule round-trips and preserves review history", () => {
  const original = reviewedSchedule();
  const serialized = serializeSchedule(original);

  assert.equal(
    serialized.last_review,
    original.last_review.toISOString()
  );

  const restoredObject = deserializeSchedule(serialized);
  const restoredJson = deserializeSchedule(JSON.stringify(serialized));

  for (const restored of [restoredObject, restoredJson]) {
    assert.ok(restored.due instanceof Date);
    assert.ok(restored.last_review instanceof Date);
    assert.equal(restored.due.getTime(), original.due.getTime());
    assert.equal(
      restored.last_review.getTime(),
      original.last_review.getTime()
    );
    assert.equal(restored.reps, original.reps);
    assert.equal(restored.lapses, original.lapses);
    assert.equal(restored.state, original.state);
    assert.equal(restored.stability, original.stability);
    assert.equal(restored.difficulty, original.difficulty);
  }
});

test("deserializeSchedule accepts an own last_review property set to undefined", () => {
  const serialized = {
    ...serializeSchedule(createSchedule(NOW)),
    last_review: undefined,
  };

  const restored = deserializeSchedule(serialized);

  assert.ok(restored.due instanceof Date);
  assert.equal(restored.last_review, undefined);
  assert.equal(Object.hasOwn(restored, "last_review"), false);
});

test("deserializeSchedule rejects malformed stored data", async (t) => {
  const validNeverReviewed = serializeSchedule(createSchedule(NOW));
  const validReviewed = serializeSchedule(reviewedSchedule());

  const cases = [
    {
      name: "invalid JSON",
      data: "{not-json",
      error: /not valid JSON/,
    },
    {
      name: "JSON null",
      data: "null",
      error: /must be an object/,
    },
    {
      name: "missing due date",
      data: (() => {
        const { due, ...rest } = validNeverReviewed;
        return rest;
      })(),
      error: /due must be an ISO date string/,
    },
    {
      name: "invalid due date",
      data: { ...validNeverReviewed, due: "not-a-date" },
      error: /due must be a valid ISO date string/,
    },
    {
      name: "non-canonical due date",
      data: { ...validNeverReviewed, due: "2026-01-15" },
      error: /due must be a valid ISO date string/,
    },
    {
      name: "invalid supplied last review",
      data: { ...validReviewed, last_review: "not-a-date" },
      error: /last_review must be a valid ISO date string/,
    },
    {
      name: "null supplied last review",
      data: { ...validReviewed, last_review: null },
      error: /last_review must be an ISO date string/,
    },
    {
      name: "missing stability",
      data: (() => {
        const { stability, ...rest } = validNeverReviewed;
        return rest;
      })(),
      error: /Schedule stability must be a finite number/,
    },
    {
      name: "invalid state",
      data: { ...validNeverReviewed, state: 99 },
      error: /Schedule state is invalid/,
    },
    {
      name: "invalid reps",
      data: { ...validNeverReviewed, reps: "zero" },
      error: /Schedule reps must be a finite number/,
    },
    {
      name: "array instead of object",
      data: [],
      error: /must be an object/,
    },
  ];

  for (const item of cases) {
    await t.test(item.name, () => {
      assert.throws(
        () => deserializeSchedule(item.data),
        item.error
      );
    });
  }
});

test("a restored never-reviewed schedule can receive its first review", () => {
  const original = createSchedule(NOW);
  const restored = deserializeSchedule(
    JSON.stringify(serializeSchedule(original))
  );

  const result = applyRating(
    restored,
    Rating.Good,
    dateOffset(NOW, 1_000)
  );

  assert.equal(result.schedule.reps, 1);
  assert.equal(result.log.rating, Rating.Good);
  assert.equal(
    result.log.review.getTime(),
    dateOffset(NOW, 1_000).getTime()
  );
  assert.ok(result.schedule.due instanceof Date);
  assert.ok(result.schedule.last_review instanceof Date);
  assert.equal(original.reps, 0);
  assert.equal(original.last_review, undefined);
});

test("a restored reviewed schedule can be reviewed again", () => {
  const firstReview = applyRating(
    createSchedule(NOW),
    Rating.Good,
    NOW
  );

  const restored = deserializeSchedule(
    JSON.stringify(serializeSchedule(firstReview.schedule))
  );

  const secondReviewTime = dateOffset(
    NOW,
    30 * 24 * 60 * 60 * 1000
  );

  const secondReview = applyRating(
    restored,
    Rating.Easy,
    secondReviewTime
  );

  assert.equal(secondReview.schedule.reps, 2);
  assert.equal(secondReview.log.rating, Rating.Easy);
  assert.equal(
    secondReview.log.review.getTime(),
    secondReviewTime.getTime()
  );
  assert.ok(secondReview.schedule.due instanceof Date);
  assert.ok(secondReview.schedule.last_review instanceof Date);
  assert.equal(
    restored.last_review.getTime(),
    firstReview.schedule.last_review.getTime()
  );
});

test("deserialization and review do not mutate their inputs", () => {
  const original = reviewedSchedule();
  const serialized = serializeSchedule(original);
  const serializedBefore = JSON.stringify(serialized);
  const restored = deserializeSchedule(serialized);
  const restoredBefore = snapshotSchedule(restored);

  applyRating(
    restored,
    Rating.Hard,
    dateOffset(NOW, 24 * 60 * 60 * 1000)
  );

  assert.equal(JSON.stringify(serialized), serializedBefore);
  assert.equal(snapshotSchedule(restored), restoredBefore);
});