import { useEffect, useRef, useState } from "react";
import "./index.css";
import CardList from "./components/CardList";
import AddForm from "./components/AddForm";
import StudyView from "./components/StudyView";
import { loadCards, saveCards } from "./lib/storage";

function readSavedDecks() {
  try {
    const saved = JSON.parse(localStorage.getItem("flashcardDecks"));

    if (Array.isArray(saved)) {
      return [
        "General",
        ...new Set(
          saved
            .filter((deck) => typeof deck === "string" && deck.trim())
            .map((deck) => deck.trim())
        ),
      ];
    }
  } catch {
    // Fall back to the General deck if saved deck data is unavailable.
  }

  return ["General"];
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem("flashcards-theme");

    if (["light", "dark", "system"].includes(savedTheme)) {
      return savedTheme;
    }
  } catch {
    // Use the system theme if storage is unavailable.
  }

  return "system";
}

function App() {
  const [cards, setCards] = useState(loadCards);
  const [decks, setDecks] = useState(readSavedDecks);
  const [studyMode, setStudyMode] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [renameFrom, setRenameFrom] = useState("General");
  const [renameTo, setRenameTo] = useState("");
  const [importError, setImportError] = useState("");
  const [theme, setTheme] = useState(getInitialTheme);

  const fileInputRef = useRef(null);

  // Apply the selected theme and preserve theme preferences separately.
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const applyTheme = () => {
      const systemPrefersDark = mediaQuery.matches;
      const resolvedTheme =
        theme === "system"
          ? systemPrefersDark
            ? "dark"
            : "light"
          : theme;

      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    try {
      localStorage.setItem("flashcards-theme", theme);
    } catch {
      // The theme still works for this session if storage is unavailable.
    }

    applyTheme();

    if (theme === "system") {
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", applyTheme);
      } else {
        mediaQuery.addListener(applyTheme);
      }
    }

    return () => {
      if (theme === "system") {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", applyTheme);
        } else {
          mediaQuery.removeListener(applyTheme);
        }
      }
    };
  }, [theme]);

  // Card persistence is handled by the storage module.
  // The helper protects unreadable saved data from automatic overwrites.
  useEffect(() => {
    saveCards(cards);
  }, [cards]);

  // Keep the existing deck persistence unchanged.
  useEffect(() => {
    try {
      localStorage.setItem("flashcardDecks", JSON.stringify(decks));
    } catch {
      // The app remains usable if deck storage is unavailable.
    }
  }, [decks]);

  // Ensure every card's deck is represented in the deck list.
  useEffect(() => {
    setDecks((previousDecks) => {
      const names = new Set(previousDecks);
      names.add("General");

      cards.forEach((card) => {
        const deck =
          typeof card.deck === "string" && card.deck.trim()
            ? card.deck.trim()
            : "General";

        names.add(deck);
      });

      if (
        names.size === previousDecks.length &&
        previousDecks.every((deck) => names.has(deck))
      ) {
        return previousDecks;
      }

      return [...names];
    });
  }, [cards]);

  const addCard = (front, back, deck) => {
    setCards((previousCards) => [
      ...previousCards,
      {
        id: Date.now(),
        front,
        back,
        deck: deck || "General",
        flipped: false,
      },
    ]);
  };

  const removeCard = (id) => {
    setCards((previousCards) =>
      previousCards.filter((card) => card.id !== id)
    );
  };

  const flipCard = (id) => {
    setCards((previousCards) =>
      previousCards.map((card) =>
        card.id === id
          ? { ...card, flipped: !card.flipped }
          : card
      )
    );
  };

  const editCard = (id, front, back) => {
    setCards((previousCards) =>
      previousCards.map((card) =>
        card.id === id ? { ...card, front, back } : card
      )
    );
  };

  const assignDeck = (id, deck) => {
    setCards((previousCards) =>
      previousCards.map((card) =>
        card.id === id ? { ...card, deck } : card
      )
    );
  };

  const shuffleCards = () => {
    setCards((previousCards) => {
      const shuffled = [...previousCards];

      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      return shuffled;
    });
  };

  const createDeck = (event) => {
    event.preventDefault();

    const name = newDeckName.trim();

    if (!name) {
      return;
    }

    if (
      decks.some((deck) => deck.toLowerCase() === name.toLowerCase())
    ) {
      setImportError(`The deck "${name}" already exists.`);
      return;
    }

    setDecks((previousDecks) => [...previousDecks, name]);
    setNewDeckName("");
    setImportError("");
  };

  const renameDeck = (event) => {
    event.preventDefault();

    const oldName = renameFrom;
    const newName = renameTo.trim();

    if (!newName || newName === oldName) {
      return;
    }

    if (
      decks.some(
        (deck) =>
          deck.toLowerCase() === newName.toLowerCase() &&
          deck !== oldName
      )
    ) {
      setImportError(`The deck "${newName}" already exists.`);
      return;
    }

    setCards((previousCards) =>
      previousCards.map((card) => {
        const cardDeck =
          typeof card.deck === "string" && card.deck.trim()
            ? card.deck.trim()
            : "General";

        return cardDeck === oldName
          ? { ...card, deck: newName }
          : card;
      })
    );

    setDecks((previousDecks) =>
      previousDecks.map((deck) =>
        deck === oldName ? newName : deck
      )
    );

    setRenameFrom(newName);
    setRenameTo("");
    setImportError("");
  };

  const exportCards = () => {
    const json = JSON.stringify(cards, null, 2);
    const blob = new Blob([json], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "flashcards-backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const importCards = async (event) => {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setImportError("");

    try {
      const text = await file.text();
      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error("The selected file is not valid JSON.");
      }

      if (!Array.isArray(parsed)) {
        throw new Error(
          "The JSON file must contain an array of cards."
        );
      }

      const seenIds = new Set();

      const validCards = parsed.map((card, index) => {
        if (
          !card ||
          typeof card !== "object" ||
          Array.isArray(card)
        ) {
          throw new Error(`Card ${index + 1} must be an object.`);
        }

        const validId =
          (typeof card.id === "string" && card.id.trim() !== "") ||
          (typeof card.id === "number" && Number.isFinite(card.id));

        if (!validId) {
          throw new Error(
            `Card ${index + 1} is missing a valid ID.`
          );
        }

        if (seenIds.has(card.id)) {
          throw new Error(
            `Card ${index + 1} has a duplicate ID.`
          );
        }

        seenIds.add(card.id);

        if (
          typeof card.front !== "string" ||
          !card.front.trim() ||
          typeof card.back !== "string" ||
          !card.back.trim()
        ) {
          throw new Error(
            `Card ${index + 1} must have a non-empty question and answer.`
          );
        }

        if (
          card.deck !== undefined &&
          (typeof card.deck !== "string" || !card.deck.trim())
        ) {
          throw new Error(
            `Card ${index + 1} has an invalid deck name.`
          );
        }

        if (
          card.flipped !== undefined &&
          typeof card.flipped !== "boolean"
        ) {
          throw new Error(
            `Card ${index + 1} has an invalid flipped value.`
          );
        }

        return {
          ...card,
          deck:
            typeof card.deck === "string" && card.deck.trim()
              ? card.deck.trim()
              : "General",
          flipped:
            typeof card.flipped === "boolean"
              ? card.flipped
              : false,
        };
      });

      const confirmed = window.confirm(
        `Import ${validCards.length} flashcard(s)? This will replace your current cards.`
      );

      if (!confirmed) {
        return;
      }

      setCards(validCards);

      setDecks((previousDecks) => [
        ...new Set([
          "General",
          ...previousDecks,
          ...validCards.map((card) => card.deck),
        ]),
      ]);

      setStudyMode(false);
      setImportError("");
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Import failed. Please check your JSON file."
      );
    } finally {
      input.value = "";
    }
  };

  return (
    <main>
      <header className="app-header">
        <h1>Flashcards</h1>

        <div className="theme-control">
          <label htmlFor="theme-select">Theme</label>

          <select
            id="theme-select"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </header>

      {studyMode ? (
        <StudyView
          cards={cards}
          onBack={() => setStudyMode(false)}
        />
      ) : (
        <>
          <div className="toolbar">
            <button onClick={shuffleCards}>Shuffle</button>

            <button onClick={() => setStudyMode(true)}>
              Study
            </button>

            <button onClick={exportCards}>Export JSON</button>

            <button onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>

            <input
              ref={fileInputRef}
              className="file-input-hidden"
              type="file"
              accept=".json,application/json"
              aria-label="Import flashcards JSON file"
              onChange={importCards}
            />
          </div>

          {importError && (
            <p className="app-error" role="alert">
              {importError}

              <button
                className="dismiss-error"
                type="button"
                onClick={() => setImportError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </p>
          )}

          <section className="deck-management">
            <h2>Manage decks</h2>

            <form onSubmit={createDeck}>
              <input
                value={newDeckName}
                onChange={(event) =>
                  setNewDeckName(event.target.value)
                }
                placeholder="New deck name"
                aria-label="New deck name"
                maxLength={80}
              />

              <button type="submit">Create deck</button>
            </form>

            <form onSubmit={renameDeck}>
              <select
                value={renameFrom}
                onChange={(event) =>
                  setRenameFrom(event.target.value)
                }
                aria-label="Deck to rename"
              >
                {decks.map((deck) => (
                  <option key={deck} value={deck}>
                    {deck}
                  </option>
                ))}
              </select>

              <input
                value={renameTo}
                onChange={(event) =>
                  setRenameTo(event.target.value)
                }
                placeholder="New deck name"
                aria-label="Renamed deck name"
                maxLength={80}
              />

              <button type="submit">Rename deck</button>
            </form>
          </section>

          <CardList
            cards={cards}
            decks={decks}
            onFlip={flipCard}
            onRemove={removeCard}
            onEdit={editCard}
            onAssignDeck={assignDeck}
          />

          <AddForm onAdd={addCard} decks={decks} />
        </>
      )}
    </main>
  );
}

export default App;