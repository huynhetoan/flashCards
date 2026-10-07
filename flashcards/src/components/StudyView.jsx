import { useState } from "react";

function StudyView({ cards, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  const card = cards[currentIndex];

  if (!card) {
    return <button onClick={onBack}>Back to list</button>;
  }

  const nextCard = () => {
    setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
    setShowBack(false);
  };

  const previousCard = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
    setShowBack(false);
  };

  return (
    <>
      <h1>Study Mode</h1>

      <div
        className="card"
        onClick={() => setShowBack(!showBack)}
      >
        {showBack ? card.back : card.front}
      </div>

      <p>
        Card {currentIndex + 1} of {cards.length}
      </p>

      <button
        onClick={previousCard}
        disabled={currentIndex === 0}
      >
        Previous
      </button>

      <button
        onClick={nextCard}
        disabled={currentIndex === cards.length - 1}
      >
        Next
      </button>

      <br />
      <button onClick={onBack}>Back to list</button>
    </>
  );
}

export default StudyView;