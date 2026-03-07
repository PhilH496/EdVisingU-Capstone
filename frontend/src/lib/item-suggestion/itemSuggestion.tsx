import { ItemDisplay } from "@/types/bswd";

function getSuggestionScore(
  item: ItemDisplay,
  functionalLimitations: string[],
): number {
  // Check if there are common elements in functionalLimitations and leastRequirements
  const limitationSet = new Set(functionalLimitations);
  const leastRequirementsSet = new Set(item.leastRequirements);
  if (limitationSet.intersection(leastRequirementsSet).size !== 0) {
    return 0;
  }

  // Don't have any in common
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

function shouldSuggestItem(item: ItemDisplay, functionalLimitations: string[]) {
  // Check if there are common elements in functionalLimitations and leastRequirements
  const limitationSet = new Set(functionalLimitations);
  const leastRequirementsSet = new Set(item.leastRequirements);
  if (limitationSet.intersection(leastRequirementsSet).size !== 0) {
    return false;
  }

  for (const suggestionTag of item.suggestionTags) {
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
    const isSuggested = shouldSuggestItem(item, functionalLimitations);
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
