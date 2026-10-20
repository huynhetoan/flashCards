/**
 * Validate and normalize a JSON flashcard backup.
 *
 * This function is pure: it does not access React, localStorage, files,
 * dialogs, or other browser state.
 *
 * @param {string} jsonText The contents of a JSON backup file.
 * @returns {{ success: true, cards: object[] } | { success: false, error: string }}
 */
export function validateCardImportJson(jsonText) {
  if (typeof jsonText !== "string") {
    return {
      success: false,
      error: "The selected file contents must be text.",
    };
  }

  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return {
      success: false,
      error: "The selected file is not valid JSON.",
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      success: false,
      error: "The JSON file must contain an array of cards.",
    };
  }

  const seenIds = new Set();
  const cards = [];

  for (let index = 0; index < parsed.length; index += 1) {
    const card = parsed[index];
    const cardNumber = index + 1;

    if (!card || typeof card !== "object" || Array.isArray(card)) {
      return {
        success: false,
        error: `Card ${cardNumber} must be an object.`,
      };
    }

    const validId =
      (typeof card.id === "string" && card.id.trim() !== "") ||
      (typeof card.id === "number" && Number.isFinite(card.id));

    if (!validId) {
      return {
        success: false,
        error: `Card ${cardNumber} is missing a valid ID.`,
      };
    }

    if (seenIds.has(card.id)) {
      return {
        success: false,
        error: `Card ${cardNumber} has a duplicate ID.`,
      };
    }

    seenIds.add(card.id);

    if (
      typeof card.front !== "string" ||
      !card.front.trim() ||
      typeof card.back !== "string" ||
      !card.back.trim()
    ) {
      return {
        success: false,
        error: `Card ${cardNumber} must have a non-empty question and answer.`,
      };
    }

    if (
      card.deck !== undefined &&
      (typeof card.deck !== "string" || !card.deck.trim())
    ) {
      return {
        success: false,
        error: `Card ${cardNumber} has an invalid deck name.`,
      };
    }

    if (
      card.flipped !== undefined &&
      typeof card.flipped !== "boolean"
    ) {
      return {
        success: false,
        error: `Card ${cardNumber} has an invalid flipped value.`,
      };
    }

    // Preserve all existing fields while applying legacy defaults.
    cards.push({
      ...card,
      deck:
        typeof card.deck === "string" && card.deck.trim()
          ? card.deck.trim()
          : "General",
      flipped:
        typeof card.flipped === "boolean" ? card.flipped : false,
    });
  }

  return {
    success: true,
    cards,
  };
}