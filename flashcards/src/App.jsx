import { useEffect, useState } from "react";
import "./index.css";

const defaults = [
  { id: 1, front: "What is React?", back: "A JavaScript UI library", flipped: false },
  { id: 2, front: "What is Vite?", back: "A frontend build tool", flipped: false },
  { id: 3, front: "What is JSX?", back: "JavaScript syntax for UI", flipped: false },
];

function App() {
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem("flashcards");

    if (!saved) return defaults;

    try {
      return JSON.parse(saved);
    } catch {
      return defaults;
    }
  });

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  useEffect(() => {
    localStorage.setItem("flashcards", JSON.stringify(cards));
  }, [cards]);

  const addCard = (front, back) =>
    setCards([...cards, { id: Date.now(), front, back, flipped: false }]);

  const removeCard = (id) =>
    setCards(cards.filter((card) => card.id !== id));

  const flipCard = (id) =>
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, flipped: !card.flipped } : card
      )
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front || !back) return;

    addCard(front, back);
    setFront("");
    setBack("");
  };

  return (
    <main>
      <h1>Flashcards</h1>

      <div className="cards">
        {cards.map((card) => (
          <div
            key={card.id}
            className="card"
            onClick={() => flipCard(card.id)}
          >
            <button
              className="delete"
              onClick={(e) => {
                e.stopPropagation();
                removeCard(card.id);
              }}
            >
              x
            </button>
            {card.flipped ? card.back : card.front}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Front"
        />
        <input
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Back"
        />
        <button type="submit">Add</button>
      </form>
    </main>
  );
}

export default App;