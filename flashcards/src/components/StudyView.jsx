import { useEffect, useRef, useState } from "react";
import { Rating } from "ts-fsrs";
import {
  applyRating,
  previewRatings,
} from "../lib/scheduling";

const RATING_OPTIONS = [
  { label: "Again", rating: Rating.Again },
  { label: "Hard", rating: Rating.Hard },
  { label: "Good", rating: Rating.Good },
  { label: "Easy", rating: Rating.Easy },
];

function formatDueTime(schedule) {
  if (
    !schedule ||
    !(schedule.due instanceof Date) ||
    !Number.isFinite(schedule.due.getTime())
  ) {
    return "Due date unavailable";
  }

  return schedule.due.toLocaleString();
}

function getRatingPreviews(card) {
  if (!card?.schedule) {
    return null;
  }

  try {
    return previewRatings(card.schedule, new Date());
  } catch {
    return null;
  }
}

function StudyView({
  cards,
  reviewMode = false,
  onReviewRated,
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [ratingInProgress, setRatingInProgress] = useState(false);
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

      if (cards.length === 0 || (reviewMode && completed)) {
        return;
      }

      if (event.repeat && isSpace) {
        event.preventDefault();
        return;
      }

      if (reviewMode) {
        // In due review, Space can reveal the answer, but arrow keys
        // cannot skip a card before it has been rated.
        if (isSpace) {
          event.preventDefault();
          setShowBack((previousShowBack) => !previousShowBack);
        }
        return;
      }

      event.preventDefault();

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
  }, [cards.length, reviewMode, completed]);

  const toggleAnswer = () => {
    if (reviewMode && completed) {
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
  const ratingPreviews = reviewMode ? getRatingPreviews(card) : null;

  const rateCard = (ratingOption) => {
    if (
      !reviewMode ||
      !showBack ||
      !card ||
      completed ||
      ratingInProgress ||
      ratedCardIds.current.has(card.id) ||
      !onReviewRated
    ) {
      return;
    }

    // Lock this card immediately, before React re-renders, so a rapid
    // double-click cannot record two reviews for the same card.
    ratedCardIds.current.add(card.id);
    setRatingInProgress(true);

    try {
      const result = applyRating(
        card.schedule,
        ratingOption.rating,
        new Date()
      );

      onReviewRated(card.id, result.schedule, result.log);
      setShowBack(false);

      if (currentIndex >= cards.length - 1) {
        setCompleted(true);
      } else {
        setCurrentIndex((previousIndex) => previousIndex + 1);
      }
    } catch (error) {
      ratedCardIds.current.delete(card.id);
      console.error("Unable to record flashcard review:", error);
    } finally {
      setRatingInProgress(false);
    }
  };

  if (reviewMode && completed) {
    return (
      <section className="review-mode">
        <style>{`
          .review-mode .review-back-button {
            margin-top: 20px;
          }
        `}</style>

        <h1>Due-card review complete</h1>
        <p>You reviewed all cards in this queue.</p>
        <button
          type="button"
          className="review-back-button"
          onClick={onBack}
        >
          Back to list
        </button>
      </section>
    );
  }

  if (!card) {
    return (
      <section className={reviewMode ? "review-mode" : undefined}>
        <h1>{reviewMode ? "Due-card review" : "Study Mode"}</h1>
        <p>
          {reviewMode
            ? "There are no cards in this review queue."
            : "No flashcards to study yet."}
        </p>
        <button
          type="button"
          className={reviewMode ? "review-back-button" : undefined}
          onClick={onBack}
        >
          Back to list
        </button>
        {reviewMode && (
          <style>{`
            .review-mode .review-back-button {
              margin-top: 20px;
            }
          `}</style>
        )}
      </section>
    );
  }

  return (
    <section className={reviewMode ? "review-mode" : undefined}>
      {reviewMode && (
        <style>{`
          .review-mode .review-rating-controls {
            display: flex;
            flex-wrap: wrap;
            align-items: flex-start;
            gap: 12px;
          }

          .review-mode .review-rating-option {
            display: flex;
            flex: 1 1 110px;
            flex-direction: column;
            align-items: stretch;
            min-width: 0;
            gap: 6px;
          }

          .review-mode .review-rating-due {
            font-size: 0.875rem;
            line-height: 1.4;
            text-align: center;
            overflow-wrap: anywhere;
          }

          .review-mode .review-back-button {
            margin-top: 20px;
          }
        `}</style>
      )}

      <h1>{reviewMode ? "Due-card review" : "Study Mode"}</h1>

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

      {reviewMode ? (
        <>
          <p className="keyboard-hint">
            Reveal the answer before choosing a rating.
          </p>

          <div className="review-rating-controls">
            {RATING_OPTIONS.map((option) => {
              const preview = ratingPreviews?.[option.label];
              const disabled =
                !showBack ||
                ratingInProgress ||
                ratedCardIds.current.has(card.id) ||
                !preview;

              return (
                <div
                  className="review-rating-option"
                  key={option.label}
                >
                  <button
                    type="button"
                    onClick={() => rateCard(option)}
                    disabled={disabled}
                  >
                    {option.label}
                  </button>
                  <span className="review-rating-due">
                    {preview
                      ? `Due: ${formatDueTime(preview.schedule)}`
                      : "Due date unavailable"}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="review-back-button"
            onClick={onBack}
          >
            Back to list
          </button>
        </>
      ) : (
        <>
          <div className="study-controls">
            <button
              type="button"
              onClick={previousCard}
              disabled={currentIndex === 0}
            >
              Previous
            </button>

            <button
              type="button"
              onClick={nextCard}
              disabled={currentIndex === cards.length - 1}
            >
              Next
            </button>
          </div>

          <p className="keyboard-hint">
            Keyboard: Space reveals the answer · ← previous · → next
          </p>

          <button type="button" onClick={onBack}>
            Back to list
          </button>
        </>
      )}
    </section>
  );
}

export default StudyView;