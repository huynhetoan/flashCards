import { useEffect, useState } from "react";

function StudyView({ cards, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    setCurrentIndex((previousIndex) =>
      cards.length === 0
        ? 0
        : Math.min(previousIndex, cards.length - 1)
    );
    setShowBack(false);
  }, [cards.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isSpace = event.code === "Space" || event.key === " ";
      const isRight = event.key === "ArrowRight";
      const isLeft = event.key === "ArrowLeft";

      if (!isSpace && !isRight && !isLeft) return;

      if (cards.length === 0) return;

      // Prevent page scrolling only for study-mode controls.
      event.preventDefault();

      if (event.repeat && isSpace) return;

      if (isSpace) {
        setShowBack((previousShowBack) => !previousShowBack);
      } else if (isRight) {
        setCurrentIndex((previousIndex) =>
          Math.min(cards.length - 1, previousIndex + 1)
        );
        setShowBack(false);
      } else if (isLeft) {
        setCurrentIndex((previousIndex) =>
          Math.max(0, previousIndex - 1)
        );
        setShowBack(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cards.length]);

  const toggleAnswer = () => {
    setShowBack((previousShowBack) => !previousShowBack);
  };

  const nextCard = () => {
    setCurrentIndex((previousIndex) =>
      Math.min(cards.length - 1, previousIndex + 1)
    );
    setShowBack(false);
  };

  const previousCard = () => {
    setCurrentIndex((previousIndex) =>
      Math.max(0, previousIndex - 1)
    );
    setShowBack(false);
  };

  const card = cards[currentIndex];

  if (!card) {
    return (
      <>
        <h1>Study Mode</h1>
        <p>No flashcards to study yet.</p>
        <button onClick={onBack}>Back to list</button>
      </>
    );
  }

  return (
    <>
      <h1>Study Mode</h1>

      <div
        className="card study-card"
        onClick={toggleAnswer}
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Activate to reveal or hide the answer."
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            toggleAnswer();
          }
        }}
      >
        {showBack ? card.back : card.front}
      </div>

      <p className="study-counter">
        Card {currentIndex + 1} of {cards.length}
      </p>

      <div className="study-controls">
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
      </div>

      <p className="keyboard-hint">
        Keyboard: Space reveals the answer · ← previous · → next
      </p>

      <button onClick={onBack}>Back to list</button>
    </>
  );
}

export default StudyView;