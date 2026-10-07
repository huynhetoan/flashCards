import { useState } from "react";

function AddForm({ onAdd }) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!front || !back) return;

    onAdd(front, back);
    setFront("");
    setBack("");
  };

  return (
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
  );
}

export default AddForm;
