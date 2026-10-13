import { useEffect, useState } from "react";

function AddForm({ onAdd, decks }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [deck, setDeck] = useState("General");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!decks.includes(deck)) {
      setDeck(decks.includes("General") ? "General" : decks[0] || "General");
    }
  }, [decks, deck]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const question = front.trim();
    const answer = back.trim();

    if (!question || !answer) {
      setError("Please enter both a question and an answer.");
      return;
    }

    onAdd(question, answer, deck || "General");
    setFront("");
    setBack("");
    setError("");
  };

  return (
    <section className="add-card-section">
      <h2>Add a flashcard</h2>

      <form className="add-form" onSubmit={handleSubmit}>
        <label>
          Question
          <input
            value={front}
            onChange={(event) => {
              setFront(event.target.value);
              setError("");
            }}
            placeholder="Enter question"
            maxLength={1000}
            required
          />
        </label>

        <label>
          Answer
          <input
            value={back}
            onChange={(event) => {
              setBack(event.target.value);
              setError("");
            }}
            placeholder="Enter answer"
            maxLength={1000}
            required
          />
        </label>

        <label>
          Deck
          <select
            value={deck}
            onChange={(event) => setDeck(event.target.value)}
          >
            {decks.map((deckName) => (
              <option key={deckName} value={deckName}>
                {deckName}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="edit-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit">Add card</button>
      </form>
    </section>
  );
}

export default AddForm;