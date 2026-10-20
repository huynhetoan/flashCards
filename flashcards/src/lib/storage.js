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

function normalizeCard(card) {
  return {
    ...card,
    deck:
      typeof card.deck === "string" && card.deck.trim()
        ? card.deck.trim()
        : "General",
    flipped: typeof card.flipped === "boolean" ? card.flipped : false,
  };
}

export function loadCards() {
  try {
    const saved = localStorage.getItem(CARDS_STORAGE_KEY);

    // No saved data: start with the default cards.
    if (saved === null) {
      return DEFAULT_CARDS.map(normalizeCard);
    }

    const parsed = JSON.parse(saved);

    // Preserve a saved empty list and reject unexpected storage formats.
    if (!Array.isArray(parsed)) {
      return DEFAULT_CARDS.map(normalizeCard);
    }

    return parsed.map(normalizeCard);
  } catch {
    // Keep the app usable if storage access or JSON parsing fails.
    return DEFAULT_CARDS.map(normalizeCard);
  }
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

    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
    return true;
  } catch {
    // Storage may be unavailable or full; keep the app from crashing.
    return false;
  }
}