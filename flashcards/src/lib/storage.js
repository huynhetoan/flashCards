import {
  createSchedule,
  deserializeSchedule,
  serializeSchedule,
} from "./scheduling";

const CARDS_STORAGE_KEY = "flashcards";

const DEFAULT_CARDS = [
  {
    id: 1,
    front: "What is React?",
    back: "A JavaScript UI library",
    flipped: false,
    deck: "General",
  },
  {
    id: 2,
    front: "What is Vite?",
    back: "A frontend build tool",
    flipped: false,
    deck: "General",
  },
  {
    id: 3,
    front: "What is JSX?",
    back: "JavaScript syntax for UI",
    flipped: false,
    deck: "General",
  },
];

function restoreReviewLog(log) {
  if (!log || typeof log !== "object" || Array.isArray(log)) {
    return log;
  }

  const restored = { ...log };

  for (const field of ["due", "review"]) {
    if (typeof restored[field] === "string") {
      const date = new Date(restored[field]);

      if (Number.isFinite(date.getTime())) {
        restored[field] = date;
      }
    }
  }

  return restored;
}

function normalizeCard(card) {
  const normalized = {
    ...card,
    deck:
      typeof card.deck === "string" && card.deck.trim()
        ? card.deck.trim()
        : "General",
    flipped: typeof card.flipped === "boolean" ? card.flipped : false,
  };

  if (card.schedule === undefined) {
    // Legacy cards receive one initial schedule.
    normalized.schedule = createSchedule(new Date());
  } else {
    try {
      normalized.schedule = deserializeSchedule(card.schedule);
    } catch {
      // Preserve invalid supplied data; never silently reset its schedule.
      normalized.schedule = card.schedule;
    }
  }

  if (card.reviewHistory === undefined) {
    normalized.reviewHistory = [];
  } else if (Array.isArray(card.reviewHistory)) {
    normalized.reviewHistory = card.reviewHistory.map(restoreReviewLog);
  } else {
    // Preserve malformed existing history rather than erasing it.
    normalized.reviewHistory = card.reviewHistory;
  }

  return normalized;
}

function defaultCards() {
  return DEFAULT_CARDS.map(normalizeCard);
}

export function loadCards() {
  try {
    const saved = localStorage.getItem(CARDS_STORAGE_KEY);

    if (saved === null) {
      return defaultCards();
    }

    const parsed = JSON.parse(saved);

    // Preserve a saved empty list and reject unexpected storage formats.
    if (!Array.isArray(parsed)) {
      return defaultCards();
    }

    return parsed.map(normalizeCard);
  } catch {
    // Keep the app usable if storage access or JSON parsing fails.
    return defaultCards();
  }
}

function serializeReviewLog(log) {
  if (!log || typeof log !== "object" || Array.isArray(log)) {
    return log;
  }

  return Object.fromEntries(
    Object.entries(log).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ])
  );
}

function serializeCard(card) {
  const serialized = {
    ...card,
    reviewHistory: Array.isArray(card.reviewHistory)
      ? card.reviewHistory.map(serializeReviewLog)
      : card.reviewHistory,
  };

  if (card.schedule !== undefined) {
    try {
      serialized.schedule = serializeSchedule(card.schedule);
    } catch {
      // Preserve invalid supplied data rather than silently resetting it.
      serialized.schedule = card.schedule;
    }
  }

  return serialized;
}

export function saveCards(cards) {
  try {
    const existing = localStorage.getItem(CARDS_STORAGE_KEY);

    // Do not overwrite saved data that cannot be read as a card array.
    if (existing !== null) {
      let parsed;

      try {
        parsed = JSON.parse(existing);
      } catch {
        return false;
      }

      if (!Array.isArray(parsed)) {
        return false;
      }
    }

    localStorage.setItem(
      CARDS_STORAGE_KEY,
      JSON.stringify(cards.map(serializeCard))
    );

    return true;
  } catch {
    // Storage may be unavailable or full; keep the app from crashing.
    return false;
  }
}