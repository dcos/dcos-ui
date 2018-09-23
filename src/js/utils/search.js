function favorBeginningOfTextScoring(extractedText, searchTerm) {
  if (!extractedText) {
    return 0;
  }

  extractedText = String(extractedText || "").toLowerCase();
  const pos = extractedText.indexOf(searchTerm.toLowerCase());
  if (pos === -1) {
    return 0;
  }

  // Exact matches are scored very high but otherwise
  // Longer searchTerms near the beginning of a value score highest.
  return searchTerm === extractedText
    ? 100 // ding
    : searchTerm.length / extractedText.length +
        (1 - pos / extractedText.length);
}

function scoreText(text, terms, f) {
  return terms.reduce((termScore, term) => {
    return termScore + f(text, term);
  }, 0);
}

export function tokenize(phrase) {
  if (!phrase) {
    return [];
  }

  return String(phrase).trim().toLowerCase().split(/[^\w/-]/).filter(Boolean);
}

// Filters and sorts an array according to search terms. Uses a simple relevance
// algorithm that scores longer tokens near the beginning of a value higher.
export default function search(
  searchString,
  objects,
  extractor,
  scoringFunction = favorBeginningOfTextScoring
) {
  return objects
    .map(obj => {
      // Wrap each object in an object that includes a score
      return {
        obj,
        score: scoreText(
          extractor(obj),
          tokenize(searchString),
          scoringFunction
        )
      };
    })
    .filter(obj => obj.score > 0) // Objects with a 0 score are not relevant
    .sort((a, b) => b.score - a.score); // Sort by score, descending
}
