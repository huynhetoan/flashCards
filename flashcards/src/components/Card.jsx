function Card({ card, onFlip, onRemove }) {
  return (
    <div
      className="card"
      onClick={() => onFlip(card.id)}
    >
      <button
        className="delete"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(card.id);
        }}
      >
        x
      </button>

      {card.flipped ? card.back : card.front}
    </div>
  );
}

export default Card;