import Card from "./Card";

function CardList({ cards, onFlip, onRemove, onEdit }) {
return ( <div className="cards">
{cards.map((card) => ( <Card
       key={card.id}
       card={card}
       onFlip={onFlip}
       onRemove={onRemove}
       onEdit={onEdit}
     />
))} </div>
);
}

export default CardList;
