import { useEffect, useRef, useState } from "react";
import { Rating } from "ts-fsrs";
import {
  applyRating,
  previewRatings,
} from "../lib/scheduling";

function formatDueTime(schedule) {
  const due = schedule?.due;

  if (!(due instanceof Date) || !Number.isFinite(due.getTime())) {
    return "Unavailable";
  }

  return due.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function StudyView({
  cards,
  onBack,
  reviewMode = false,
  onRecordReview,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [ratingInProgress, setRatingInProgress] = useState(false);

  // Holds the ID of a card that has already been rated in this session.
  // It deliberately stays set for that card after its rating succeeds.
  const ratedCardIds = useRef(new Set());

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

      if (!isSpace && !isRight && !isLeft) {
        return;
      }

      if (cards.length === 0 || completed) {
        return;
      }

      // Prevent page scrolling only for study-mode controls.
      event.preventDefault();

      if (event.repeat && isSpace) {
        return;
      }

      if (isSpace) {
        setShowBack((previousShowBack) => !previousShowBack);
      } else if (!reviewMode && isRight) {
        setCurrentIndex((previousIndex) =>
          Math.min(cards.length - 1, previousIndex + 1)
        );
        setShowBack(false);
      } else if (!reviewMode && isLeft) {
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
  }, [cards.length, completed, reviewMode]);

  const toggleAnswer = () => {
    if (completed || ratingInProgress) {
      return;
    }

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

  const rateCard = (label) => {
    if (
      !reviewMode ||
      !showBack ||
      !card ||
      completed ||
      ratingInProgress ||
      ratedCardIds.current.has(card.id) ||
      typeof onRecordReview !== "function"
    ) {
      return;
    }

    const ratingValues = {
      Again: Rating.Again,
      Hard: Rating.Hard,
      Good: Rating.Good,
      Easy: Rating.Easy,
    };

    const rating = ratingValues[label];

    if (rating === undefined) {
      return;
    }

    // Lock this card synchronously, before any React state update.
    ratedCardIds.current.add(card.id);
    setRatingInProgress(true);

    try {
      const result = applyRating(card.schedule, rating, new Date());

      // Record one schedule update and one review log for this card.
      onRecordReview(card.id, result.schedule, result.log);

      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((index) => index + 1);
        setShowBack(false);
      }
    } catch (error) {
      // Allow a retry only if the rating operation failed.
      ratedCardIds.current.delete(card.id);
      console.error("Unable to record FSRS review:", error);
    } finally {
      setRatingInProgress(false);
    }
  };

  if (reviewMode && completed) {
    return (
      <>
        <h1>Due-card review complete</h1>

        <p role="status">
          You reviewed all {cards.length} card
          {cards.length === 1 ? "" : "s"} in this session. Cards will return
          when they are next due.
        </p>

        <button onClick={onBack}>Back to list</button>
      </>
    );
  }

  if (!card) {
    return (
      <>
        <h1>{reviewMode ? "Review due cards" : "Study Mode"}</h1>

        <p>
          {reviewMode
            ? "No due cards in this review session."
            : "No flashcards to study yet."}
        </p>

        <button onClick={onBack}>Back to list</button>
      </>
    );
  }

  let ratingPreviews = null;

  if (reviewMode && card.schedule) {
    try {
      ratingPreviews = previewRatings(card.schedule, new Date());
    } catch (error) {
      console.error("Unable to preview FSRS ratings:", error);
    }
  }

  return (
    <>
      <h1>{reviewMode ? "Review due cards" : "Study Mode"}</h1>

      {reviewMode && (
        <p className="study-counter">
          Due card {currentIndex + 1} of {cards.length}
        </p>
      )}

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

      {!reviewMode && (
        <>
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
        </>
      )}

      {reviewMode && !showBack && (
        <p className="keyboard-hint">
          Reveal the answer before rating this card. Press Space or select the
          card to reveal it.
        </p>
      )}

      {reviewMode && showBack && (
        <section className="study-controls" aria-label="Rate your recall">
          {["Again", "Hard", "Good", "Easy"].map((label) => (
            <button
              key={label}
              type="button"
              disabled={
                ratingInProgress ||
                ratedCardIds.current.has(card.id) ||
                !ratingPreviews
              }
              onClick={() => rateCard(label)}
            >
              {label}

              {ratingPreviews && (
                <span>
                  {" "}
                  · {formatDueTime(ratingPreviews[label].schedule)}
                </span>
              )}
            </button>
          ))}
        </section>
      )}

      <button onClick={onBack} disabled={ratingInProgress}>
        Back to list
      </button>
    </>
  );
}

export default StudyView;