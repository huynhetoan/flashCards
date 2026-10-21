
import { useEffect, useState } from "react";
import Card from "./Card";
import { isDue } from "../lib/scheduling";

const DECK_FILTER_STORAGE_KEY = "flashcards-selected-deck";

function getInitialSelectedDeck(decks) {
  try {
    const savedDeck = localStorage.getItem(DECK_FILTER_STORAGE_KEY);

    if (savedDeck === "All decks" || decks.includes(savedDeck)) {
      return savedDeck;
    }
  } catch {
    // Fall back to All decks if storage is unavailable.
  }

  return "All decks";
}

function getDueTime(card) {
  const due = card?.schedule?.due;

  if (!(due instanceof Date) || !Number.isFinite(due.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return due.getTime();
}

function CardList({
  cards,
  decks,
  onFlip,
  onRemove,
  onEdit,
  onAssignDeck,
  onReviewDue,
}) {
  const [search, setSearch] = useState("");
  const [selectedDeck, setSelectedDeck] = useState(() =>
    getInitialSelectedDeck(decks)
  );

  useEffect(() => {
    if (
      selectedDeck !== "All decks" &&
      !decks.includes(selectedDeck)
    ) {
      setSelectedDeck("All decks");

      try {
        localStorage.setItem(DECK_FILTER_STORAGE_KEY, "All decks");
      } catch {
        // The filter remains usable for this session.
      }

      return;
    }

    try {
      localStorage.setItem(DECK_FILTER_STORAGE_KEY, selectedDeck);
    } catch {
      // The filter remains usable for this session.
    }
  }, [decks, selectedDeck]);

  const query = search.trim().toLowerCase();

  const matchesSelectedDeck = (card) =>
    selectedDeck === "All decks" ||
    (card.deck || "General") === selectedDeck;

  // Due-card review is scoped to the selected deck, not the text search.
  const dueCards = cards
    .filter((card) => {
      if (!matchesSelectedDeck(card) || !card.schedule) {
        return false;
      }

      try {
        return isDue(card.schedule, new Date());
      } catch {
        // Invalid schedules are not considered due.
        return false;
      }
    })
    .sort((a, b) => getDueTime(a) - getDueTime(b));

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query);

    return matchesSearch && matchesSelectedDeck(card);
  });

  return (
    <section className="card-list">
      <div className="list-filters">
        <input
          className="search-input"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search questions and answers..."
          aria-label="Search flashcards"
        />

        <select
          className="deck-filter"
          value={selectedDeck}
          onChange={(event) => setSelectedDeck(event.target.value)}
          aria-label="Filter cards by deck"
        >
          <option value="All decks">All decks</option>

          {decks.map((deck) => (
            <option key={deck} value={deck}>
              {deck}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar">
        <button
          type="button"
          disabled={dueCards.length === 0}
          onClick={() => onReviewDue(dueCards)}
        >
          Review due cards ({dueCards.length})
        </button>
      </div>

      <p className="results-count" aria-live="polite">
        Showing {filteredCards.length} of {cards.length} cards
      </p>

      {filteredCards.length === 0 ? (
        <div className="empty-state" role="status">
          {cards.length === 0
            ? "No flashcards yet. Add a card to get started."
            : "No cards match your search and deck filter. Try changing them."}
        </div>
      ) : (
        <div className="cards">
          {filteredCards.map((card) => (
            <div className="card-list-item" key={card.id}>
              <Card
                card={card}
                onFlip={onFlip}
                onRemove={onRemove}
                onEdit={onEdit}
              />

              <label className="card-deck-assignment">
                Deck

                <select
                  value={card.deck || "General"}
                  onChange={(event) =>
                    onAssignDeck(card.id, event.target.value)
                  }
                  aria-label={`Deck for ${card.front}`}
                >
                  {decks.map((deck) => (
                    <option key={deck} value={deck}>
                      {deck}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default CardList;
