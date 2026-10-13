import { useEffect, useState } from "react";
import Card from "./Card";

function CardList({
  cards,
  decks,
  onFlip,
  onRemove,
  onEdit,
  onAssignDeck,
}) {
  const [search, setSearch] = useState("");
  const [selectedDeck, setSelectedDeck] = useState("All decks");

  useEffect(() => {
    if (
      selectedDeck !== "All decks" &&
      !decks.includes(selectedDeck)
    ) {
      setSelectedDeck("All decks");
    }
  }, [decks, selectedDeck]);

  const query = search.trim().toLowerCase();

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query);

    const matchesDeck =
      selectedDeck === "All decks" ||
      (card.deck || "General") === selectedDeck;

    return matchesSearch && matchesDeck;
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