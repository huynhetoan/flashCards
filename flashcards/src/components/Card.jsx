import { useState } from "react";

function Card({ card, onFlip, onRemove, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [frontDraft, setFrontDraft] = useState(card.front);
  const [backDraft, setBackDraft] = useState(card.back);
  const [error, setError] = useState("");

  const startEditing = (event) => {
    event.stopPropagation();
    setFrontDraft(card.front);
    setBackDraft(card.back);
    setError("");
    setIsEditing(true);
  };

  const cancelEditing = (event) => {
    event.stopPropagation();
    setFrontDraft(card.front);
    setBackDraft(card.back);
    setError("");
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const front = frontDraft.trim();
    const back = backDraft.trim();

    if (!front || !back) {
      setError("Question and answer cannot be empty.");
      return;
    }

    onEdit(card.id, front, back);
    setError("");
    setIsEditing(false);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onRemove(card.id);
  };

  if (isEditing) {
    return (
      <div
        className="card editing-card"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          className="edit-form"
          onSubmit={handleSave}
          onClick={(event) => event.stopPropagation()}
        >
          <label>
            Question
            <textarea
              value={frontDraft}
              onChange={(event) => {
                setFrontDraft(event.target.value);
                setError("");
              }}
              rows={3}
              autoFocus
            />
          </label>

          <label>
            Answer
            <textarea
              value={backDraft}
              onChange={(event) => {
                setBackDraft(event.target.value);
                setError("");
              }}
              rows={3}
            />
          </label>

          {error && (
            <p className="edit-error" role="alert">
              {error}
            </p>
          )}

          <div className="edit-actions">
            <button type="submit">Save</button>
            <button
              type="button"
              className="cancel-edit"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card" onClick={() => onFlip(card.id)}>
      <button
        className="delete"
        type="button"
        aria-label="Delete flashcard"
        onClick={handleDelete}
      >
        x
      </button>

      <button
        className="edit"
        type="button"
        aria-label="Edit flashcard"
        onClick={startEditing}
      >
        Edit
      </button>

      <span className="card-content">
        {card.flipped ? card.back : card.front}
      </span>
    </div>
  );
}

export default Card;