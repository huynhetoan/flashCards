import {
  createEmptyCard,
  fsrs,
  Rating,
  State,
} from "ts-fsrs";

// Keep FSRS defaults while explicitly disabling scheduling fuzz.
const scheduler = fsrs({ enable_fuzz: false });

const RATING_NAMES = {
  [Rating.Again]: "Again",
  [Rating.Hard]: "Hard",
  [Rating.Good]: "Good",
  [Rating.Easy]: "Easy",
};

const REQUIRED_NUMBER_FIELDS = [
  "stability",
  "difficulty",
  "elapsed_days",
  "scheduled_days",
  "learning_steps",
  "reps",
  "lapses",
];

const VALID_STATES = new Set([
  State.New,
  State.Learning,
  State.Review,
  State.Relearning,
]);

function requireDate(value, name) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(`${name} must be a valid Date.`);
  }

  return value;
}

function cloneDate(date) {
  return new Date(date.getTime());
}

function validateSchedule(schedule) {
  if (
    !schedule ||
    typeof schedule !== "object" ||
    Array.isArray(schedule)
  ) {
    throw new TypeError("Schedule must be an object.");
  }

  if (
    !(schedule.due instanceof Date) ||
    !Number.isFinite(schedule.due.getTime())
  ) {
    throw new TypeError("Schedule due must be a valid Date.");
  }

  for (const field of REQUIRED_NUMBER_FIELDS) {
    if (
      typeof schedule[field] !== "number" ||
      !Number.isFinite(schedule[field])
    ) {
      throw new TypeError(
        `Schedule ${field} must be a finite number.`
      );
    }
  }

  if (!VALID_STATES.has(schedule.state)) {
    throw new TypeError("Schedule state is invalid.");
  }

  // last_review is optional for a never-reviewed card. If supplied,
  // it must be a valid Date; an own property set to undefined is absent.
  if (
    schedule.last_review !== undefined &&
    (!(schedule.last_review instanceof Date) ||
      !Number.isFinite(schedule.last_review.getTime()))
  ) {
    throw new TypeError(
      "Schedule last_review must be a valid Date when provided."
    );
  }
}

function cloneSchedule(schedule) {
  validateSchedule(schedule);

  const {
    last_review: lastReview,
    ...fields
  } = schedule;

  return {
    ...fields,
    due: cloneDate(schedule.due),
    ...(lastReview !== undefined
      ? { last_review: cloneDate(lastReview) }
      : {}),
  };
}

function validateRating(rating) {
  if (!Object.hasOwn(RATING_NAMES, rating)) {
    throw new RangeError(
      "Rating must be Rating.Again, Rating.Hard, Rating.Good, or Rating.Easy."
    );
  }
}

function validateSerializedDate(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${name} must be an ISO date string.`);
  }

  const date = new Date(value);

  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString() !== value
  ) {
    throw new TypeError(`${name} must be a valid ISO date string.`);
  }

  return date;
}

/**
 * Create a new FSRS card schedule at the supplied time.
 *
 * @param {Date} now
 * @returns {import("ts-fsrs").Card}
 */
export function createSchedule(now) {
  requireDate(now, "now");

  return createEmptyCard(cloneDate(now));
}

/**
 * Preview each supported rating without changing the supplied schedule.
 *
 * Each rating entry has the shape { schedule, log }.
 *
 * @param {import("ts-fsrs").Card} schedule
 * @param {Date} now
 * @returns {Record<string, {schedule: import("ts-fsrs").Card, log: import("ts-fsrs").ReviewLog}>}
 */
export function previewRatings(schedule, now) {
  requireDate(now, "now");

  const input = cloneSchedule(schedule);
  const preview = scheduler.repeat(input, cloneDate(now));
  const result = {};

  for (const [ratingValue, name] of Object.entries(RATING_NAMES)) {
    const item = preview[Number(ratingValue)];

    if (!item) {
      throw new Error(`FSRS did not return a preview for ${name}.`);
    }

    result[name] = {
      schedule: cloneSchedule(item.card),
      log: {
        ...item.log,
        due: cloneDate(item.log.due),
        review: cloneDate(item.log.review),
      },
    };
  }

  return result;
}

/**
 * Apply one FSRS rating.
 *
 * @param {import("ts-fsrs").Card} schedule
 * @param {import("ts-fsrs").Rating} rating
 * @param {Date} now
 * @returns {{schedule: import("ts-fsrs").Card, log: import("ts-fsrs").ReviewLog}}
 */
export function applyRating(schedule, rating, now) {
  requireDate(now, "now");
  validateRating(rating);

  const input = cloneSchedule(schedule);
  const result = scheduler.next(input, cloneDate(now), rating);

  return {
    schedule: cloneSchedule(result.card),
    log: {
      ...result.log,
      due: cloneDate(result.log.due),
      review: cloneDate(result.log.review),
    },
  };
}

/**
 * A card is due at or before the supplied time.
 *
 * @param {import("ts-fsrs").Card} schedule
 * @param {Date} now
 * @returns {boolean}
 */
export function isDue(schedule, now) {
  requireDate(now, "now");
  validateSchedule(schedule);

  return schedule.due.getTime() <= now.getTime();
}

/**
 * Return a JSON-safe schedule object with Date fields represented as ISO strings.
 * Optional last_review is omitted when the card has never been reviewed.
 *
 * @param {import("ts-fsrs").Card} schedule
 * @returns {Record<string, unknown>}
 */
export function serializeSchedule(schedule) {
  const copy = cloneSchedule(schedule);
  const {
    last_review: lastReview,
    ...fields
  } = copy;

  return {
    ...fields,
    due: copy.due.toISOString(),
    ...(lastReview !== undefined
      ? { last_review: lastReview.toISOString() }
      : {}),
  };
}

/**
 * Restore a schedule from a serialized object or its JSON string.
 * Invalid or incomplete schedules throw instead of resetting review history.
 *
 * @param {Record<string, unknown> | string} data
 * @returns {import("ts-fsrs").Card}
 */
export function deserializeSchedule(data) {
  let parsed = data;

  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      throw new TypeError("Stored schedule is not valid JSON.");
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new TypeError("Stored schedule must be an object.");
  }

  const {
    last_review: lastReview,
    ...fields
  } = parsed;

  const restored = {
    ...fields,
    due: validateSerializedDate(parsed.due, "Schedule due"),
  };

  // An absent or undefined optional field means the card has not been
  // reviewed. Any other supplied value must be a valid ISO date string.
  if (lastReview !== undefined) {
    restored.last_review = validateSerializedDate(
      lastReview,
      "Schedule last_review"
    );
  }

  validateSchedule(restored);

  return restored;
}