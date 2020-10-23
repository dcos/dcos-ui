import Transaction from "#SRC/js/structs/Transaction";

export const isKV = (o) =>
  typeof o === "object" &&
  o !== null &&
  Object.entries(o).every(
    ([k, v]) => typeof k === "string" && typeof v === "string"
  );

export const JSONReducer = (state, { path, value }) =>
  (path || {}).join(".") === "labels" && value ? value : state;

export const JSONParser = (json) =>
  isKV(json.labels) ? [new Transaction(["labels"], json.labels)] : [];
