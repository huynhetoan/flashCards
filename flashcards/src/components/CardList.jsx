import Card from "./Card";

function CardList({ cards, onFlip, onRemove }) {
  return (
    <div className="cards">
      {cards.map((card) => (
        <Card
          key={card.id}
          card={card}
          onFlip={onFlip}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

export default CardList;