import { ItemDisplay } from "@/types/bswd";

function getSuggestionScore(
  item: ItemDisplay,
  functionalLimitations: string[],
): number {
  const calculatedScore = item.suggestionTags.reduce((prev, curr) => {
    if (functionalLimitations.includes(curr)) {
      return prev + 1;
    }
    return prev;
  }, 0);
  return calculatedScore;
}

function getItemsWithSuggestionScore(
  items: ItemDisplay[],
  functionalLimitations: string[],
) {
  const addedScore = items.map((item) => {
    return {
      ...item,
      suggestionScore: getSuggestionScore(item, functionalLimitations),
    };
  });
  return addedScore;
}

function shouldSuggestItem(
  suggestionTags: string[],
  functionalLimitations: string[],
) {
  for (const suggestionTag of suggestionTags) {
    for (const functionalLimitation of functionalLimitations) {
      if (suggestionTag === functionalLimitation) {
        return true;
      }
    }
  }
  return false;
}

export function getItemsWithSuggestion(
  functionalLimitations: string[],
  availableItem: ItemDisplay[],
) {
  const scoredItems = getItemsWithSuggestionScore(
    availableItem,
    functionalLimitations,
  );

  const sortedItemsByScore = scoredItems.sort((item1, item2) => {
    return item2.suggestionScore - item1.suggestionScore;
  });

  let seenFirstNotMatching = false;

  const addedSuggestionItems = sortedItemsByScore.map((item) => {
    // After seeing the first non matching, return normal item with
    // isSuggest = false as default
    // Useful: stop executing shouldSuggestItem function after seeing first non matching
    if (seenFirstNotMatching) return item;

    // Check if the item should be suggested
    const isSuggested = shouldSuggestItem(
      item.suggestionTags,
      functionalLimitations,
    );
    // First time seeing non matching
    if (isSuggested === false) {
      seenFirstNotMatching = true;
    }

    return {
      ...item,
      isSuggested: isSuggested,
    };
  });

  return addedSuggestionItems;
}
