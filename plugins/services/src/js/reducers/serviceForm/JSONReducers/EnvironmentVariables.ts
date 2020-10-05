import Transaction from "#SRC/js/structs/Transaction";
import { isKV } from "./Labels";

export const JSONReducer = (state, { path, value }) =>
  (path || {}).join(".") === "env" ? value : state;

export const JSONParser = ({ env }) =>
  isKV(env) ? [new Transaction(["env"], env)] : [];
