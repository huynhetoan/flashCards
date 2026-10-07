import { useEffect, useState } from "react";
import "./index.css";
import CardList from "./components/CardList";
import AddForm from "./components/AddForm";
import StudyView from "./components/StudyView";

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

  const [studyMode, setStudyMode] = useState(false);

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

  const shuffleCards = () => {
    const shuffled = [...cards];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setCards(shuffled);
  };

  if (studyMode) {
    return (
      <main>
        <StudyView
          cards={cards}
          onBack={() => setStudyMode(false)}
        />
      </main>
    );
  }

  return (
    <main>
      <h1>Flashcards</h1>

      <button onClick={shuffleCards}>Shuffle</button>
      <button onClick={() => setStudyMode(true)}>Study</button>

      <CardList
        cards={cards}
        onFlip={flipCard}
        onRemove={removeCard}
      />

      <AddForm onAdd={addCard} />
    </main>
  );
}

export default App;