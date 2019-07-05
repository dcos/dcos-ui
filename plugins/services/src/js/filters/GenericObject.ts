type Rec = Record<string, unknown>;

export function filterByObject(containing: Rec, shouldBePresent: Rec): boolean {
  const presentKeys = Object.keys(containing);
  const shouldBePresentEntries = Object.entries(shouldBePresent);

  return shouldBePresentEntries.every(([key, value]) =>
    presentKeys.includes(key) ? matches(containing[key], value) : false
  );
}

const matches = (a: unknown, b: unknown) =>
  isRecord(a) && isRecord(b) ? filterByObject(a, b) : a === b;

const isRecord = (a: unknown): a is Rec => typeof a === "object" && a !== null;
