import {
  createSchedule,
  deserializeSchedule,
} from "./scheduling";

function validateReviewHistory(history, cardNumber) {
  if (history === undefined) {
    return { success: true, history: [] };
  }

  if (!Array.isArray(history)) {
    return {
      success: false,
      error: `Card ${cardNumber} has invalid review history.`,
    };
  }

  for (const log of history) {
    if (!log || typeof log !== "object" || Array.isArray(log)) {
      return {
        success: false,
        error: `Card ${cardNumber} has an invalid review-history entry.`,
      };
    }

    for (const field of ["due", "review"]) {
      if (log[field] !== undefined) {
        if (
          typeof log[field] !== "string" ||
          log[field].trim() === ""
        ) {
          return {
            success: false,
            error: `Card ${cardNumber} has an invalid ${field} date in its review history.`,
          };
        }

        const date = new Date(log[field]);

        if (!Number.isFinite(date.getTime())) {
          return {
            success: false,
            error: `Card ${cardNumber} has an invalid ${field} date in its review history.`,
          };
        }
      }
    }
  }

  return { success: true, history };
}

/**
 * Validate and normalize a JSON flashcard backup.
 *
 * This function is pure: it does not access React, localStorage, files,
 * dialogs, or other browser state.
 *
 * @param {string} jsonText
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

    let schedule;

    if (card.schedule === undefined) {
      // Accept legacy backups and initialize their schedules once on import.
      schedule = createSchedule(new Date());
    } else {
      try {
        schedule = deserializeSchedule(card.schedule);
      } catch {
        return {
          success: false,
          error: `Card ${cardNumber} has invalid scheduling data. No cards were imported.`,
        };
      }
    }

    const historyResult = validateReviewHistory(
      card.reviewHistory,
      cardNumber
    );

    if (!historyResult.success) {
      return historyResult;
    }

    cards.push({
      ...card,
      deck:
        typeof card.deck === "string" && card.deck.trim()
          ? card.deck.trim()
          : "General",
      flipped: typeof card.flipped === "boolean" ? card.flipped : false,
      schedule,
      reviewHistory: historyResult.history,
    });
  }

  return {
    success: true,
    cards,
  };
}